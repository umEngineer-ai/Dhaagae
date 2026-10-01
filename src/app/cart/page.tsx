'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponFeedback(null);

    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponCode('');
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
    setCouponLoading(false);
  };

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '80vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '8px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>Shopping Bag</span>
          </div>
          <h1 className="display-lg text-plum">Your Shopping Bag</h1>
          <p className="text-muted text-sm mt-1">
            Review your handcrafted pieces before reserving atelier delivery.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="card card-xl" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(201, 169, 110, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#C9A96E' }}>
              <ShoppingBag size={32} />
            </div>
            <h2 className="display-sm text-plum mb-2">Your Shopping Bag is Empty</h2>
            <p className="text-muted text-sm mb-6 max-w-md" style={{ margin: '0 auto 24px' }}>
              Explore our boutique collections and add something special for your little one.
            </p>
            <Link href="/shop" className="btn btn-primary">
              Explore The Boutique &rarr;
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
            {/* Left: Cart Items List */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card card-xl" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '20px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid var(--border-subtle)',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Item Image */}
                      <div style={{ position: 'relative', width: '80px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--cream-soft)' }}>
                        <Image
                          src={item.image || '/products/floral-bloom-lawn-frock.jpg'}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <Link
                          href={`/shop/${item.slug}`}
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '17px',
                            fontWeight: 600,
                            color: 'var(--plum-royal)',
                            textDecoration: 'none',
                          }}
                        >
                          {item.name}
                        </Link>
                        <div style={{ fontSize: '13px', color: 'var(--earth-taupe)', marginTop: '4px' }}>
                          Size: <strong>{item.size}</strong>
                        </div>
                        {item.customization && (
                          <span className="badge badge-gold" style={{ marginTop: '6px', fontSize: '10px' }}>
                            Bespoke Tailored
                          </span>
                        )}
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--plum-royal)', marginTop: '6px' }}>
                          PKR {item.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          −
                        </button>
                        <span style={{ padding: '0 8px', fontWeight: 600, fontSize: '13px' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--plum-royal)' }}>
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#c53030',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginTop: '6px',
                            textDecoration: 'underline',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Coupon */}
            <div>
              <div className="card card-xl" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <h3 className="display-sm text-plum mb-4">Summary</h3>

                {/* Coupon Input */}
                <div style={{ marginBottom: '20px' }}>
                  {appliedCoupon ? (
                    <div style={{ backgroundColor: '#def7ec', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#03543f' }}>
                      <span>🎟️ Code: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)</span>
                      <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#9b1c1c', cursor: 'pointer', fontWeight: 600 }}>✕</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. EIDMUBARAK)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="input"
                        style={{ fontSize: '12px', textTransform: 'uppercase' }}
                      />
                      <button type="submit" disabled={couponLoading} className="btn btn-secondary btn-sm">
                        Apply
                      </button>
                    </form>
                  )}

                  {couponFeedback && (
                    <p style={{ fontSize: '12px', marginTop: '6px', color: couponFeedback.type === 'success' ? '#03543f' : '#9b1c1c' }}>
                      {couponFeedback.message}
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--earth-taupe)' }}>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#03543f' }}>
                      <span>Festive Discount</span>
                      <span>-PKR {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--earth-taupe)' }}>Express Shipping</span>
                    <span>{shipping === 0 ? <strong style={{ color: 'var(--gold-zari)' }}>FREE</strong> : `PKR ${shipping.toLocaleString()}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '18px', fontWeight: 700, color: 'var(--plum-royal)' }}>
                    <span>Total Amount</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="btn btn-primary btn-full btn-lg" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Proceed to Checkout &rarr;
                </Link>

                <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', textAlign: 'center', marginTop: '14px' }}>
                  🔒 Cash on Delivery &bull; JazzCash &bull; EasyPaisa &bull; Free Returns
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
