import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata = { title: 'Analytics — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminAnalyticsPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/analytics'); }

  const [aiConversations, aiDesigns, recommendations, totalRevenue, ordersByStatus] = await Promise.all([
    prisma.aIConversation.count(),
    prisma.aIDesign.count(),
    prisma.recommendation.count(),
    prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { total: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
  ]);

  const revenue = totalRevenue.reduce((s, o) => s + o.total, 0);

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">Analytics</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Total Revenue (PKR)', value: revenue.toLocaleString() },
          { label: 'AI Conversations', value: aiConversations },
          { label: 'Custom Designs', value: aiDesigns },
          { label: 'AI Recommendations', value: recommendations },
        ].map((stat) => (
          <div key={stat.label} className="card card-xl" style={{ padding: '24px' }}>
            <p className="label">{stat.label}</p>
            <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--plum-royal)', fontWeight: 600, marginTop: '6px' }}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="card card-xl" style={{ padding: '24px', marginTop: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--charcoal-warm)', marginBottom: '16px' }}>Orders by Status</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {ordersByStatus.map((s) => (
            <div key={s.status} className="badge badge-cream" style={{ fontSize: '13px', padding: '8px 14px', gap: '8px' }}>
              <strong>{s._count.id}</strong> {s.status}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
