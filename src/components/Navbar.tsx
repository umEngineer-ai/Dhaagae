'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'AI Stylist', href: '/ai-assistant' },
    { label: 'Bespoke', href: '/design' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      {/* Announcement Bar */}
      <div
        style={{
          backgroundColor: '#33443A',
          color: 'rgba(255,255,255,0.88)',
          fontSize: '12px',
          letterSpacing: '0.07em',
          padding: '9px 16px',
          textAlign: 'center',
          fontWeight: 400,
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>
          🌿 Handcrafted for little ones · Ages 3–5 · Free delivery over PKR 5,000 ·{' '}
          <strong style={{ color: '#DEC99A', fontWeight: 600 }}>BLOSSOM15</strong>{' '}
          for 15% OFF
        </span>
      </div>

      {/* Main Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          backgroundColor: scrolled ? 'rgba(250,247,240,0.97)' : '#FAF7F0',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #EDE8E1',
          transition: 'all 260ms cubic-bezier(0.16,1,0.3,1)',
          boxShadow: scrolled ? '0 4px 20px rgba(51,68,58,0.08)' : 'none',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              height: '68px',
              gap: '16px',
            }}
          >
            {/* LEFT — Navigation Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isActive(link.href) ? '#33443A' : '#747A72',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    transition: 'all 150ms ease',
                    borderBottom: isActive(link.href) ? '1.5px solid #8FAF9A' : '1.5px solid transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#33443A'; e.currentTarget.style.backgroundColor = 'rgba(143,175,154,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isActive(link.href) ? '#33443A' : '#747A72'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Hamburger */}
            <button
              className="hide-desktop"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px',
              }}
              aria-label="Open menu"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block', width: '22px', height: '1.5px',
                  backgroundColor: '#33443A',
                  transition: 'all 0.2s ease',
                  transform: mobileMenuOpen
                    ? i === 0 ? 'rotate(45deg) translateY(6.5px)'
                    : i === 2 ? 'rotate(-45deg) translateY(-6.5px)'
                    : 'scaleX(0)'
                    : 'none',
                }} />
              ))}
            </button>

            {/* CENTER — Logo */}
            <Link href="/" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              <div
                style={{
                  fontFamily: 'var(--font-brand)',
                  fontSize: '22px',
                  fontWeight: 500,
                  letterSpacing: '0.22em',
                  color: '#33443A',
                  lineHeight: 1,
                }}
              >
                DHAAGAÉ
              </div>
              <div
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.28em',
                  color: '#8FAF9A',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  marginTop: '3px',
                }}
              >
                Couture Atelier
              </div>
            </Link>

            {/* RIGHT — Icon Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                style={{
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  color: '#747A72', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(143,175,154,0.12)'; e.currentTarget.style.color = '#33443A'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#747A72'; }}
                aria-label="Search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                style={{
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  color: '#747A72', textDecoration: 'none', position: 'relative', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(143,175,154,0.12)'; e.currentTarget.style.color = '#33443A'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#747A72'; }}
                aria-label="Wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '5px', minWidth: '16px', height: '16px',
                    backgroundColor: '#E8B7B1', color: '#33443A', fontSize: '9px', fontWeight: 700,
                    borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', lineHeight: 1,
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                style={{
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  color: '#747A72', textDecoration: 'none', position: 'relative', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(143,175,154,0.12)'; e.currentTarget.style.color = '#33443A'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#747A72'; }}
                aria-label="Cart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '5px', minWidth: '16px', height: '16px',
                    backgroundColor: '#8FAF9A', color: '#fff', fontSize: '9px', fontWeight: 700,
                    borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', lineHeight: 1,
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={logout}
                    style={{
                      padding: '7px 14px', fontSize: '12px', fontWeight: 500,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      backgroundColor: 'transparent', color: '#747A72',
                      border: '1px solid #E4DDD3', borderRadius: '6px', cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8FAF9A'; e.currentTarget.style.color = '#33443A'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4DDD3'; e.currentTarget.style.color = '#747A72'; }}
                    className="hide-mobile"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: '7px 16px', fontSize: '12px', fontWeight: 500,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    backgroundColor: '#33443A', color: '#FAF7F0',
                    borderRadius: '6px', cursor: 'pointer',
                    transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#6A9278'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#33443A'; }}
                  className="hide-mobile"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div
            style={{
              borderTop: '1px solid #EDE8E1',
              padding: '16px 24px',
              backgroundColor: '#FAF7F0',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ maxWidth: '540px', margin: '0 auto', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search frocks, fabrics, occasions..."
                autoFocus
                className="input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{
                  padding: '9px 12px', background: 'none', border: '1px solid #E4DDD3',
                  borderRadius: '6px', cursor: 'pointer', color: '#747A72', fontSize: '13px',
                }}
              >
                ✕
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            backgroundColor: 'rgba(51,68,58,0.5)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px',
              backgroundColor: '#FAF7F0', padding: '0 0 32px',
              overflowY: 'auto', display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(51,68,58,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDE8E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ fontFamily: 'var(--font-brand)', fontSize: '18px', letterSpacing: '0.2em', color: '#33443A', textDecoration: 'none' }}>
                DHAAGAÉ
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#747A72' }}>✕</button>
            </div>
            {/* Links */}
            <div style={{ padding: '16px 0', flex: 1 }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'block', padding: '13px 24px',
                    fontSize: '14px', fontWeight: isActive(link.href) ? 600 : 400,
                    color: isActive(link.href) ? '#33443A' : '#747A72',
                    borderLeft: isActive(link.href) ? '3px solid #8FAF9A' : '3px solid transparent',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Mobile Bottom */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #EDE8E1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {user ? (
                <button onClick={logout} className="btn btn-secondary btn-full">Sign Out</button>
              ) : (
                <>
                  <Link href="/login" className="btn btn-primary btn-full" style={{ textAlign: 'center' }}>Sign In</Link>
                  <Link href="/register" className="btn btn-ghost btn-full" style={{ textAlign: 'center' }}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
