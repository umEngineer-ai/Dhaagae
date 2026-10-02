'use client';

import { useMemo, useState } from 'react';

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  guestEmail: string | null;
  orderItems: { id: string; productName: string; quantity: number }[];
};

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'CUSTOMIZATION_IN_PROGRESS', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [message, setMessage] = useState<string | null>(null);
  const filtered = useMemo(() => orders.filter((order) => {
    const matchesFilter = filter === 'ALL' || order.status === filter;
    const haystack = `${order.orderNumber} ${order.user?.name || ''} ${order.user?.email || order.guestEmail || ''}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [orders, filter, query]);

  const updateStatus = async (orderNumber: string, status: string) => {
    setMessage(null);
    const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Could not update order'); return; }
    setOrders((current) => current.map((order) => order.orderNumber === orderNumber ? { ...order, status: data.order.status } : order));
    setMessage(`Order #${orderNumber} updated.`);
  };

  return <>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <input className="input" placeholder="Search order or customer" value={query} onChange={(event) => setQuery(event.target.value)} style={{ maxWidth: '320px' }} />
      <select className="input" value={filter} onChange={(event) => setFilter(event.target.value)} style={{ maxWidth: '240px' }}><option value="ALL">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select>
    </div>
    {message && <p role="status" className="text-muted text-sm mb-4">{message}</p>}
    <div className="card card-xl" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead><tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>{['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date'].map((heading) => <th key={heading} className="label" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{heading}</th>)}</tr></thead>
        <tbody>{filtered.map((order) => <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <td style={{ padding: '14px 16px', fontWeight: 500 }}>#{order.orderNumber}</td>
          <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)' }}>{order.user?.name || order.guestEmail || 'Guest'}<br /><small>{order.user?.email || ''}</small></td>
          <td style={{ padding: '14px 16px' }}>{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
          <td style={{ padding: '14px 16px', color: 'var(--plum-royal)', fontWeight: 600 }}>PKR {order.total.toLocaleString()}</td>
          <td style={{ padding: '14px 16px' }}><select className="input" value={order.status} onChange={(event) => updateStatus(order.orderNumber, event.target.value)} style={{ minWidth: '170px', fontSize: '12px' }}>{statuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select></td>
          <td style={{ padding: '14px 16px' }}><span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : order.paymentStatus === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>{order.paymentStatus}</span></td>
          <td style={{ padding: '14px 16px', color: 'var(--earth-taupe)', fontSize: '12px' }}>{new Date(order.createdAt).toLocaleDateString('en-PK')}</td>
        </tr>)}</tbody>
      </table>
      {filtered.length === 0 && <p className="text-muted text-sm" style={{ padding: '24px' }}>No matching orders.</p>}
    </div>
  </>;
}
