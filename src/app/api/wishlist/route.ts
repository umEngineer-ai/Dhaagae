import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({ items: [] });
    }

    const items = wishlist.items.map((item) => {
      let image = '';
      try {
        const parsed = JSON.parse(item.product.images);
        image = Array.isArray(parsed) ? parsed[0] : '';
      } catch {
        image = item.product.images || '';
      }

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        image,
        fabric: item.product.fabric,
        colors: item.product.colors,
        stockQuantity: item.product.stockQuantity,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to save to your wishlist' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Ensure wishlist exists for user
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    // Check if item already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id },
      });
    }

    return NextResponse.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
  }
}
