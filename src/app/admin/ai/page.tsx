import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata = { title: 'AI Settings — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminAIPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/ai'); }

  const [conversations, designs, recommendations] = await Promise.all([
    prisma.aIConversation.count(),
    prisma.aIDesign.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, estimatedPrice: true, occasion: true, createdAt: true } }),
    prisma.recommendation.count(),
  ]);

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">AI Settings & Insights</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Style Conversations', value: conversations },
          { label: 'Custom Designs', value: designs.length },
          { label: 'Recommendations', value: recommendations },
          { label: 'AI Model', value: 'GPT-4o' },
        ].map((s) => (
          <div key={s.label} className="card card-xl" style={{ padding: '24px' }}>
            <p className="label">{s.label}</p>
            <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--plum-royal)', fontWeight: 600, marginTop: '6px' }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card card-xl">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--charcoal-warm)' }}>Recent AI Designs</h2>
        </div>
        {designs.map((d) => (
          <div key={d.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--charcoal-warm)' }}>{d.title}</p>
              <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '2px' }}>{d.occasion || 'Custom Occasion'}</p>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--plum-royal)', fontSize: '14px' }}>PKR {d.estimatedPrice.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
