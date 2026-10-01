'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          displayOrder: parseInt(displayOrder || '0', 10),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Category created successfully!' });
        setName('');
        setDescription('');
        setDisplayOrder('0');
        fetchCategories();
        setTimeout(() => {
          setModalOpen(false);
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to create category' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error creating category' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--ivory-base)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '6px' }}>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--earth-taupe)' }}>Dashboard</Link>
              <span>/</span>
              <span style={{ color: 'var(--plum-royal)', fontWeight: 600 }}>Categories</span>
            </div>
            <h1 className="display-md text-plum">Collection Categories</h1>
            <p className="text-muted text-sm mt-1">
              Curate seasonal boutique themes, collections, and occasions.
            </p>
          </div>

          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            + Add New Category
          </button>
        </div>

        {/* Categories List */}
        <div className="card card-xl" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--earth-taupe)' }}>
              No categories found. Click &quot;Add New Category&quot; to create one.
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: 600, color: 'var(--plum-royal)', fontSize: '15px' }}>{cat.name}</p>
                    <span style={{ fontSize: '11px', color: 'var(--earth-taupe)', fontFamily: 'monospace' }}>
                      /{cat.slug}
                    </span>
                  </div>
                  {cat.description && (
                    <p style={{ fontSize: '12px', color: 'var(--charcoal-warm)', marginTop: '4px', maxWidth: '500px' }}>
                      {cat.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-cream">
                    {cat._count?.products ?? 0} outfits
                  </span>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    target="_blank"
                    className="btn btn-ghost btn-xs"
                  >
                    View in Shop &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Creating Category */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '480px',
                width: '100%',
                padding: '28px',
                boxShadow: 'var(--shadow-xl)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="display-sm text-plum">Create New Category</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              {feedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontSize: '13px',
                    backgroundColor: feedback.type === 'success' ? '#def7ec' : '#fde8e8',
                    color: feedback.type === 'success' ? '#03543f' : '#9b1c1c',
                  }}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateCategory}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Velvet Capsule"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of this couture capsule or occasion..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea"
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="input"
                    style={{ width: '100px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
