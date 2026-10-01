'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    images: string; // JSON or string
    fabric?: string;
    colors?: string;
    occasion?: string;
    stockQuantity?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isCustomizable?: boolean;
    availableSizes?: string;
    shortDescription?: string | null;
    category?: { name: string; slug: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('4-5Y');
  const [addedToast, setAddedToast] = useState(false);

  // Parse images safely
  let imageUrl = '/products/floral-bloom-lawn-frock.jpg';
  let allImages: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) {
      imageUrl = parsed[0];
      allImages = parsed;
    }
  } catch {
    if (product.images && product.images.startsWith('http')) {
      imageUrl = product.images;
      allImages = [product.images];
    }
  }
  if (allImages.length === 0) allImages = [imageUrl];

  const inWishlist = isInWishlist(product.id);

  // Discount percentage calculation
  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const sizes = product.availableSizes
    ? product.availableSizes.split(',').map((s) => s.trim())
    : ['2-3Y', '3-4Y', '4-5Y', '5-6Y'];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discountPrice || product.price,
      discountPrice: product.discountPrice,
      image: imageUrl,
      size: selectedSize || sizes[0] || '4-5Y',
      quantity: 1,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  return (
    <>
      <div
        className="product-card group"
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }}
      >
        {/* Image Container with Badges & Wishlist Trigger */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            backgroundColor: 'var(--cream-soft)',
            overflow: 'hidden',
          }}
        >
          <Link href={`/shop/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Link>

          {/* Badges Stack (Top Left) */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {discountPercent && (
              <span className="badge badge-rose" style={{ fontWeight: 700 }}>
                -{discountPercent}% OFF
              </span>
            )}
            {product.isNewArrival && (
              <span className="badge badge-new" style={{ fontWeight: 600 }}>
                ✨ New
              </span>
            )}
            {product.isFeatured && !product.isNewArrival && (
              <span className="badge badge-gold" style={{ fontWeight: 600 }}>
                👑 Signature
              </span>
            )}
            {product.isCustomizable && (
              <span className="badge badge-cream" style={{ fontSize: '10px', color: 'var(--plum-royal)' }}>
                Bespoke
              </span>
            )}
          </div>

          {/* Wishlist Button (Top Right) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                id: product.id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                discountPrice: product.discountPrice,
                image: imageUrl,
                fabric: product.fabric || 'Pure Fabric',
                colors: product.colors || 'Traditional',
              });
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: inWishlist ? 'var(--rose-dusty, #D98A92)' : 'var(--charcoal-warm)',
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist toggle"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={inWishlist ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick View Button (Shows on Bottom of Image) */}
          <button
            onClick={() => setQuickViewOpen(true)}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              backgroundColor: 'rgba(51, 68, 58, 0.9)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(51,68,58,0.2)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C9A96E')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(74, 21, 37, 0.9)')}
          >
            Quick View
          </button>
        </div>

        {/* Product Details Card Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Category or Fabric meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#C9A96E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category?.name || product.occasion || 'Haute Couture'}
            </span>
            {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
              <span style={{ fontSize: '10px', color: '#c53030', fontWeight: 600 }}>
                Only {product.stockQuantity} left!
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/shop/${product.slug}`}
            style={{
              textDecoration: 'none',
              color: 'var(--plum-royal)',
              fontFamily: 'var(--font-display, serif)',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Link>

          {/* Fabric snippet */}
          {product.fabric && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--earth-taupe)',
                marginBottom: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.fabric}
            </p>
          )}

          {/* Price & Add Action */}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--plum-royal)' }}>
                  PKR {(product.discountPrice || product.price).toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--earth-taupe)',
                      textDecoration: 'line-through',
                    }}
                  >
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              style={{
                background: 'none',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--plum-royal)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--plum-royal)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--plum-royal)';
              }}
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Floating Added Feedback Toast */}
        {addedToast && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--plum-royal)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            ✓ Added to Bag!
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setQuickViewOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--charcoal-warm)',
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {/* Modal Image */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <Image src={imageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} />
            </div>

            {/* Modal Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="badge badge-gold" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                {product.category?.name || 'Exclusive Couture'}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--plum-royal)', marginBottom: '8px' }}>
                {product.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--plum-royal)' }}>
                  PKR {(product.discountPrice || product.price).toLocaleString()}
                </span>
                {product.discountPrice && (
                  <span style={{ fontSize: '14px', color: 'var(--earth-taupe)', textDecoration: 'line-through' }}>
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--charcoal-warm)', marginBottom: '16px' }}>
                {product.shortDescription || 'Exquisitely handcrafted Pakistani children\'s couture. Tailored with love using premium fabrics and intricate traditional embroideries.'}
              </p>

              {/* Sizes Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                  Select Size (Ages 3–5)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: selectedSize === sz ? '2px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                        backgroundColor: selectedSize === sz ? 'var(--cream-soft)' : '#fff',
                        color: 'var(--plum-royal)',
                        cursor: 'pointer',
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={(e) => {
                    handleQuickAdd(e);
                    setQuickViewOpen(false);
                  }}
                  className="btn btn-primary btn-full"
                >
                  Add to Bag • PKR {(product.discountPrice || product.price).toLocaleString()}
                </button>
                <Link
                  href={`/shop/${product.slug}`}
                  className="btn btn-secondary btn-full text-center"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  View Full Product Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

