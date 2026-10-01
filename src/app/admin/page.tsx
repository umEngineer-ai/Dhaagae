import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Admin Dashboard — DHAAGAÉ',
  description: 'DHAAGAÉ admin dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login?redirect=/admin&reason=auth_required');
  }

  const [
    totalOrders,
    pendingOrders,
    customersCount,
    productsCount,
    paidOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { total: true } }),
    prisma.product.findMany({
      where: { stockQuantity: { lte: 5 } },
      select: { name: true, sku: true, stockQuantity: true },
      take: 5,
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, sub: 'From paid orders', icon: '💰', color: 'var(--gold-zari)' },
    { label: 'Total Orders', value: totalOrders, sub: `${pendingOrders} pending`, icon: '📦', color: 'var(--plum-royal)' },
    { label: 'Customers', value: customersCount, sub: 'Registered accounts', icon: '👥', color: 'var(--rose-dusty)' },
    { label: 'Products', value: productsCount, sub: `${lowStockProducts.length} low stock`, icon: '✂️', color: 'var(--earth-taupe)' },
  ];

  return (
    <main className="container section">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-brand mb-1">Control Centre</p>
          <h1 className="display-md text-plum">Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ New Product</Link>
          <Link href="/shop" className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">View Store ↗</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card card-xl" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal-warm)' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '4px' }}>{stat.sub}</p>
              </div>
              <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="card card-xl">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--charcoal-warm)' }}>Recent Orders</h2>
              <Link href="/admin/orders" style={{ fontSize: '12px', color: 'var(--plum-royal)', textDecoration: 'none', letterSpacing: '0.05em' }}>View All →</Link>
            </div>
            {recentOrders.map((order) => (
              <div key={order.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--charcoal-warm)', fontSize: '14px' }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: '12px', color: 'var(--earth-taupe)' }}>{order.user?.name || order.guestEmail || 'Guest'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${
                    order.status === 'DELIVERED' ? 'badge-success' :
                    order.status === 'CANCELLED' ? 'badge-error' :
                    order.status === 'PENDING' ? 'badge-warning' : 'badge-cream'
                  }`}>
                    {order.status}
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--plum-royal)', fontSize: '13px', marginTop: '3px' }}>
                    PKR {order.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div>
          <div className="card card-xl">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--charcoal-warm)' }}>Low Stock</h2>
            </div>
            {lowStockProducts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--earth-taupe)', fontSize: '13px' }}>
                All products are well stocked ✓
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.sku} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontWeight: 500, fontSize: '13px', color: 'var(--charcoal-warm)' }}>{p.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--earth-taupe)' }}>SKU: {p.sku}</span>
                    <span className={`badge ${p.stockQuantity === 0 ? 'badge-error' : 'badge-warning'}`}>
                      {p.stockQuantity} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Admin nav */}
          <div className="card card-xl" style={{ padding: '20px', marginTop: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--charcoal-warm)', marginBottom: '14px' }}>Quick Links</h2>
            {[
              { href: '/admin/products', label: 'Products' },
              { href: '/admin/orders', label: 'Orders' },
              { href: '/admin/customers', label: 'Customers' },
              { href: '/admin/categories', label: 'Categories' },
              { href: '/admin/reviews', label: 'Reviews' },
              { href: '/admin/analytics', label: 'Analytics' },
              { href: '/admin/ai', label: 'AI Settings' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="dropdown-item" style={{ borderRadius: '8px' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
