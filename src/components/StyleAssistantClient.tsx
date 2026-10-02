'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import SizeAssistantWidget from '@/components/SizeAssistantWidget';

type Product = { id: string; name: string; slug: string; price: number; discountPrice?: number | null; image: string; reason: string; stylingTip: string; fabric: string };
type Message = { role: 'user' | 'assistant'; content: string; products?: Product[] };

const prompts = ['Find an Eid frock', 'Show me pink dresses', 'Wedding outfit for age 4', 'Find something under PKR 8,000', 'Help me design a custom frock'];

export default function StyleAssistantClient() {
  const { addItem } = useCart();
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Assalam-o-Alaikum. Tell me about the occasion, age, colors, fabric, or budget you have in mind, and I will curate from the DHAAGAÉ collection.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const send = async (value = input) => {
    if (!value.trim() || loading) return;
    const history = messages.filter((message) => message.role !== 'assistant' || message !== messages[0]).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: value.trim() }]);
    setInput(''); setLoading(true); setError(null);
    try {
      const response = await fetch('/api/ai/style-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: value.trim(), history, conversationId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The stylist could not answer right now.');
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((current) => [...current, { role: 'assistant', content: data.message, products: data.recommendedProducts }]);
    } catch (err) { setError(err instanceof Error ? err.message : 'The stylist could not answer right now.'); }
    finally { setLoading(false); }
  };

  const clear = () => { setMessages([{ role: 'assistant', content: 'The conversation is clear. What would you like to find for your little one?' }]); setConversationId(undefined); setError(null); };

  return <main className="container section">
    <div className="mb-8"><p className="text-brand mb-2">Private Atelier Consultation</p><h1 className="display-lg text-plum">Your DHAAGAÉ Style Assistant</h1><p className="text-muted mt-3 max-w-xl">Tell us what you&apos;re looking for and we&apos;ll help you find the perfect outfit for your little one.</p></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '24px', alignItems: 'start' }}>
      <section className="card card-xl" style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gap: '18px' }}>
          {messages.map((message, index) => <div key={`${index}-${message.role}`} style={{ display: 'grid', gap: '12px', justifyItems: message.role === 'user' ? 'end' : 'start' }}>
            <div style={{ maxWidth: '86%', whiteSpace: 'pre-wrap', padding: '14px 16px', borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: message.role === 'user' ? 'var(--plum-royal)' : 'var(--cream-soft)', color: message.role === 'user' ? '#fff' : 'var(--charcoal-warm)', fontSize: '14px', lineHeight: 1.65 }}>{message.content}</div>
            {message.products && message.products.length > 0 && <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>{message.products.map((product) => <article key={product.id} className="card" style={{ padding: '12px', background: '#fff' }}><div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', borderRadius: '8px', background: 'var(--cream-soft)' }}><Image src={product.image || '/products/floral-bloom-lawn-frock.jpg'} alt={product.name} fill sizes="220px" style={{ objectFit: 'cover' }} /></div><h3 style={{ color: 'var(--plum-royal)', fontSize: '14px', marginTop: '10px' }}>{product.name}</h3><p style={{ color: 'var(--earth-taupe)', fontSize: '11px', marginTop: '4px' }}>{product.reason}</p><p style={{ fontWeight: 700, marginTop: '8px' }}>PKR {(product.discountPrice ?? product.price).toLocaleString()}</p><div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}><Link href={`/shop/${product.slug}`} className="btn btn-ghost btn-sm">View</Link><button className="btn btn-primary btn-sm" onClick={() => addItem({ productId: product.id, name: product.name, slug: product.slug, price: product.discountPrice ?? product.price, discountPrice: product.discountPrice, image: product.image, size: '4-5Y', quantity: 1 })}>Add</button></div></article>)}</div>}
          </div>)}
          {loading && <div className="text-muted text-sm">DHAAGAÉ is curating from the current collection…</div>}
          {error && <div role="alert" style={{ color: '#9b1c1c', background: '#fde8e8', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>{error} <button className="btn btn-ghost btn-sm" onClick={() => send(messages[messages.length - 1]?.content || '')}>Retry</button></div>}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', overflowX: 'auto' }}>{prompts.map((prompt) => <button key={prompt} className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={() => send(prompt)} disabled={loading}>{prompt}</button>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); send(); }} style={{ padding: '16px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}><input className="input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about occasion, color, size, fabric, or budget…" disabled={loading} /><button className="btn btn-primary" disabled={loading || !input.trim()}>Ask</button></form>
      </section>
      <aside style={{ display: 'grid', gap: '16px' }}><div className="card card-xl p-5"><p className="label">Stylist Notes</p><p className="text-muted text-sm mt-3" style={{ lineHeight: 1.7 }}>Recommendations are grounded in live DHAAGAÉ product records. Prices, stock, and product links are never invented by the assistant.</p><button className="btn btn-ghost btn-full mt-6" onClick={clear}>Clear conversation</button><Link href="/design" className="btn btn-secondary btn-full mt-3" style={{ textAlign: 'center' }}>Design a custom frock</Link></div><SizeAssistantWidget /></aside>
    </div>
  </main>;
}
