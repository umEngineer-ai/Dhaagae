import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });
    }

    const { productId, rating, comment, imageUrl } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating, and comment are required' }, { status: 400 });
    }

    // Strictly verify if customer has purchased this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: user.id },
      },
    });

    if (!purchase && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only verified customers who have purchased this product can submit a review.' },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        userName: user.name,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment.trim(),
        imageUrl: imageUrl || null,
        isVerifiedPurchase: !!purchase,
        isApproved: true,
      },
    });

    // Update product rating and reviewCount
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ review, message: 'Review submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
