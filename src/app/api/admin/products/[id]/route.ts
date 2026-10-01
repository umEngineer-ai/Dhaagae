import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productImages: { orderBy: { displayOrder: 'asc' } },
        inventoryItems: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate required fields server-side
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: 'Product name cannot be empty' }, { status: 400 });
    }

    const price = body.price !== undefined ? parseFloat(body.price) : existing.price;
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 });
    }

    const discountPrice =
      body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== ''
        ? parseFloat(body.discountPrice)
        : null;

    if (discountPrice !== null && (isNaN(discountPrice) || discountPrice >= price || discountPrice <= 0)) {
      return NextResponse.json(
        { error: 'Discount price must be less than regular price and greater than 0' },
        { status: 400 }
      );
    }

    const stock =
      body.stockQuantity !== undefined ? parseInt(body.stockQuantity, 10) : existing.stockQuantity;
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: 'Stock quantity cannot be negative' }, { status: 400 });
    }

    const imagesJson = body.images
      ? typeof body.images === 'string'
        ? body.images
        : JSON.stringify(body.images)
      : existing.images;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        slug: body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : existing.slug,
        description: body.description ?? existing.description,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        price,
        discountPrice,
        categoryId: body.categoryId ?? existing.categoryId,
        availableSizes: body.availableSizes ?? existing.availableSizes,
        ageRange: body.ageRange ?? existing.ageRange,
        colors: body.colors ?? existing.colors,
        fabric: body.fabric ?? existing.fabric,
        occasion: body.occasion ?? existing.occasion,
        style: body.style ?? existing.style,
        stockQuantity: stock,
        sku: body.sku ?? existing.sku,
        tags: body.tags ?? existing.tags,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
        isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : existing.isNewArrival,
        isCustomizable: body.isCustomizable !== undefined ? Boolean(body.isCustomizable) : existing.isCustomizable,
        images: imagesJson,
      },
      include: { category: true },
    });

    // Also update inventory record if exists
    await prisma.inventory.upsert({
      where: { id: (await prisma.inventory.findFirst({ where: { productId: id } }))?.id || 'new' },
      update: { quantity: stock },
      create: { productId: id, quantity: stock, reorderLevel: 3 },
    }).catch(() => null);

    return NextResponse.json({ product: updated, message: 'Product updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: Record<string, unknown> = {};

    if (body.stockQuantity !== undefined) {
      const stock = parseInt(body.stockQuantity, 10);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 });
      }
      dataToUpdate.stockQuantity = stock;

      // Update inventory table as well
      await prisma.inventory.updateMany({
        where: { productId: id },
        data: { quantity: stock },
      }).catch(() => null);
    }

    if (body.isFeatured !== undefined) {
      dataToUpdate.isFeatured = Boolean(body.isFeatured);
    }

    if (body.isNewArrival !== undefined) {
      dataToUpdate.isNewArrival = Boolean(body.isNewArrival);
    }

    if (body.isCustomizable !== undefined) {
      dataToUpdate.isCustomizable = Boolean(body.isCustomizable);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({ product: updated, message: 'Product updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
