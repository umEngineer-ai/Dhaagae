'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#33443A',
        color: '#F3EEE5',
        borderTop: '2px solid #C9A96E',
        paddingTop: '64px',
        paddingBottom: '32px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Top 4 Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Column 1: Brand & Heritage */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-brand, Cinzel, serif)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#FAF7F0',
                marginBottom: '8px',
              }}
            >
              DHAAGAÉ
            </h3>
            <p
              style={{
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: '#C9A96E',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              Luxury Children&apos;s Couture
            </p>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'rgba(237, 228, 216, 0.8)',
                marginBottom: '20px',
              }}
            >
              Preserving rich Pakistani craftsmanship for little princesses aged 3–5. Each frock is
              hand-stitched with authentic zari, delicate resham threadwork, and heirloom fabrics.
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
              <span style={{ color: '#C9A96E' }}>📍 Lahore Atelier &bull; Islamabad Studio</span>
            </div>
          </div>

          {/* Column 2: The Boutique */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#C9A96E',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              The Collections
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <Link href="/shop?occasion=Eid" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  🌙 Eid Collection 2026
                </Link>
              </li>
              <li>
                <Link href="/shop?occasion=Wedding" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  👑 Wedding & Barat Kalidars
                </Link>
              </li>
              <li>
                <Link href="/shop?category=birthday-collection" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  🎂 Birthday Princess Ballgowns
                </Link>
              </li>
              <li>
                <Link href="/shop?category=everyday-frocks" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  🌿 Everyday Organic Lawn Frocks
                </Link>
              </li>
              <li>
                <Link href="/design" style={{ color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }}>
                  ✂️ Bespoke Custom Frock Designer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Atelier */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#C9A96E',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              Client Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <Link href="/ai-assistant" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  🤖 AI Size & Style Assistant
                </Link>
              </li>
              <li>
                <Link href="/wishlist" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  ❤️ Your Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account/orders" style={{ color: 'rgba(237, 228, 216, 0.8)', textDecoration: 'none' }}>
                  📦 Track Orders & Shipments
                </Link>
              </li>
              <li>
                <span style={{ color: 'rgba(237, 228, 216, 0.6)' }}>
                  💬 WhatsApp Concierge: +92 300 1234567
                </span>
              </li>
              <li>
                <span style={{ color: 'rgba(237, 228, 216, 0.6)' }}>
                  ✉️ Care: concierge@dhaagae.com
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: '#C9A96E',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              The Royal Gazette
            </h4>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(237, 228, 216, 0.8)',
                marginBottom: '16px',
              }}
            >
              Subscribe for private previews of seasonal drops, festive lookbooks, and exclusive atelier invitations.
            </p>

            {subscribed ? (
              <div
                style={{
                  backgroundColor: 'rgba(143, 175, 154, 0.15)',
                  border: '1px solid #8FAF9A',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                ✨ Thank you for subscribing! Your welcome gift code <strong>WELCOME10</strong> is ready.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(201, 169, 110, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#C9A96E',
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 16px',
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Join The Atelier
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(201, 169, 110, 0.2)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: 'rgba(237, 228, 216, 0.6)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} DHAAGAÉ Couture Atelier. Handcrafted in Pakistan. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Cash on Delivery (COD)</span>
            <span>&bull;</span>
            <span>JazzCash</span>
            <span>&bull;</span>
            <span>EasyPaisa</span>
            <span>&bull;</span>
            <span>Visa & Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

