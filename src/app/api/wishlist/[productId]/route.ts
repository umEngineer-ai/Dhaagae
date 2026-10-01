import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
