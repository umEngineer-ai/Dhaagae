import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata = { title: 'Reviews — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminReviewsPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/reviews'); }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true } } },
    take: 50,
  });

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">Reviews</h1></div>
      <div className="card card-xl">
        {reviews.map((r) => (
          <div key={r.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--charcoal-warm)' }}>{r.userName}</p>
                <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '2px' }}>{r.product?.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--foreground)', marginTop: '6px' }}>{r.comment}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--gold-zari)', fontSize: '14px' }}>{'★'.repeat(r.rating)}</span>
                <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', marginTop: '4px' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-PK')}
                </p>
                {r.isVerifiedPurchase && <span className="badge badge-success" style={{ marginTop: '4px' }}>Verified</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
