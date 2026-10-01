import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './db';

// Fail loudly at startup if AUTH_SECRET is not set — never fall back to a hardcoded secret
function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not set. Server will not start without it.');
  }
  return secret;
}

export const COOKIE_NAME = 'dhaagae_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

// ─── Password utilities ──────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}

// ─── JWT utilities ───────────────────────────────────────────────────────────

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

/** Short-lived token for password reset (1 hour) */
export function signResetToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'password_reset' }, getJwtSecret(), { expiresIn: '1h' });
}

export function verifyResetToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as {
      userId: string;
      email: string;
      type: string;
    };
    if (payload.type !== 'password_reset') return null;
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// ─── Session utilities ───────────────────────────────────────────────────────

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const publicHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') || process.env.NODE_ENV === 'production';
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: publicHttps,
    sameSite: publicHttps ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        profile: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin authorization required');
  }
  return user;
}
