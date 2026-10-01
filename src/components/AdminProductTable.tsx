'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Copy, Trash2, Save, Plus } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  stockQuantity: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isCustomizable: boolean;
  images: string;
  fabric: string;
  colors: string;
  category?: { id: string; name: string } | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminProductTable() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [sort, setSort] = useState('newest');

  // Inline editing / actions feedback
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<{ [id: string]: number }>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        sort,
      });
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (stockStatus) params.set('stock', stockStatus);
      if (featuredFilter) params.set('featured', featuredFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, stockStatus, featuredFilter, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Toggle Featured status
  const handleToggleFeatured = async (product: ProductItem) => {
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p))
        );
        showToast(`✓ "${product.name}" featured status updated`);
      }
    } catch {
      showToast('✕ Error updating featured status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Quick Stock Update
  const handleQuickStockUpdate = async (productId: string) => {
    const newStock = stockInput[productId];
    if (newStock === undefined || newStock < 0) return;

    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
        );
        showToast('✓ Stock quantity updated');
      }
    } catch {
      showToast('✕ Error updating stock');
    } finally {
      setUpdatingId(null);
    }
  };

  // Duplicate Product
  const handleDuplicate = async (product: ProductItem) => {
    if (!confirm(`Duplicate product "${product.name}"?`)) return;
    setUpdatingId(product.id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${product.name} (Copy)`,
          slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
          description: `Handcrafted copy of ${product.name}`,
          price: product.price,
          discountPrice: product.discountPrice,
          categoryId: product.category?.id || categories[0]?.id,
          sku: `DHG-DUP-${Date.now().toString().slice(-4)}`,
          stockQuantity: product.stockQuantity,
          fabric: product.fabric,
          colors: product.colors,
          images: product.images,
          isFeatured: false,
          isNewArrival: true,
          isCustomizable: product.isCustomizable,
        }),
      });
      if (res.ok) {
        showToast('✓ Product duplicated successfully');
        fetchProducts();
      }
    } catch {
      showToast('✕ Error duplicating product');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Product
  const handleDelete = async (product: ProductItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${product.name}"?`)) return;
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setTotal((prev) => prev - 1);
        showToast('✓ Product deleted from atelier catalogue');
      } else {
        const d = await res.json();
        showToast(`✕ ${d.error || 'Failed to delete'}`);
      }
    } catch {
      showToast('✕ Error deleting product');
    } finally {
      setUpdatingId(null);
    }
  };

  const getProductImage = (imagesStr: string) => {
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {
      if (imagesStr && imagesStr.startsWith('http')) return imagesStr;
    }
    return '/products/floral-bloom-lawn-frock.jpg';
  };

  return (
    <div>
      {/* Top Filter Bar */}
      <div
        className="card"
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="Search name, SKU, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="select"
            style={{ fontSize: '13px', padding: '8px 32px 8px 12px', width: 'auto' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="select"
            style={{ fontSize: '13px', padding: '8px 32px 8px 12px', width: 'auto' }}
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (&le; 5)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              setPage(1);
            }}
            className="select"
            style={{ fontSize: '13px', padding: '8px 32px 8px 12px', width: 'auto' }}
          >
            <option value="">All Products</option>
            <option value="true">Featured Only</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="select"
            style={{ fontSize: '13px', padding: '8px 32px 8px 12px', width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          <Link href="/admin/products/new" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--cream-soft)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '14px 16px' }}>Garment</th>
              <th style={{ padding: '14px 16px' }}>Category</th>
              <th style={{ padding: '14px 16px' }}>Price (PKR)</th>
              <th style={{ padding: '14px 16px' }}>Stock</th>
              <th style={{ padding: '14px 16px' }}>Featured</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center' }}>
                  <div className="spinner spinner-md" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--earth-taupe)' }}>Loading atelier garments...</p>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--earth-taupe)' }}>
                  No garments match the current filters.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {/* Garment Image & Info */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ position: 'relative', width: '48px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--cream-soft)' }}>
                        <Image src={getProductImage(p.images)} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div>
                        <Link href={`/shop/${p.slug}`} target="_blank" style={{ fontWeight: 600, color: 'var(--plum-royal)', textDecoration: 'none', display: 'block', fontSize: '14px' }}>
                          {p.name}
                        </Link>
                        <span style={{ fontSize: '11px', color: 'var(--earth-taupe)', fontFamily: 'monospace' }}>
                          SKU: {p.sku}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-cream" style={{ fontSize: '11px' }}>
                      {p.category?.name || 'Unassigned'}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--plum-royal)' }}>
                      PKR {(p.discountPrice || p.price).toLocaleString()}
                    </div>
                    {p.discountPrice && (
                      <span style={{ fontSize: '11px', color: 'var(--earth-taupe)', textDecoration: 'line-through' }}>
                        PKR {p.price.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Stock Quantity */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        defaultValue={p.stockQuantity}
                        onChange={(e) => setStockInput({ ...stockInput, [p.id]: parseInt(e.target.value) || 0 })}
                        style={{
                          width: '56px',
                          padding: '4px 6px',
                          fontSize: '12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                      <button
                        onClick={() => handleQuickStockUpdate(p.id)}
                        className="btn btn-ghost btn-xs"
                        title="Save stock"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Save size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Featured Toggle */}
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                      }}
                      title={p.isFeatured ? 'Unmark from featured' : 'Mark as featured'}
                    >
                      {p.isFeatured ? '★' : '☆'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        href={`/shop/${p.slug}`}
                        target="_blank"
                        className="btn btn-ghost btn-xs"
                        title="Preview in Storefront"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="btn btn-secondary btn-xs"
                        title="Edit Product"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="btn btn-ghost btn-xs"
                        title="Duplicate Product"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#c53030', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--earth-taupe)' }}>
            Showing {products.length} of {total} items
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              &larr; Prev
            </button>
            <span style={{ alignSelf: 'center', fontSize: '13px', fontWeight: 600 }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--plum-royal)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 80,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
