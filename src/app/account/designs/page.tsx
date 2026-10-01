import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'My Designs',
  description: 'Your custom AI-designed DHAAGAÉ pieces.',
};

export default async function AccountDesignsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/designs');

  const designs = await prisma.aIDesign.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="container section">
      <div className="mb-8">
        <a href="/account" style={{ fontSize: '13px', color: 'var(--earth-taupe)', textDecoration: 'none', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ← Back to Account
        </a>
        <h1 className="display-md text-plum mt-2">My Designs</h1>
      </div>

      {designs.length === 0 ? (
        <div className="card card-xl">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>
            <h2 className="empty-state-title">No designs yet</h2>
            <p className="empty-state-description">
              Use our AI Design Studio to create your first bespoke piece.
            </p>
            <a href="/design" className="btn btn-primary mt-4">Open Design Studio</a>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {designs.map((design) => (
            <div key={design.id} className="product-card">
              <div className="product-card-image">
                {design.generatedImageUrl ? (
                  <img src={design.generatedImageUrl} alt={design.title} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--cream-soft)' }}>
                    <p className="text-brand" style={{ fontSize: '0.8rem' }}>Bespoke</p>
                  </div>
                )}
              </div>
              <div className="product-card-body">
                <p className="product-card-name">{design.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '4px' }}>
                  {design.occasion} • {design.fabric || 'Custom Fabric'}
                </p>
                <p className="product-card-price" style={{ marginTop: '8px' }}>
                  PKR {design.estimatedPrice.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
