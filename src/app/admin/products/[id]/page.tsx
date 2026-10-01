import { requireAdmin } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import AdminProductForm from '@/components/AdminProductForm';

interface EditProductProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Product — Admin | DHAAGAÉ',
  robots: { index: false },
};

export default async function EditProductPage({ params }: EditProductProps) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login?redirect=/admin/products');
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  let imagesList: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed)) imagesList = parsed;
  } catch {
    if (product.images && product.images.startsWith('http')) imagesList = [product.images];
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    discountPrice: product.discountPrice,
    categoryId: product.categoryId,
    availableSizes: product.availableSizes,
    ageRange: product.ageRange,
    colors: product.colors,
    fabric: product.fabric,
    occasion: product.occasion,
    style: product.style,
    stockQuantity: product.stockQuantity,
    sku: product.sku,
    tags: product.tags,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isCustomizable: product.isCustomizable,
    images: imagesList,
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="display-md text-plum">Edit: {product.name}</h1>
              <p className="text-muted text-sm mt-1">
                Update atelier specifications, stock inventory, pricing, and photography.
              </p>
            </div>
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
            >
              👁️ View Live Product &rarr;
            </Link>
          </div>
        </div>

        <AdminProductForm initialData={initialData} isEditing={true} />
      </div>
    </main>
  );
}
