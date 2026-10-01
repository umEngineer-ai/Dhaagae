import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' }, { status: 404 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}
