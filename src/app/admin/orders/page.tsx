import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import AdminOrdersClient from '@/components/AdminOrdersClient';

export const metadata = { title: 'Orders — Admin | DHAAGAÉ', robots: { index: false } };

export default async function AdminOrdersPage() {
  try { await requireAdmin(); } catch { redirect('/login?redirect=/admin/orders'); }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, orderItems: { select: { id: true, productName: true, quantity: true } } },
    take: 100,
  });

  return (
    <main className="container section">
      <div className="mb-6"><h1 className="display-md text-plum">All Orders</h1><p className="text-muted text-sm mt-2">Review customers, payment state, and controlled fulfilment status transitions.</p></div>
      <AdminOrdersClient initialOrders={orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString() }))} />
    </main>
  );
}
