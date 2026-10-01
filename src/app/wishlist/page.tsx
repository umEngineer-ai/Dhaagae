'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.discountPrice || item.price,
      discountPrice: item.discountPrice,
      image: item.image,
      size: '4-5Y',
      quantity: 1,
    });
    removeFromWishlist(item.productId);
    showToast(`✓ Moved "${item.name}" to shopping bag!`);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        price: item.discountPrice || item.price,
        discountPrice: item.discountPrice,
        image: item.image,
        size: '4-5Y',
        quantity: 1,
      });
    });
    clearWishlist();
    showToast(`✓ All ${items.length} items moved to shopping bag!`);
  };

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '8px' }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Home</Link>
              <span>/</span>
              <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>Wishlist</span>
            </div>
            <h1 className="display-lg text-plum">Your Wishlist</h1>
            <p className="text-muted text-sm mt-1">
              Pieces saved for your little one&apos;s upcoming celebrations
            </p>
          </div>

          {items.length > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleMoveAllToCart} className="btn btn-primary btn-sm">
                Move All to Bag ({items.length})
              </button>
              <button onClick={clearWishlist} className="btn btn-ghost btn-sm">
                Empty Wishlist
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p className="text-muted">Loading your saved couture...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card card-xl" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(232, 183, 177, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#D4928B' }}>
              <Heart size={32} />
            </div>
            <h2 className="display-sm text-plum mb-2">Your Wishlist is Empty</h2>
            <p className="text-muted text-sm mb-6 max-w-md" style={{ margin: '0 auto 24px' }}>
              Save outfits that catch your eye as you browse our collections, and return here when you&apos;re ready to order.
            </p>
            <Link href="/shop" className="btn btn-primary">
              Explore The Boutique &rarr;
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {items.map((item) => (
              <div
                key={item.productId}
                className="card"
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', backgroundColor: 'var(--cream-soft)' }}>
                  <Link href={`/shop/${item.slug}`}>
                    <Image
                      src={item.image || '/products/floral-bloom-lawn-frock.jpg'}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--charcoal-warm)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>

                {/* Details */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Link
                    href={`/shop/${item.slug}`}
                    style={{
                      textDecoration: 'none',
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--plum-royal)',
                      marginBottom: '6px',
                    }}
                  >
                    {item.name}
                  </Link>

                  <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginBottom: '12px' }}>
                    {item.fabric} &bull; {item.colors}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--plum-royal)' }}>
                      PKR {(item.discountPrice || item.price).toLocaleString()}
                    </span>
                    {item.discountPrice && (
                      <span style={{ fontSize: '12px', color: 'var(--earth-taupe)', textDecoration: 'line-through' }}>
                        PKR {item.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Move to Bag
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="btn btn-ghost btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Toast */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: 'var(--plum-royal)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 80,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}
