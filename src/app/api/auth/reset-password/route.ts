import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyResetToken, hashPassword, validatePasswordStrength } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.message }, { status: 400 });
    }

    const decoded = verifyResetToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user || user.email !== decoded.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[RESET_PASSWORD]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
