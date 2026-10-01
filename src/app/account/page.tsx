import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your DHAAGAÉ account — orders, wishlist, addresses, and profile.',
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account');

  return (
    <main className="container section">
      <div className="mb-8">
        <p className="text-brand mb-2">My Account</p>
        <h1 className="display-md text-plum">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-muted mt-2">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'My Orders', href: '/account/orders', icon: '📦', desc: 'Track and manage your orders' },
          { title: 'My Designs', href: '/account/designs', icon: '✨', desc: 'Your custom AI-designed pieces' },
          { title: 'Wishlist', href: '/wishlist', icon: '♡', desc: 'Pieces you love' },
          { title: 'Addresses', href: '/account/addresses', icon: '🏠', desc: 'Saved delivery addresses' },
          { title: 'Profile', href: '/account/profile', icon: '👤', desc: 'Personal details and preferences' },
          { title: 'Notifications', href: '/account/notifications', icon: '🔔', desc: 'Order updates and offers' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="card card-hover"
            style={{ padding: '24px', textDecoration: 'none' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--charcoal-warm)', marginBottom: '4px' }}>
              {item.title}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--earth-taupe)' }}>{item.desc}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
