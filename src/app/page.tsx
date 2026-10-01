import Link from 'next/link';
import Image from 'next/image';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Sparkles, Feather, Crown, Scissors } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "DHAAGAÉ — Luxury Handmade Children's Couture (Ages 3–5)",
  description:
    'Exquisite Pakistani handcrafted frocks, anarkalis, and couture for little girls aged 3–5. Pure silks, organza, authentic zari embroidery, and bespoke tailoring.',
};

type FeaturedProduct = Prisma.ProductGetPayload<{ include: { category: true } }>;
type HomepageReview = Prisma.ReviewGetPayload<{ include: { product: true } }>;

export default async function HomePage() {
  // Fetch real database records
  let featuredProducts: FeaturedProduct[] = [];
  let newArrivals: FeaturedProduct[] = [];
  let reviews: HomepageReview[] = [];
  try {
    [featuredProducts, newArrivals, reviews] = await Promise.all([
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
      prisma.review.findMany({
        where: { isApproved: true },
        include: { product: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  } catch (error) {
    console.error('Homepage database unavailable; rendering storefront shell:', error);
  }

  const colorPalettes = [
    { name: 'Dusty Rose', color: '#D98A92', query: 'Rose' },
    { name: 'Royal Maroon', color: '#4A1525', query: 'Maroon' },
    { name: 'Mint Green', color: '#98D8AA', query: 'Mint' },
    { name: 'Ivory White', color: '#F7F4EE', textDark: true, query: 'White' },
    { name: 'Sapphire Blue', color: '#1B3B6F', query: 'Blue' },
    { name: 'Mustard Gold', color: '#D4AF37', query: 'Gold' },
  ];

  const occasions = [
    {
      title: 'Eid Festivities',
      subtitle: 'Resham threadwork & gold zari',
      href: '/shop?occasion=Eid',
      img: '/products/teal-heritage-kurta-set.jpg',
    },
    {
      title: 'Weddings & Barat',
      subtitle: 'Regal Jamawar & heavy kalis',
      href: '/shop?occasion=Wedding',
      img: '/products/lavender-bloom-kurta-set.jpg',
    },
    {
      title: 'Birthday Princess',
      subtitle: 'Dreamy ruffled organza & pastels',
      href: '/shop?category=birthday-collection',
      img: '/products/vintage-polka-dot-frock.jpg',
    },
    {
      title: 'Everyday Luxury',
      subtitle: 'Pure breathable organic lawn',
      href: '/shop?category=everyday-frocks',
      img: '/products/floral-bloom-lawn-frock.jpg',
    },
  ];

  return (
    <div style={{ backgroundColor: '#FAF7F0' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 100px',
          background: 'linear-gradient(135deg, #FAF7F0 0%, #F3EEE5 60%, rgba(179,202,187,0.18) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--gold-zari)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--plum-royal)', textTransform: 'uppercase' }}>
                  Handcrafted Couture • Ages 3–5
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  color: 'var(--plum-royal)',
                  marginBottom: '20px',
                }}
              >
                Heirloom Elegance for Your Little Princess
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--charcoal-warm)',
                  marginBottom: '32px',
                  maxWidth: '520px',
                }}
              >
                Each DHAAGAÉ frock is an artisanal masterpiece. Hand-stitched in Pakistan with pure Banarsi
                jamawar, featherlight organza, authentic gold zari, and softest cotton linings for delicate skin.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link href="/shop" className="btn btn-primary btn-lg">
                  Explore The Boutique &rarr;
                </Link>
                <Link href="/design" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Scissors size={16} /> Bespoke Atelier
                </Link>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '24px',
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '18px', color: 'var(--plum-royal)' }}>18+ Hrs</h4>
                  <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', textTransform: 'uppercase' }}>Artisanal Needlework</p>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '18px', color: 'var(--plum-royal)' }}>100%</h4>
                  <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', textTransform: 'uppercase' }}>Pure Cotton Lining</p>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '18px', color: 'var(--plum-royal)' }}>Free COD</h4>
                  <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', textTransform: 'uppercase' }}>Across Pakistan</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4 / 5',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '8px solid #fff',
                }}
              >
                <Image
                  src="/products/rose-garden-tiered-frock.jpg"
                  alt="Rose Garden Tiered Frock - DHAAGAÉ Luxury Children's Couture"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />

                {/* Floating Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--gold-zari)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Artisanal Spring Drop
                    </span>
                    <h3 style={{ fontSize: '15px', color: 'var(--plum-royal)', fontWeight: 600 }}>
                      Rose Garden Tiered Frock
                    </h3>
                  </div>
                  <Link href="/shop/rose-garden-tiered-frock" className="btn btn-primary btn-xs">
                    View &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED FROCKS (REAL DB DATA) */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--gold-zari)', textTransform: 'uppercase', fontWeight: 600 }}>
              Curated By Master Artisans
            </span>
            <h2 className="display-lg text-plum mt-2">Signature Couture Frocks</h2>
            <div className="divider-ornament" />
            <p className="text-muted text-sm mt-3">
              Hand-embellished with heritage resham embroidery, authentic gota ribbons, and delicate tilla vines.
            </p>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/shop?featured=true" className="btn btn-secondary">
              View All Signature Frocks &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY OCCASION */}
      <section style={{ backgroundColor: 'var(--cream-soft)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--plum-royal)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tailored For Cherished Milestones
            </span>
            <h2 className="display-lg text-plum mt-2">Shop By Occasion</h2>
            <div className="divider-ornament" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {occasions.map((occ) => (
              <Link
                key={occ.title}
                href={occ.href}
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
                className="group"
              >
                <Image
                  src={occ.img}
                  alt={occ.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(74, 21, 37, 0.85) 0%, rgba(74, 21, 37, 0.2) 60%, transparent 100%)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2, padding: '24px', width: '100%' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      color: '#fff',
                      marginBottom: '4px',
                    }}
                  >
                    {occ.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--gold-zari)', letterSpacing: '0.04em' }}>
                    {occ.subtitle} &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BESPOKE ATELIER CTA */}
      <section
        style={{
          backgroundColor: 'var(--plum-royal)',
          color: '#fff',
          padding: '80px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '16px' }}>
                Bespoke Couture Atelier
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4vw, 44px)',
                  lineHeight: 1.2,
                  color: '#fff',
                  marginBottom: '20px',
                }}
              >
                Design Your Child&apos;s Dream Frock with DHAAGAÉ AI
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(237, 228, 216, 0.85)',
                  marginBottom: '32px',
                }}
              >
                Select your preferred silhouette, heirloom fabrics (Banarsi silk, organza, velvet), neckline, sleeve
                embellishments, and personalized child monograms. Our master tailors will bring it to life in Lahore.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/design" className="btn btn-gold btn-lg">
                  Open AI Design Studio &rarr;
                </Link>
                <Link href="/ai-assistant" className="btn btn-ghost btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Chat With AI Stylist
                </Link>
              </div>
            </div>

            {/* Atelier Steps */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {[
                { step: '01', title: 'Choose Silhouette', desc: 'Kalidar, Anarkali, Peplum, or Princess Ballgown.' },
                { step: '02', title: 'Pick Pure Fabrics', desc: 'Raw Silk, Tissue Organza, Jamawar, or Cotton Cambric.' },
                { step: '03', title: 'Artisanal Embroidery', desc: 'Resham, Gold Zari, Mukaish, or Pearl Work.' },
                { step: '04', title: 'Custom Measurements', desc: 'Tailored precisely for child ages 2 to 6.' },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '16px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-brand)',
                      color: 'var(--gold-zari)',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{item.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(237, 228, 216, 0.7)', marginTop: '2px' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS (REAL DB DATA) */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--gold-zari)', textTransform: 'uppercase', fontWeight: 600 }}>
                Fresh From The Loom
              </span>
              <h2 className="display-lg text-plum mt-1">New Arrivals</h2>
            </div>
            <Link href="/shop?newArrival=true" className="btn btn-ghost">
              Browse All New &rarr;
            </Link>
          </div>

          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. SHOP BY COLOR PALETTE */}
      <section style={{ backgroundColor: '#fff', padding: '64px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--plum-royal)', textTransform: 'uppercase', fontWeight: 600 }}>
            Curated Hues
          </span>
          <h2 className="display-md text-plum mt-2 mb-8">Shop By Color Palette</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {colorPalettes.map((item) => (
              <Link
                key={item.name}
                href={`/shop?color=${encodeURIComponent(item.query)}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  gap: '8px',
                  transition: 'transform 0.2s',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plum-royal)' }}>
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CRAFTSMANSHIP & HERITAGE */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--gold-zari)', textTransform: 'uppercase', fontWeight: 600 }}>
              The DHAAGAÉ Promise
            </span>
            <h2 className="display-lg text-plum mt-2">Artisanal Craftsmanship</h2>
            <div className="divider-ornament" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              alignItems: 'stretch',
            }}
          >
            <div
              className="card card-hover"
              style={{
                padding: '36px 28px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 169, 110, 0.12)',
                  border: '1px solid rgba(201, 169, 110, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--champagne-deep)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={28} strokeWidth={1.8} style={{ color: '#C9A96E' }} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: 'var(--plum-royal)',
                  marginBottom: '14px',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Master Zardozi Artisans
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--charcoal-warm)',
                  margin: 0,
                  flex: 1,
                }}
              >
                Every motif is meticulously hand-needled by traditional craftsmen in Lahore who have perfected
                the royal art of Mughal threadwork across generations.
              </p>
            </div>

            <div
              className="card card-hover"
              style={{
                padding: '36px 28px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 169, 110, 0.12)',
                  border: '1px solid rgba(201, 169, 110, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--champagne-deep)',
                  flexShrink: 0,
                }}
              >
                <Feather size={28} strokeWidth={1.8} style={{ color: '#C9A96E' }} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: 'var(--plum-royal)',
                  marginBottom: '14px',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Heirloom Fabrics
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--charcoal-warm)',
                  margin: 0,
                  flex: 1,
                }}
              >
                We source pure Banarsi jamawar, Katan raw silk, Korean tissue organza, and superfine organic
                cotton lawn — zero synthetic itchy blends.
              </p>
            </div>

            <div
              className="card card-hover"
              style={{
                padding: '36px 28px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 169, 110, 0.12)',
                  border: '1px solid rgba(201, 169, 110, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--champagne-deep)',
                  flexShrink: 0,
                }}
              >
                <Crown size={28} strokeWidth={1.8} style={{ color: '#C9A96E' }} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: 'var(--plum-royal)',
                  marginBottom: '14px',
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Child-Centric Comfort
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--charcoal-warm)',
                  margin: 0,
                  flex: 1,
                }}
              >
                Crafted specifically for ages 3–5: ultra-soft combed cotton inner lining, tag-less collar seams,
                and lightweight flairs that let little princesses play freely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. REAL CUSTOMER REVIEWS (REAL DB DATA) */}
      {reviews.length > 0 && (
        <section style={{ backgroundColor: 'var(--cream-soft)', padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <span style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--plum-royal)', textTransform: 'uppercase', fontWeight: 600 }}>
                Loved By Mothers Across Pakistan
              </span>
              <h2 className="display-lg text-plum mt-2">Words From Our Clients</h2>
              <div className="divider-ornament" />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius-md)',
                    padding: '28px',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--gold-zari)', fontSize: '16px', letterSpacing: '2px' }}>
                        {'★'.repeat(rev.rating)}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--charcoal-warm)', fontStyle: 'italic', marginBottom: '16px' }}>
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--plum-royal)' }}>
                      {rev.userName}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--earth-taupe)' }}>
                      Purchased: {rev.product.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
