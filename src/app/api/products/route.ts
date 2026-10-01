import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const occasion = searchParams.get('occasion');
    const color = searchParams.get('color');
    const fabric = searchParams.get('fabric');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (newArrival === 'true') {
      where.isNewArrival = true;
    }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'popularity') orderBy = { reviewCount: 'desc' };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      take: limit,
    });

    // In-memory filter for color, occasion, fabric, or keyword search
    let filtered = products;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.colors.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q) ||
          (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    if (occasion) {
      filtered = filtered.filter((p) => p.occasion.toLowerCase().includes(occasion.toLowerCase()));
    }

    if (color) {
      filtered = filtered.filter((p) => p.colors.toLowerCase().includes(color.toLowerCase()));
    }

    if (fabric) {
      filtered = filtered.filter((p) => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
    }

    return NextResponse.json({ products: filtered });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const finalSku = sku || `DHG-${Date.now().toString().slice(-6)}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description: description || '',
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId,
        availableSizes: availableSizes || '2-3Y, 3-4Y, 4-5Y, 5-6Y',
        ageRange: ageRange || '3–5 Years',
        colors: colors || 'Multicolor',
        fabric: fabric || 'Pure Silk',
        occasion: occasion || 'Festive',
        style: style || 'Traditional Frock',
        stockQuantity: parseInt(stockQuantity || '10', 10),
        sku: finalSku,
        tags: tags || '',
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isCustomizable: isCustomizable !== false,
        images: Array.isArray(images) ? JSON.stringify(images) : typeof images === 'string' ? images : '[]',
        inventoryItems: {
          create: {
            quantity: parseInt(stockQuantity || '10', 10),
            reorderLevel: 3,
          },
        },
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ product, message: 'Product created successfully' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    console.error('Create product error:', error);
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
