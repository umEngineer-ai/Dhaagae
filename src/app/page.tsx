import Link from 'next/link';
import Image from 'next/image';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Sparkles, Wand2, Shirt, Palette, ShieldCheck, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dhaagae — AI Fashion, Made for You',
  description:
    'Discover Pakistani fashion, explore curated looks, and create personalized outfits with AI-powered styling and design tools.',
};

type FeaturedProduct = Prisma.ProductGetPayload<{ include: { category: true } }>;

export default async function HomePage() {
  let featuredProducts: FeaturedProduct[] = [];
  let newArrivals: FeaturedProduct[] = [];

  try {
    [featuredProducts, newArrivals] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  } catch (error) {
    console.error('Homepage database unavailable:', error);
  }

  const fallbackProducts = [...featuredProducts, ...newArrivals].filter(
    (product, index, arr) => arr.findIndex((item) => item.id === product.id) === index,
  );

  const heroImages = [
    '/products/rose-garden-tiered-frock.jpg',
    '/products/lavender-bloom-kurta-set.jpg',
    '/products/teal-heritage-kurta-set.jpg',
  ];

  const styleCategories = [
    {
      title: 'Kurtas & Sets',
      subtitle: 'Elegant everyday silhouettes',
      image: '/products/lavender-bloom-kurta-set.jpg',
      href: '/shop?style=Kurta',
    },
    {
      title: 'Festive Frocks',
      subtitle: 'Statement looks for special days',
      image: '/products/rose-garden-tiered-frock.jpg',
      href: '/shop?occasion=Eid',
    },
    {
      title: 'Heritage Edit',
      subtitle: 'Traditional details, modern finish',
      image: '/products/teal-heritage-kurta-set.jpg',
      href: '/shop?style=Traditional',
    },
    {
      title: 'Playful Prints',
      subtitle: 'Fresh colours and joyful patterns',
      image: '/products/vintage-polka-dot-frock.jpg',
      href: '/shop?style=Frock',
    },
  ];

  const features = [
    {
      icon: Wand2,
      title: 'AI Design Studio',
      text: 'Describe your dream outfit and turn the idea into a personalized design.',
      href: '/design',
    },
    {
      icon: Shirt,
      title: 'Curated Fashion',
      text: 'Explore ready-to-wear styles across traditional, festive and playful edits.',
      href: '/shop',
    },
    {
      icon: Sparkles,
      title: 'AI Style Assistant',
      text: 'Get outfit ideas, colour combinations and styling guidance in seconds.',
      href: '/ai-assistant',
    },
  ];

  return (
    <main style={{ background: 'var(--ivory)', overflow: 'hidden' }}>
      {/* HERO */}
      <section
        style={{
          background:
            'radial-gradient(circle at 82% 20%, rgba(232,183,177,.34), transparent 28%), radial-gradient(circle at 12% 70%, rgba(143,175,154,.22), transparent 32%), linear-gradient(135deg,#fbf8f2 0%,#f5eee5 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '54px 0 72px',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.02fr) minmax(420px,.98fr)',
              gap: '56px',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.75)',
                  border: '1px solid var(--border)',
                  color: 'var(--sage-dark)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.13em',
                  textTransform: 'uppercase',
                  marginBottom: 22,
                }}
              >
                <Sparkles size={14} /> AI-powered fashion studio
              </div>

              <h1 className="display-xl" style={{ maxWidth: 720, marginBottom: 20 }}>
                Your style. Your culture. <em style={{ color: 'var(--blush-deep)' }}>Your Dhaagae.</em>
              </h1>

              <p
                style={{
                  maxWidth: 610,
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: 'var(--text-muted)',
                  marginBottom: 30,
                }}
              >
                Discover beautiful Pakistani fashion, create new looks with AI, and turn your ideas into outfits
                designed around your taste.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
                <Link href="/design" className="btn btn-primary btn-xl">
                  Create with AI <Sparkles size={17} />
                </Link>
                <Link href="/shop" className="btn btn-secondary btn-xl">
                  Explore Collection <ArrowRight size={17} />
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px 24px',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <ShieldCheck size={15} /> Personalized styling
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Palette size={15} /> Pakistani-inspired designs
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Wand2 size={15} /> AI-assisted creation
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.15fr .85fr',
                gap: 12,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  minHeight: 590,
                  borderRadius: 28,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '7px solid rgba(255,255,255,.8)',
                }}
              >
                <Image
                  src={heroImages[0]}
                  alt="Dhaagae featured fashion"
                  fill
                  priority
                  sizes="(max-width: 900px) 60vw, 42vw"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 48%, rgba(35,44,39,.72) 100%)',
                  }}
                />
                <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22, color: '#fff' }}>
                  <span style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Featured edit
                  </span>
                  <h2 className="display-sm" style={{ color: '#fff', marginTop: 4 }}>
                    Heritage meets modern
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                {heroImages.slice(1).map((src, index) => (
                  <div
                    key={src}
                    style={{
                      position: 'relative',
                      minHeight: 0,
                      borderRadius: 22,
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-md)',
                      border: '5px solid rgba(255,255,255,.78)',
                    }}
                  >
                    <Image
                      src={src}
                      alt={index === 0 ? 'Lavender kurta set' : 'Teal heritage kurta set'}
                      fill
                      sizes="(max-width: 900px) 30vw, 20vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-FIRST ENTRY POINTS */}
      <section style={{ padding: '28px 0 76px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 16,
            }}
          >
            {features.map(({ icon: Icon, title, text, href }) => (
              <Link
                key={title}
                href={href}
                className="card card-hover"
                style={{
                  padding: 24,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  borderRadius: 18,
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    flex: '0 0 44px',
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--ivory-warm)',
                    color: 'var(--sage-deep)',
                  }}
                >
                  <Icon size={21} />
                </span>
                <span>
                  <strong style={{ display: 'block', color: 'var(--sage-dark)', fontSize: 15, marginBottom: 5 }}>
                    {title}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STYLE CATEGORIES */}
      <section style={{ padding: '10px 0 86px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'end', marginBottom: 28 }}>
            <div>
              <span className="font-brand" style={{ color: 'var(--champagne-deep)', fontSize: 10 }}>
                Explore the edit
              </span>
              <h2 className="display-lg" style={{ color: 'var(--sage-dark)', marginTop: 6 }}>
                Find your next look
              </h2>
            </div>
            <Link href="/collections" className="btn btn-ghost btn-sm">
              View collections <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
              gap: 16,
            }}
          >
            {styleCategories.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="home-category-card"
                style={{
                  position: 'relative',
                  minHeight: 420,
                  overflow: 'hidden',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'end',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Image src={item.image} alt={item.title} fill sizes="25vw" style={{ objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg,transparent 35%,rgba(31,40,35,.78) 100%)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2, padding: 20, color: '#fff' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 25, lineHeight: 1.1 }}>{item.title}</h3>
                  <p style={{ fontSize: 12, opacity: .86, marginTop: 5 }}>{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ background: '#fff', padding: '82px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 38px' }}>
            <span className="font-brand" style={{ color: 'var(--champagne-deep)', fontSize: 10 }}>
              Curated for Dhaagae
            </span>
            <h2 className="display-lg" style={{ color: 'var(--sage-dark)', marginTop: 6 }}>
              Designs worth saving
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 10 }}>
              Explore our latest looks, then open any piece to customize, wishlist, or add it to your bag.
            </p>
          </div>

          {fallbackProducts.length > 0 ? (
            <div
              className="product-grid"
              style={{
                gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
                gap: 18,
              }}
            >
              {fallbackProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '70px 20px',
                border: '1px dashed var(--border)',
                borderRadius: 20,
                color: 'var(--text-muted)',
              }}
            >
              <Search size={28} style={{ margin: '0 auto 10px' }} />
              <p>More curated designs are being added.</p>
              <Link href="/shop" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Browse the shop
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link href="/shop" className="btn btn-secondary">
              Explore all designs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI DESIGN STORY */}
      <section style={{ padding: '92px 0', background: 'var(--sage-dark)', color: '#fff' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) minmax(360px,.8fr)',
              gap: 60,
              alignItems: 'center',
            }}
          >
            <div>
              <span className="font-brand" style={{ color: 'var(--champagne-light)', fontSize: 10 }}>
                Create beyond the catalogue
              </span>
              <h2 className="display-lg" style={{ color: '#fff', margin: '10px 0 18px' }}>
                Have an idea? Let AI shape it into a look.
              </h2>
              <p style={{ color: 'rgba(255,255,255,.74)', maxWidth: 620, fontSize: 15, lineHeight: 1.8 }}>
                Start with a dress type, colour, fabric, neckline or occasion. Dhaagae&apos;s existing AI design
                workflow turns those choices into a structured custom design you can save and revisit.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <Link href="/design" className="btn btn-gold btn-lg">
                  Open Design Studio <Wand2 size={17} />
                </Link>
                <Link
                  href="/ai-assistant"
                  className="btn btn-lg"
                  style={{ color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
                >
                  Ask AI Stylist
                </Link>
              </div>
            </div>

            <div
              style={{
                padding: 26,
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,.16)',
                background: 'rgba(255,255,255,.055)',
              }}
            >
              {[
                ['01', 'Choose a direction', 'Frock, kurta set, festive wear or a completely new idea.'],
                ['02', 'Define the details', 'Colour, fabric, sleeves, neckline, embroidery and occasion.'],
                ['03', 'Save the result', 'Keep your generated concept in your account and continue refining it.'],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr',
                    gap: 14,
                    padding: '18px 0',
                    borderBottom: number !== '03' ? '1px solid rgba(255,255,255,.1)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--champagne-light)', fontFamily: 'var(--font-brand)', fontSize: 12 }}>
                    {number}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 4 }}>{title}</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', lineHeight: 1.6 }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / SEARCH CTA */}
      <section style={{ padding: '76px 0', background: 'var(--ivory-warm)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 28,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="font-brand" style={{ color: 'var(--champagne-deep)', fontSize: 10 }}>
                Start anywhere
              </span>
              <h2 className="display-md" style={{ color: 'var(--sage-dark)', marginTop: 5 }}>
                Shop a look, build a look, or ask AI.
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 13 }}>
                Dhaagae keeps discovery, styling and custom design in one place.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn btn-primary">
                Shop now
              </Link>
              <Link href="/design" className="btn btn-secondary">
                Design with AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-category-card img { transition: transform .55s cubic-bezier(.16,1,.3,1); }
        .home-category-card:hover img { transform: scale(1.055); }
        @media (max-width: 1000px) {
          main > section:first-child > .container > div { grid-template-columns: 1fr !important; }
          .home-category-card { min-height: 360px !important; }
        }
        @media (max-width: 850px) {
          .product-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
          .home-category-card { min-height: 320px !important; }
        }
        @media (max-width: 640px) {
          main > section:first-child { padding-top: 32px !important; }
          .home-category-card { min-height: 260px !important; }
          .container { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </main>
  );
}
