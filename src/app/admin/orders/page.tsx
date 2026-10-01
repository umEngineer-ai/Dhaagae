import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata = { title: 'Orders — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminOrdersPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/orders'); }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, orderItems: true },
    take: 50,
  });

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">All Orders</h1></div>
      <div className="card card-xl" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date'].map((h) => (
                <th key={h} className="label" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>#{order.orderNumber}</td>
                <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)' }}>{order.user?.name || order.guestEmail || 'Guest'}</td>
                <td style={{ padding: '14px 16px' }}>{order.orderItems.length}</td>
                <td style={{ padding: '14px 16px', color: 'var(--plum-royal)', fontWeight: 600 }}>PKR {order.total.toLocaleString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-error' : order.status === 'PENDING' ? 'badge-warning' : 'badge-cream'}`}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : order.paymentStatus === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)', fontSize: '12px' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-PK')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
