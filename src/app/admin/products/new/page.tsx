import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminProductForm from '@/components/AdminProductForm';

export const metadata = {
  title: 'Add New Product — Admin | DHAAGAÉ',
  robots: { index: false },
};

export default async function NewProductPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login?redirect=/admin/products/new');
  }

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/admin/products"
            style={{
              fontSize: '13px',
              color: 'var(--earth-taupe)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            &larr; Back to Products Management
          </Link>
          <h1 className="display-md text-plum">Add New Couture Outfit</h1>
          <p className="text-muted text-sm mt-1">
            Create a handcrafted frock record with imagery, fabric specifications, inventory, and pricing.
          </p>
        </div>

        <AdminProductForm />
      </div>
    </main>
  );
}
