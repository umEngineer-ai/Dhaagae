import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[LOGOUT]', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
