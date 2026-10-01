import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stock') || ''; // 'in_stock', 'low_stock', 'out_of_stock'
    const featured = searchParams.get('featured') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    const where: Record<string, unknown> = {};

    if (category) {
      where.categoryId = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    } else if (featured === 'false') {
      where.isFeatured = false;
    }

    if (stockStatus === 'out_of_stock') {
      where.stockQuantity = { lte: 0 };
    } else if (stockStatus === 'low_stock') {
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (stockStatus === 'in_stock') {
      where.stockQuantity = { gt: 5 };
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { fabric: { contains: q } },
        { colors: { contains: q } },
        { occasion: { contains: q } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'stock-asc') orderBy = { stockQuantity: 'asc' };
    else if (sort === 'stock-desc') orderBy = { stockQuantity: 'desc' };
    else if (sort === 'name') orderBy = { name: 'asc' };

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      categoryId,
      availableSizes,
      ageRange,
      colors,
      fabric,
      occasion,
      style,
      stockQuantity,
      sku,
      tags,
      isFeatured,
      isNewArrival,
      isCustomizable,
      images,
    } = body;

    // Server-side validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: 'Valid positive price is required' }, { status: 400 });
    }

    const parsedDiscountPrice =
      discountPrice !== undefined && discountPrice !== null && discountPrice !== ''
        ? parseFloat(discountPrice)
        : null;

    if (parsedDiscountPrice !== null && (isNaN(parsedDiscountPrice) || parsedDiscountPrice >= parsedPrice || parsedDiscountPrice <= 0)) {
      return NextResponse.json(
        { error: 'Discount price must be less than regular price' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const parsedStock = parseInt(stockQuantity || '10', 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: 'Stock quantity cannot be negative' }, { status: 400 });
    }

    let finalSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Check slug collision
    const existingWithSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existingWithSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const finalSku = sku?.trim() || `DHG-${Date.now().toString().slice(-6)}`;

    const imagesJson = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === 'string'
      ? images
      : '[]';

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || '',
        shortDescription: shortDescription?.trim() || null,
        price: parsedPrice,
        discountPrice: parsedDiscountPrice,
        categoryId,
        availableSizes: availableSizes || '2-3Y, 3-4Y, 4-5Y, 5-6Y',
        ageRange: ageRange || '3–5 Years',
        colors: colors || 'Multicolor',
        fabric: fabric || 'Pure Silk',
        occasion: occasion || 'Festive',
        style: style || 'Traditional Frock',
        stockQuantity: parsedStock,
        sku: finalSku,
        tags: tags || '',
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isCustomizable: isCustomizable !== false,
        images: imagesJson,
        inventoryItems: {
          create: {
            quantity: parsedStock,
            reorderLevel: 3,
          },
        },
      },
      include: { category: true },
    });

    return NextResponse.json({ product, message: 'Product created successfully' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
