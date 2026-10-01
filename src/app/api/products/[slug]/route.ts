import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: { category: true },
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { slug },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        price: body.price !== undefined ? parseFloat(body.price) : existing.price,
        discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? parseFloat(body.discountPrice) : null) : existing.discountPrice,
        categoryId: body.categoryId ?? existing.categoryId,
        availableSizes: body.availableSizes ?? existing.availableSizes,
        ageRange: body.ageRange ?? existing.ageRange,
        colors: body.colors ?? existing.colors,
        fabric: body.fabric ?? existing.fabric,
        occasion: body.occasion ?? existing.occasion,
        style: body.style ?? existing.style,
        stockQuantity: body.stockQuantity !== undefined ? parseInt(body.stockQuantity, 10) : existing.stockQuantity,
        tags: body.tags ?? existing.tags,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
        isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : existing.isNewArrival,
        isCustomizable: body.isCustomizable !== undefined ? Boolean(body.isCustomizable) : existing.isCustomizable,
        images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : existing.images,
      },
      include: { category: true },
    });

    return NextResponse.json({ product: updated, message: 'Product updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin();
    const { slug } = await params;

    await prisma.product.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
