import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminProductTable from '@/components/AdminProductTable';

export const metadata = {
  title: 'Products Management — Admin | DHAAGAÉ',
  robots: { index: false },
};

export default async function AdminProductsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/login?redirect=/admin/products');
  }

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '6px' }}>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Dashboard</Link>
              <span>/</span>
              <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>Products</span>
            </div>
            <h1 className="display-md text-plum">Atelier Product Management</h1>
            <p className="text-muted text-sm mt-1">
              Oversee the couture collection, update stock availability, modify pricing, and curate drops.
            </p>
          </div>

          <Link href="/admin/products/new" className="btn btn-primary">
            + Add New Couture Frock
          </Link>
        </div>

        {/* Dynamic Interactive Products Table */}
        <AdminProductTable />
      </div>
    </main>
  );
}
