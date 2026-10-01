import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Couture Collections | DHAAGAÉ',
  description:
    'Explore DHAAGAÉ curated collections — Eid Couture, Wedding Royale, Birthday Princess, and Everyday Luxury Frocks.',
};

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', padding: '48px 0 80px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--gold-zari)', textTransform: 'uppercase', fontWeight: 600 }}>
            Curated Seasonal Drops
          </span>
          <h1 className="display-lg text-plum mt-2">The Collections</h1>
          <div className="divider-ornament" />
          <p className="text-muted text-sm mt-3">
            Explore our themed capsules, each honoring a distinct chapter in Pakistani heritage and celebration.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="card card-hover"
              style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 10',
                  backgroundColor: 'var(--cream-soft)',
                }}
              >
                <Image
                  src={
                    cat.image ||
                    '/products/floral-bloom-lawn-frock.jpg'
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(74, 21, 37, 0.85)',
                    color: 'var(--gold-zari)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {cat._count.products} Handcrafted Outfits
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    color: 'var(--plum-royal)',
                    marginBottom: '8px',
                  }}
                >
                  {cat.name}
                </h2>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--charcoal-warm)', marginBottom: '16px' }}>
                  {cat.description || 'Exclusive Pakistani children\'s couture tailored with heritage fabrics.'}
                </p>
                <span
                  style={{
                    marginTop: 'auto',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--plum-royal)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Shop {cat.name} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

