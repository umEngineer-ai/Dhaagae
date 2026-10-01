import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signToken, setSessionCookie, validatePasswordStrength } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.message }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone && typeof phone === 'string' ? phone.trim() : null,
        role: 'CUSTOMER',
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'CUSTOMER',
    });

    await setSessionCookie(token);

    return NextResponse.json({ user, message: 'Account created successfully' }, { status: 201 });
  } catch (error) {
    console.error('[REGISTER]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
