'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import AskAIModal from './AskAIModal';

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    discountPrice?: number | null;
    availableSizes: string;
    ageRange: string;
    colors: string;
    fabric: string;
    occasion: string;
    style: string;
    stockQuantity: number;
    sku: string;
    isCustomizable: boolean;
    images: string;
    rating: number;
    reviewCount: number;
    category?: { id: string; name: string; slug: string } | null;
    reviews: ReviewItem[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // Images parse
  let imagesList: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) {
      imagesList = parsed;
    }
  } catch {
    if (product.images && product.images.startsWith('http')) {
      imagesList = [product.images];
    }
  }
  if (imagesList.length === 0) {
    imagesList = ['/products/floral-bloom-lawn-frock.jpg'];
  }

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const sizes = product.availableSizes
    ? product.availableSizes.split(',').map((s) => s.trim())
    : ['2-3Y', '3-4Y', '4-5Y', '5-6Y'];

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '4-5Y');
  const [quantity, setQuantity] = useState(1);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review submission state
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(product.reviews || []);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isWishlisted = isInWishlist(product.id);
  const effectivePrice = product.discountPrice || product.price;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock.');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      discountPrice: product.discountPrice,
      image: imagesList[0],
      size: selectedSize,
      quantity,
    });
    showToast(`✓ Added ${quantity} × ${product.name} (${selectedSize}) to your bag`);
  };

  const handleBuyNow = () => {
    if (product.stockQuantity <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      discountPrice: product.discountPrice,
      image: imagesList[0],
      size: selectedSize,
      quantity,
    });
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewFeedback({ type: 'error', message: 'Please log in to submit a review.' });
      return;
    }
    if (!reviewComment.trim()) {
      setReviewFeedback({ type: 'error', message: 'Please write a review comment.' });
      return;
    }

    setSubmittingReview(true);
    setReviewFeedback(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewFeedback({ type: 'success', message: 'Thank you! Your verified review has been published.' });
        setReviewsList([data.review, ...reviewsList]);
        setReviewComment('');
      } else {
        setReviewFeedback({ type: 'error', message: data.error || 'Failed to submit review' });
      }
    } catch {
      setReviewFeedback({ type: 'error', message: 'Network error submitting review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Stock status text & class
  let stockBadge = (
    <span className="badge badge-success" style={{ fontSize: '12px' }}>
      ✓ In Stock ({product.stockQuantity} available)
    </span>
  );
  if (product.stockQuantity <= 0) {
    stockBadge = (
      <span className="badge badge-error" style={{ fontSize: '12px' }}>
        ✕ Out of Stock (Bespoke order only)
      </span>
    );
  } else if (product.stockQuantity <= 5) {
    stockBadge = (
      <span className="badge badge-warning" style={{ fontSize: '12px' }}>
        ⚠️ Low Stock — Only {product.stockQuantity} left in atelier!
      </span>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', marginBottom: '64px' }}>
        {/* Left: Gallery */}
        <div>
          {/* Main Large Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 5',
              backgroundColor: 'var(--cream-soft)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <Image
              src={imagesList[selectedImageIndex] || imagesList[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />

            {/* Wishlist Button on Main Image */}
            <button
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  image: imagesList[0],
                  fabric: product.fabric,
                  colors: product.colors,
                })
              }
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isWishlisted ? 'var(--rose-dusty)' : 'var(--charcoal-warm)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    position: 'relative',
                    width: '76px',
                    height: '92px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: selectedImageIndex === idx ? '2px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                    opacity: selectedImageIndex === idx ? 1 : 0.6,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Attributes & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Category & SKU */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Link
              href={`/shop?category=${product.category?.slug || ''}`}
              style={{
                fontSize: '12px',
                color: 'var(--gold-zari)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textDecoration: 'none',
              }}
            >
              {product.category?.name || 'Exclusive Couture'}
            </Link>
            <span style={{ fontSize: '11px', color: 'var(--earth-taupe)', fontFamily: 'monospace' }}>
              SKU: {product.sku}
            </span>
          </div>

          {/* Product Name */}
          <h1 className="display-md text-plum" style={{ marginBottom: '12px' }}>
            {product.name}
          </h1>

          {/* Price & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--plum-royal)' }}>
                PKR {effectivePrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span style={{ fontSize: '16px', color: 'var(--earth-taupe)', textDecoration: 'line-through' }}>
                  PKR {product.price.toLocaleString()}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--gold-zari)', fontSize: '16px' }}>{'★'.repeat(Math.round(product.rating || 5))}</span>
              <span style={{ fontSize: '12px', color: 'var(--earth-taupe)' }}>
                ({reviewsList.length} reviews)
              </span>
            </div>
          </div>

          {/* Stock Status Badge */}
          <div style={{ marginBottom: '20px' }}>{stockBadge}</div>

          {/* Short Description */}
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--charcoal-warm)', marginBottom: '24px' }}>
            {product.shortDescription || product.description.slice(0, 180) + '...'}
          </p>

          {/* Specifications Table */}
          <div
            style={{
              backgroundColor: 'var(--cream-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ color: 'var(--earth-taupe)' }}>Fabric: </span>
              <strong>{product.fabric}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--earth-taupe)' }}>Color: </span>
              <strong>{product.colors}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--earth-taupe)' }}>Occasion: </span>
              <strong>{product.occasion}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--earth-taupe)' }}>Age Range: </span>
              <strong>{product.ageRange}</strong>
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="label">Select Size (Child Ages 3–5)</label>
              <button
                onClick={() => setAiModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--plum-royal)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                📐 Ask AI Size Assistant
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedSize === s ? '2px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedSize === s ? 'var(--cream-soft)' : '#fff',
                    color: 'var(--plum-royal)',
                    transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Add to Bag */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span style={{ padding: '0 12px', fontWeight: 600, fontSize: '14px' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {product.stockQuantity > 0 ? `Add to Bag • PKR ${(effectivePrice * quantity).toLocaleString()}` : 'Out of Stock'}
            </button>
          </div>

          {/* Buy Now & Customize Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity <= 0}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              ⚡ Instant Checkout / Buy Now
            </button>

            {product.isCustomizable && (
              <Link
                href={`/design?product=${product.slug}`}
                className="btn btn-gold"
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
              >
                ✂️ Customize This Frock
              </Link>
            )}
          </div>

          {/* Ask DHAAGAÉ AI Assistant CTA Box */}
          <div
            style={{
              border: '1px solid var(--gold-zari)',
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <h4 style={{ fontFamily: 'var(--font-brand)', fontSize: '14px', color: 'var(--plum-royal)', marginBottom: '4px' }}>
                Ask DHAAGAÉ AI About This Outfit
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--charcoal-warm)' }}>
                Get instant advice on child sizing, occasion suitability, and matching accessories.
              </p>
            </div>
            <button
              onClick={() => setAiModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              Ask AI &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Full Description & Care Tabs */}
      <div className="card" style={{ padding: '36px', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', marginBottom: '64px' }}>
        <h3 className="display-sm text-plum mb-4">Artisanal Details & Craftsmanship</h3>
        <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--charcoal-warm)', marginBottom: '24px' }}>
          {product.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plum-royal)', marginBottom: '6px' }}>
              🌿 Inner Lining Guarantee
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', lineHeight: 1.6 }}>
              Lined throughout with 100% fine Pakistani combed cotton lawn. Zero scratchiness, completely breathable for sensitive toddler skin.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plum-royal)', marginBottom: '6px' }}>
              🧺 Garment Care Instructions
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', lineHeight: 1.6 }}>
              Dry clean only recommended for silk and organza garments to protect delicate zardozi threadwork. Iron inside-out with low steam.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plum-royal)', marginBottom: '6px' }}>
              🚚 Delivery & Returns
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', lineHeight: 1.6 }}>
              Dispatched within 24–48 hours across Pakistan via tracked express courier. Easy size exchange within 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="card" style={{ padding: '36px', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h3 className="display-sm text-plum">Customer Reviews</h3>
            <p style={{ fontSize: '13px', color: 'var(--earth-taupe)', marginTop: '4px' }}>
              Verified reviews from clients who purchased this couture piece
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plum-royal)' }}>
              {product.rating.toFixed(1)}
            </span>
            <span style={{ color: 'var(--gold-zari)', fontSize: '18px' }}>{'★'.repeat(Math.round(product.rating))}</span>
            <span style={{ fontSize: '13px', color: 'var(--earth-taupe)' }}>
              ({reviewsList.length} verified ratings)
            </span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {reviewsList.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--earth-taupe)', fontStyle: 'italic' }}>
              No reviews yet. Be the first verified customer to leave a review!
            </p>
          ) : (
            reviewsList.map((rev) => (
              <div
                key={rev.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--plum-royal)' }}>
                      {rev.userName}
                    </span>
                    {rev.isVerifiedPurchase && (
                      <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '10px' }}>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--gold-zari)', fontSize: '14px' }}>{'★'.repeat(rev.rating)}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--charcoal-warm)' }}>
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Review Submission Form */}
        <div style={{ backgroundColor: 'var(--cream-soft)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--plum-royal)', marginBottom: '8px' }}>
            Leave a Verified Customer Review
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginBottom: '16px' }}>
            Note: In accordance with atelier policy, review eligibility is strictly validated against completed purchases.
          </p>

          {reviewFeedback && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '13px',
                backgroundColor: reviewFeedback.type === 'success' ? '#def7ec' : '#fde8e8',
                color: reviewFeedback.type === 'success' ? '#03543f' : '#9b1c1c',
                border: `1px solid ${reviewFeedback.type === 'success' ? '#31c48d' : '#f98080'}`,
              }}
            >
              {reviewFeedback.message}
            </div>
          )}

          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    type="button"
                    key={stars}
                    onClick={() => setReviewRating(stars)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: reviewRating === stars ? 'var(--plum-royal)' : '#fff',
                      color: reviewRating === stars ? '#fff' : 'var(--gold-zari)',
                      fontWeight: 600,
                    }}
                  >
                    {'★'.repeat(stars)} ({stars} Star)
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Your Experience</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts on the fabric quality, stitching, fit for your child..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="textarea"
                style={{ width: '100%', fontSize: '13px', backgroundColor: '#fff' }}
                required
              />
            </div>

            <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
              {submittingReview ? 'Verifying Purchase & Submitting...' : 'Submit Verified Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Ask AI Modal */}
      <AskAIModal
        product={{
          id: product.id,
          name: product.name,
          price: effectivePrice,
          fabric: product.fabric,
          colors: product.colors,
          occasion: product.occasion,
          ageRange: product.ageRange,
        }}
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--plum-royal)',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 80,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}

