import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata = { title: 'Customers — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminCustomersPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/customers'); }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, createdAt: true, orders: { select: { total: true } } },
  });

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">Customers ({customers.length})</h1></div>
      <div className="card card-xl" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              {['Name', 'Email', 'Phone', 'Orders', 'Lifetime Value', 'Joined'].map((h) => (
                <th key={h} className="label" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--charcoal-warm)' }}>{c.name}</td>
                <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)' }}>{c.email}</td>
                <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)' }}>{c.phone || '—'}</td>
                <td style={{ padding: '14px 16px' }}>{c.orders.length}</td>
                <td style={{ padding: '14px 16px', color: 'var(--plum-royal)', fontWeight: 600 }}>
                  PKR {c.orders.reduce((s, o) => s + o.total, 0).toLocaleString()}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)', fontSize: '12px' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-PK')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
