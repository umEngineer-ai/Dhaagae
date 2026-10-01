import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signResetToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Always return success — don't reveal whether email exists (prevents enumeration)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const resetToken = signResetToken(user.id, user.email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      // In a real deployment, use EMAIL_API_KEY (Resend) to send the email.
      // For now, log the reset URL so you can test without email setup.
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PASSWORD RESET] Reset URL for ${user.email}: ${resetUrl}`);
      }

      // TODO: integrate Resend email here once EMAIL_API_KEY is configured
      // import { sendPasswordResetEmail } from '@/lib/email';
      // await sendPasswordResetEmail(user.email, user.name, resetUrl);
    }

    // Always respond with success
    return NextResponse.json({
      message: 'If an account with this email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
