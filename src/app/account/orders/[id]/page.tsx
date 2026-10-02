import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Order Details',
};

export default async function OrderDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: id,
      userId: user.id, // Security: only own orders
    },
    include: {
      orderItems: {
        include: {
          product: { select: { name: true, slug: true } },
          orderCustomization: true,
        },
      },
      payments: true,
    },
  });

  if (!order) notFound();

  return (
    <main className="container section">
      <div className="mb-8">
        <Link href="/account/orders" style={{ fontSize: '13px', color: 'var(--earth-taupe)', textDecoration: 'none', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ← Back to Orders
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
          <h1 className="display-md text-plum">Order #{order.orderNumber}</h1>
          <span className={`badge ${
            order.status === 'DELIVERED' ? 'badge-success' :
            order.status === 'CANCELLED' ? 'badge-error' :
            order.status === 'PENDING' ? 'badge-warning' : 'badge-cream'
          } badge`} style={{ fontSize: '13px', padding: '6px 14px' }}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-muted" style={{ marginTop: '4px', fontSize: '14px' }}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order items */}
        <div className="lg:col-span-2">
          <div className="card card-xl" style={{ overflow: 'visible' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--charcoal-warm)' }}>
                Items Ordered
              </h2>
            </div>
            {order.orderItems.map((item) => (
              <div key={item.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, color: 'var(--charcoal-warm)', fontSize: '14px' }}>
                      {item.productName}
                    </p>
                    {item.size && (
                      <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '2px' }}>
                        Size: {item.size} {item.color ? `• ${item.color}` : ''}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '2px' }}>
                      Qty: {item.quantity}
                    </p>
                    {item.orderCustomization && (
                      <span className="badge badge-gold" style={{ marginTop: '6px', fontSize: '10px' }}>
                        Customized
                      </span>
                    )}
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--plum-royal)', whiteSpace: 'nowrap', fontSize: '14px' }}>
                    PKR {item.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="card card-xl" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--charcoal-warm)', marginBottom: '20px' }}>
              Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Subtotal</span>
                <span>PKR {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Discount</span>
                  <span style={{ color: 'var(--rose-deep)' }}>−PKR {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : `PKR ${order.shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
                <span>Total</span>
                <span className="text-plum">PKR {order.total.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--cream-soft)', borderRadius: '8px', fontSize: '13px', color: 'var(--earth-taupe)' }}>
                Payment: <strong>{order.paymentMethod}</strong> —{' '}
                <span style={{ color: order.paymentStatus === 'PAID' ? '#2E7D32' : 'var(--earth-taupe)' }}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
