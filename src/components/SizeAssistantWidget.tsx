'use client';

import { useState } from 'react';

export default function SizeAssistantWidget() {
  const [age, setAge] = useState('4');
  const [height, setHeight] = useState('');
  const [chest, setChest] = useState('');
  const [result, setResult] = useState<{ recommendedSize: string; reasoning: string; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => { setLoading(true); try { const response = await fetch('/api/ai/size-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ageYears: age, heightCm: height, chestInches: chest }) }); const data = await response.json(); if (response.ok) setResult(data); } finally { setLoading(false); } };
  return <div className="card p-4" style={{ background: '#fff' }}><p className="label">AI Size Assistant</p><p className="text-muted text-xs mt-2">An estimate to help you start; always verify measurements before ordering.</p><div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}><select className="input" value={age} onChange={(event) => setAge(event.target.value)}><option value="3">Age 3</option><option value="4">Age 4</option><option value="5">Age 5</option></select><input className="input" placeholder="Height in cm (optional)" value={height} onChange={(event) => setHeight(event.target.value)} /><input className="input" placeholder="Chest in inches (optional)" value={chest} onChange={(event) => setChest(event.target.value)} /><button className="btn btn-secondary btn-sm" onClick={run} disabled={loading}>{loading ? 'Checking…' : 'Suggest a size'}</button></div>{result && <div className="text-sm mt-3" style={{ lineHeight: 1.55 }}><strong>{result.recommendedSize}</strong><p className="text-muted mt-1">{result.reasoning}</p><p className="text-muted text-xs mt-2">{result.disclaimer}</p></div>}</div>;
}
