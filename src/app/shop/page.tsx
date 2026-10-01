import type { Metadata } from 'next';
import prisma from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ShopFilters from '@/components/ShopFilters';
import Link from 'next/link';

interface ShopProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    age?: string;
    color?: string;
    occasion?: string;
    fabric?: string;
    customizable?: string;
    availability?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopProps): Promise<Metadata> {
  const params = await searchParams;
  let title = 'The Boutique — Handcrafted Children\'s Frocks';
  if (params.category) {
    const cat = await prisma.category.findUnique({ where: { slug: params.category }, select: { name: true } });
    if (cat) title = `${cat.name} — DHAAGAÉ Couture`;
  } else if (params.occasion) {
    title = `${params.occasion} Frocks Collection — DHAAGAÉ`;
  } else if (params.search) {
    title = `Search: "${params.search}" — DHAAGAÉ Boutique`;
  }

  return {
    title,
    description: 'Explore our heirloom collection of Pakistani handcrafted frocks, anarkalis, and dresses for little princesses aged 3–5.',
  };
}

export default async function ShopPage({ searchParams }: ShopProps) {
  const params = await searchParams;
  const search = params.search?.trim() || '';
  const categorySlug = params.category || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const age = params.age || '';
  const color = params.color || '';
  const occasion = params.occasion || '';
  const fabric = params.fabric || '';
  const customizable = params.customizable === 'true';
  const inStockOnly = params.availability === 'in_stock';
  const featuredOnly = params.featured === 'true';
  const sort = params.sort || 'newest';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const pageSize = 12;

  // Build Prisma where query
  const where: Record<string, unknown> = {};

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (customizable) {
    where.isCustomizable = true;
  }

  if (featuredOnly) {
    where.isFeatured = true;
  }

  if (inStockOnly) {
    where.stockQuantity = { gt: 0 };
  }

  // Text matching for search, color, occasion, fabric, age
  const andConditions: Array<Record<string, unknown>> = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { colors: { contains: search } },
        { fabric: { contains: search } },
        { occasion: { contains: search } },
        { tags: { contains: search } },
      ],
    });
  }

  if (color) {
    andConditions.push({ colors: { contains: color } });
  }

  if (occasion) {
    andConditions.push({ occasion: { contains: occasion } });
  }

  if (fabric) {
    andConditions.push({ fabric: { contains: fabric } });
  }

  if (age) {
    andConditions.push({
      OR: [
        { availableSizes: { contains: age } },
        { ageRange: { contains: age } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Order by
  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  else if (sort === 'price-desc') orderBy = { price: 'desc' };
  else if (sort === 'popular') orderBy = { reviewCount: 'desc' };

  // Run database queries
  const [totalProducts, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  // Helper for pagination links
  const createPageUrl = (page: number) => {
    const p = new URLSearchParams();
    if (params.search) p.set('search', params.search);
    if (params.category) p.set('category', params.category);
    if (params.minPrice) p.set('minPrice', params.minPrice);
    if (params.maxPrice) p.set('maxPrice', params.maxPrice);
    if (params.age) p.set('age', params.age);
    if (params.color) p.set('color', params.color);
    if (params.occasion) p.set('occasion', params.occasion);
    if (params.fabric) p.set('fabric', params.fabric);
    if (params.customizable) p.set('customizable', params.customizable);
    if (params.availability) p.set('availability', params.availability);
    if (params.featured) p.set('featured', params.featured);
    if (params.sort) p.set('sort', params.sort);
    p.set('page', page.toString());
    return `/shop?${p.toString()}`;
  };

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--earth-taupe)', marginBottom: '12px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>The Boutique</span>
            {categorySlug && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--plum-royal)' }}>
                  {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                </span>
              </>
            )}
          </div>

          <h1 className="display-lg text-plum">
            {categorySlug
              ? categories.find((c) => c.slug === categorySlug)?.name || 'The Boutique'
              : occasion
              ? `${occasion} Collection`
              : 'The Boutique'}
          </h1>
          <p className="text-muted mt-2 text-sm max-w-xl">
            Pure silks, gossamer organza, and artisanal zari needlework crafted for your little one&apos;s
            most cherished celebrations.
          </p>
        </div>

        {/* Filters Top Bar */}
        <ShopFilters categories={categories} totalProducts={totalProducts} />

        {/* Main Content: Sidebar + Products Grid */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Products Grid or Empty State */}
          <div style={{ flex: 1 }}>
            {products.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '64px 32px',
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
                <h3 className="display-sm text-plum mb-2">No Outfits Found</h3>
                <p className="text-muted text-sm mb-6 max-w-md" style={{ margin: '0 auto 24px' }}>
                  We couldn&apos;t find any outfits matching your selected criteria. Try removing some filters or
                  searching for broader terms.
                </p>
                <Link href="/shop" className="btn btn-primary">
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '48px',
                    }}
                  >
                    {currentPage > 1 && (
                      <Link href={createPageUrl(currentPage - 1)} className="btn btn-secondary btn-sm">
                        &larr; Previous
                      </Link>
                    )}
                    <span style={{ fontSize: '13px', color: 'var(--earth-taupe)', fontWeight: 600 }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Link href={createPageUrl(currentPage + 1)} className="btn btn-secondary btn-sm">
                        Next &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
