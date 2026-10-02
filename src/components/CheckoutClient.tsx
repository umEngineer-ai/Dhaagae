'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = ['Customer', 'Address', 'Delivery', 'Payment', 'Review'];

export default function CheckoutClient() {
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    deliveryInstructions: '',
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const visibleTotal = useMemo(() => total, [total]);

  if (orderNumber) {
    return (
      <main className="container section-sm">
        <div className="card card-xl p-8 text-center">
          <p className="text-brand mb-2">Order Confirmed</p>
          <h1 className="display-md text-plum">Your atelier order is reserved</h1>
          <p className="text-muted mt-3">Order <strong>#{orderNumber}</strong> has been placed. We will contact you with the next update.</p>
          <div className="flex justify-center gap-3 mt-6" style={{ flexWrap: 'wrap' }}>
            {user && <Link href={`/account/orders/${orderNumber}`} className="btn btn-primary">View Order</Link>}
            <Link href="/shop" className="btn btn-ghost">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container section-sm">
        <div className="card card-xl p-8 text-center">
          <h1 className="display-md text-plum">Your bag is empty</h1>
          <p className="text-muted mt-2">Add a handcrafted piece before starting checkout.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  const validateStep = () => {
    setError(null);
    if (step === 1 && (!form.customerName.trim() || !form.customerEmail.includes('@') || !form.customerPhone.trim())) {
      setError('Please enter your name, a valid email, and phone number.');
      return false;
    }
    if (step === 2 && (!form.fullName.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.province.trim())) {
      setError('Please complete the required shipping address fields.');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            customization: item.customization,
          })),
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || undefined,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode || undefined,
            deliveryInstructions: form.deliveryInstructions || undefined,
            deliveryMethod: form.deliveryMethod,
          },
          paymentMethod: form.paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'We could not place the order. Please try again.');
      clearCart();
      setOrderNumber(data.order.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container section-sm">
      <div className="mb-8">
        <Link href="/cart" className="text-muted text-sm">← Back to bag</Link>
        <p className="text-brand mt-4 mb-2">Almost There</p>
        <h1 className="display-md text-plum">Checkout</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: '32px', alignItems: 'start' }}>
        <section className="card card-xl p-6">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto' }}>
            {steps.map((label, index) => {
              const number = index + 1;
              return <button key={label} type="button" onClick={() => number < step && setStep(number as Step)} style={{ border: 'none', background: 'none', color: number === step ? 'var(--plum-royal)' : 'var(--earth-taupe)', fontWeight: number === step ? 700 : 500, whiteSpace: 'nowrap', cursor: number < step ? 'pointer' : 'default' }}>{number}. {label}</button>;
            })}
          </div>

          {step === 1 && <FormSection title="Customer Information">
            <Field label="Full name" value={form.customerName} onChange={(v) => update('customerName', v)} />
            <Field label="Email" type="email" value={form.customerEmail} onChange={(v) => update('customerEmail', v)} />
            <Field label="Phone" value={form.customerPhone} onChange={(v) => update('customerPhone', v)} />
          </FormSection>}

          {step === 2 && <FormSection title="Shipping Address">
            <Field label="Recipient name" value={form.fullName} onChange={(v) => update('fullName', v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
            <Field label="Address" value={form.addressLine1} onChange={(v) => update('addressLine1', v)} />
            <Field label="Apartment / landmark (optional)" value={form.addressLine2} onChange={(v) => update('addressLine2', v)} />
            <Field label="City" value={form.city} onChange={(v) => update('city', v)} />
            <Field label="Province" value={form.province} onChange={(v) => update('province', v)} />
            <Field label="Postal code" value={form.postalCode} onChange={(v) => update('postalCode', v)} />
            <Field label="Delivery instructions (optional)" value={form.deliveryInstructions} onChange={(v) => update('deliveryInstructions', v)} />
          </FormSection>}

          {step === 3 && <FormSection title="Delivery">
            <Choice label="Standard delivery — PKR 250 or free over PKR 5,000" checked={form.deliveryMethod === 'STANDARD'} onChange={() => update('deliveryMethod', 'STANDARD')} />
          </FormSection>}

          {step === 4 && <FormSection title="Payment">
            <Choice label="Cash on Delivery — payment collected at delivery" checked={form.paymentMethod === 'COD'} onChange={() => update('paymentMethod', 'COD')} />
            <Choice label="Online payment — available after gateway credentials are configured" checked={form.paymentMethod === 'ONLINE'} onChange={() => update('paymentMethod', 'ONLINE')} />
            {form.paymentMethod === 'ONLINE' && <p className="text-muted text-sm mt-3">Online payments are not enabled yet. Choose Cash on Delivery to place this order.</p>}
          </FormSection>}

          {step === 5 && <FormSection title="Review & Confirm">
            <div className="text-sm" style={{ display: 'grid', gap: '10px' }}>
              <p><strong>Deliver to:</strong> {form.fullName}, {form.addressLine1}, {form.city}</p>
              <p><strong>Payment:</strong> {form.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online payment'}</p>
              <p><strong>Items:</strong> {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              {appliedCoupon && <p><strong>Coupon:</strong> {appliedCoupon.code}</p>}
            </div>
          </FormSection>}

          {error && <div role="alert" style={{ background: '#fde8e8', color: '#9b1c1c', padding: '12px 14px', borderRadius: '8px', marginTop: '20px', fontSize: '13px' }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => step > 1 && setStep((step - 1) as Step)} disabled={step === 1}>Back</button>
            {step < 5 ? <button type="button" className="btn btn-primary" onClick={() => validateStep() && setStep((step + 1) as Step)}>Continue</button> : <button type="button" className="btn btn-primary" onClick={placeOrder} disabled={submitting || form.paymentMethod !== 'COD'}>{submitting ? 'Placing order…' : 'Place Order'}</button>}
          </div>
        </section>

        <aside className="card card-xl p-6" style={{ position: 'sticky', top: '20px' }}>
          <h2 className="display-sm text-plum mb-4">Order Summary</h2>
          {items.map((item) => <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', marginBottom: '12px' }}><span>{item.name} × {item.quantity}<br /><small className="text-muted">Size {item.size}</small></span><strong>PKR {(item.price * item.quantity).toLocaleString()}</strong></div>)}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'grid', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>- PKR {discount.toLocaleString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{shipping ? `PKR ${shipping.toLocaleString()}` : 'FREE'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontWeight: 700, color: 'var(--plum-royal)', fontSize: '18px' }}><span>Total</span><span>PKR {visibleTotal.toLocaleString()}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="display-sm text-plum mb-5">{title}</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>{children}</div></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--earth-taupe)' }}>{label}<input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={label.indexOf('optional') === -1} /></label>;
}

function Choice({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', fontSize: '13px', cursor: 'pointer' }}><input type="radio" checked={checked} onChange={onChange} />{label}</label>;
}
