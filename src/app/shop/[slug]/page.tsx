import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductDetailClient from '@/components/ProductDetailClient';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return { title: 'Product Not Found | DHAAGAÉ' };

  let mainImage = '/products/floral-bloom-lawn-frock.jpg';
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
  } catch {
    if (product.images && product.images.startsWith('http')) mainImage = product.images;
  }

  const title = `${product.name} — Luxury Children's Couture | DHAAGAÉ`;
  const description =
    product.shortDescription ||
    `${product.name} handcrafted in pure ${product.fabric} for ${product.occasion}. Suitable for ages ${product.ageRange}. Available at DHAAGAÉ.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: mainImage, width: 800, height: 1000, alt: product.name }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Related products query based on category, occasion, or matching colors
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      OR: [
        { categoryId: product.categoryId },
        { occasion: { contains: product.occasion.split(',')[0].trim() } },
        { colors: { contains: product.colors.split(',')[0].trim() } },
      ],
    },
    take: 4,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  let mainImage = '/products/floral-bloom-lawn-frock.jpg';
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
  } catch {
    if (product.images && product.images.startsWith('http')) mainImage = product.images;
  }

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: mainImage,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'DHAAGAÉ Couture',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.discountPrice || product.price,
      availability:
        product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://dhaagae.com/shop/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: Math.max(1, product.reviewCount),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://dhaagae.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'The Boutique',
        item: 'https://dhaagae.com/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category?.name || 'Collection',
        item: `https://dhaagae.com/shop?category=${product.category?.slug || ''}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://dhaagae.com/shop/${product.slug}`,
      },
    ],
  };

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', padding: '32px 0 80px' }}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container">
        {/* Breadcrumb Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Home</Link>
          <span>/</span>
          <Link href="/shop" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>The Boutique</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Interactive Client Component */}
        <ProductDetailClient product={product} />

        {/* Related Products Section (Real DB Data) */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '48px', borderTop: '1px solid var(--border-subtle)', paddingTop: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--gold-zari)', textTransform: 'uppercase', fontWeight: 600 }}>
                You May Also Adore
              </span>
              <h2 className="display-sm text-plum mt-1">Complementary Creations</h2>
            </div>

            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

