import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track and view all your DHAAGAÉ orders.',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: { include: { product: { select: { name: true } } } },
    },
  });

  return (
    <main className="container section">
      <div className="mb-8">
        <Link href="/account" style={{ fontSize: '13px', color: 'var(--earth-taupe)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          ← Back to Account
        </Link>
        <h1 className="display-md text-plum">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="card card-xl">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
            </div>
            <h2 className="empty-state-title">No orders yet</h2>
            <p className="empty-state-description">
              Your order history will appear here once you place your first order.
            </p>
            <Link href="/shop" className="btn btn-primary mt-4">Shop Collection</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="card card-hover"
              style={{ padding: '20px 24px', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--charcoal-warm)', fontSize: '14px' }}>
                    Order #{order.orderNumber}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--earth-taupe)', marginTop: '2px' }}>
                    {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} •{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${
                    order.status === 'DELIVERED' ? 'badge-success' :
                    order.status === 'CANCELLED' ? 'badge-error' :
                    order.status === 'PENDING' ? 'badge-warning' : 'badge-cream'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--plum-royal)', fontSize: '14px', marginTop: '4px' }}>
                    PKR {order.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
