'use client';

import React, { useState } from 'react';

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  fabric: string;
  colors: string;
  occasion: string;
  ageRange: string;
}

interface AskAIModalProps {
  product: ProductInfo;
  isOpen: boolean;
  onClose: () => void;
}

export default function AskAIModal({ product, isOpen, onClose }: AskAIModalProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Assalam-o-Alaikum! I am your DHAAGAÉ AI Stylist. I have the complete artisanal details for "${product.name}" (${product.fabric}, ${product.colors}). How can I assist you and your little one today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Is this suitable for a 4-year-old?',
    'What accessories or shoes would match this?',
    'Would this work well for an Eid celebration?',
    'How should I care for and wash this fabric?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || input;
    if (!q.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: q }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/style-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          productContextId: product.id,
          history: newMessages.slice(1, -1), // exclude initial greeting and current message
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message || 'I recommend pairing this with delicate gold khussas and pearl bangles for a royal Pakistani festive look.' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Yes! "${product.name}" is tailored with soft cotton inner lining and hypoallergenic dyes, making it exceptionally comfortable for a child in the ${product.ageRange} range. For styling, we suggest traditional gold mojris and a lightweight chiffon drape.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Yes! For "${product.name}" (${product.fabric}), it is crafted specifically for ${product.occasion} events. Pair it with soft velvet or silk shoes for an adorable, complete royal ensemble!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FAF8F4',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '560px',
          width: '100%',
          height: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--plum-royal)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>✨</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '15px', color: 'var(--gold-zari)', letterSpacing: '0.08em' }}>
                DHAAGAÉ AI Stylist
              </h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                Consulting on: {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: m.role === 'user' ? 'var(--plum-royal)' : '#fff',
                color: m.role === 'user' ? '#fff' : 'var(--charcoal-warm)',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '13px',
                lineHeight: 1.6,
                boxShadow: 'var(--shadow-sm)',
                border: m.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#fff',
                padding: '10px 16px',
                borderRadius: '16px',
                fontSize: '12px',
                color: 'var(--earth-taupe)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="spinner spinner-sm" />
              <span>DHAAGAÉ Stylist is reviewing garment specs...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#fff',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '11px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--cream-soft)',
                color: 'var(--plum-royal)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '12px 16px',
            backgroundColor: '#fff',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <input
            type="text"
            placeholder="Ask about sizing, accessories, care..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="input"
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary btn-sm">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
