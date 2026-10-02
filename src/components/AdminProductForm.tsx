'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number | string;
  discountPrice?: number | string | null;
  categoryId: string;
  availableSizes: string;
  ageRange: string;
  colors: string;
  fabric: string;
  occasion: string;
  style: string;
  stockQuantity: number | string;
  sku: string;
  tags?: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isCustomizable: boolean;
  images: string[];
}

interface AdminProductFormProps {
  initialData?: ProductFormData;
  isEditing?: boolean;
}

export default function AdminProductForm({ initialData, isEditing = false }: AdminProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatingCopy, setGeneratingCopy] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    categoryId: initialData?.categoryId || '',
    availableSizes: initialData?.availableSizes || '2-3Y, 3-4Y, 4-5Y, 5-6Y',
    ageRange: initialData?.ageRange || '3–5 Years',
    colors: initialData?.colors || '',
    fabric: initialData?.fabric || '',
    occasion: initialData?.occasion || '',
    style: initialData?.style || '',
    stockQuantity: initialData?.stockQuantity ?? 10,
    sku: initialData?.sku || '',
    tags: initialData?.tags || '',
    isFeatured: initialData?.isFeatured ?? false,
    isNewArrival: initialData?.isNewArrival ?? false,
    isCustomizable: initialData?.isCustomizable ?? true,
    images: initialData?.images || [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (!formData.categoryId && data.categories?.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Auto-generate slug and SKU if creating new
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      const generatedSlug = !isEditing && !prev.slug
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug;
      return { ...prev, name: val, slug: generatedSlug };
    });
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage(null);

    const uploadForm = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadForm.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();

      if (res.ok && data.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
      } else {
        setErrorMessage(data.error || 'Failed to upload images');
      }
    } catch {
      setErrorMessage('Network error during file upload');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // reset file input
    }
  };

  // Add external image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  // Image actions: remove, make primary, reorder
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return { ...prev, images: copy };
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.images.length) return;

    setFormData((prev) => {
      const copy = [...prev.images];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, images: copy };
    });
  };

  // Submit Handler
  const generateProductCopy = async () => {
    if (!formData.name || !formData.fabric || !formData.colors) {
      setErrorMessage('Enter product name, fabric, and colors before generating copy.');
      return;
    }
    setGeneratingCopy(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, fabric: formData.fabric, color: formData.colors, occasion: formData.occasion, designDetails: formData.style, sizeInfo: formData.ageRange }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate product copy');
      setFormData((current) => ({ ...current, description: data.description || current.description, shortDescription: data.shortDescription || current.shortDescription, tags: Array.isArray(data.tags) ? data.tags.join(', ') : current.tags }));
      setSuccessMessage('AI copy loaded for review. Review it before saving the product.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate product copy');
    } finally { setGeneratingCopy(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic frontend check
    if (!formData.name.trim()) {
      setErrorMessage('Product name is required');
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price.toString()) <= 0) {
      setErrorMessage('A valid positive price is required');
      setLoading(false);
      return;
    }
    if (!formData.categoryId) {
      setErrorMessage('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isEditing && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Server validation failed');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Alert Messages */}
      {errorMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#fde8e8',
            color: '#9b1c1c',
            border: '1px solid #f98080',
            fontSize: '14px',
          }}
        >
          ✕ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#def7ec',
            color: '#03543f',
            border: '1px solid #31c48d',
            fontSize: '14px',
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* 1. Basic Details */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)' }}>
        <h3 className="display-sm text-plum mb-4">1. General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Jahanara White Pearl Organza Frock"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Slug (URL identifier)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. jahanara-white-pearl-organza-frock"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>SKU (Stock Keeping Unit)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. DHG-EID-015"
              className="input"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Short Summary (Shown in cards & previews)</label>
          <input
            type="text"
            value={formData.shortDescription || ''}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Brief 1-2 sentence description of design and fabric..."
            className="input"
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="button" onClick={generateProductCopy} disabled={generatingCopy} className="btn btn-secondary btn-sm" style={{ marginBottom: '10px' }}>
            {generatingCopy ? 'Generating…' : 'Generate with AI'}
          </button>
          <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', marginBottom: '8px' }}>AI suggestions are drafts only. Review and edit before saving.</p>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Full Description & Craftsmanship Story *</label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of hand-embroidery, silhouette, lining, and styling advice..."
            className="textarea"
          />
        </div>
      </div>

      {/* 2. Pricing & Inventory */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)' }}>
        <h3 className="display-sm text-plum mb-4">2. Pricing & Stock Control</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Regular Price (PKR) *</label>
            <input
              type="number"
              step="any"
              required
              min="1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="9500"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Discount / Sale Price (PKR)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.discountPrice || ''}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              placeholder="Leave blank if not on sale"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Stock Inventory Quantity *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              placeholder="10"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* 3. Garment Specifications */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)' }}>
        <h3 className="display-sm text-plum mb-4">3. Fabric, Style & Sizing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Fabric Composition *</label>
            <input
              type="text"
              required
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              placeholder="e.g. Pure Katan Silk & Tissue Organza"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Color Hues *</label>
            <input
              type="text"
              required
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              placeholder="e.g. Dusty Rose, Antique Gold"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Occasion *</label>
            <input
              type="text"
              required
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              placeholder="e.g. Eid-ul-Fitr, Wedding, Birthday"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Silhouette Style</label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="e.g. 24-Kali Flared Anarkali"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Age Range</label>
            <input
              type="text"
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              placeholder="3–5 Years"
              className="input"
            />
          </div>

          <div>
            <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Available Sizes</label>
            <input
              type="text"
              value={formData.availableSizes}
              onChange={(e) => setFormData({ ...formData, availableSizes: e.target.value })}
              placeholder="2-3Y, 3-4Y, 4-5Y, 5-6Y"
              className="input"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Search Tags (Comma separated keywords)</label>
          <input
            type="text"
            value={formData.tags || ''}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Silk, Eid, Pink, Gold, Anarkali, Zari"
            className="input"
          />
        </div>
      </div>

      {/* 4. Product Images & Gallery (Multiple, preview, reorder, primary) */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)' }}>
        <h3 className="display-sm text-plum mb-2">4. Product Photography</h3>
        <p style={{ fontSize: '13px', color: 'var(--earth-taupe)', marginBottom: '20px' }}>
          Upload high-res JPG, PNG, or WebP images (max 5MB each) or add external image URLs. The first image will be used as the primary display image.
        </p>

        {/* Upload inputs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--plum-royal)',
                color: '#fff',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <span>{uploadingImage ? 'Uploading...' : '📁 Upload Local Files'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <input
              type="url"
              placeholder="Or paste external image URL (https://...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="input"
              style={{ flex: 1, fontSize: '13px' }}
            />
            <button type="button" onClick={handleAddImageUrl} className="btn btn-secondary btn-sm">
              Add URL
            </button>
          </div>
        </div>

        {/* Thumbnails Gallery */}
        {formData.images.length === 0 ? (
          <div style={{ border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '36px', textAlign: 'center', color: 'var(--earth-taupe)' }}>
            No images added yet. Upload files or paste an image URL above.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {formData.images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: idx === 0 ? '3px solid var(--gold-zari)' : '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--cream-soft)',
                }}
              >
                <Image src={img} alt={`Preview ${idx + 1}`} fill style={{ objectFit: 'cover' }} />

                {/* Primary Tag */}
                {idx === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      backgroundColor: 'var(--gold-zari)',
                      color: '#1a1a1a',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-pill)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Primary
                  </span>
                )}

                {/* Image Toolbar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'left')}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                        title="Move left"
                      >
                        ◀
                      </button>
                    )}
                    {idx < formData.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'right')}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                        title="Move right"
                      >
                        ▶
                      </button>
                    )}
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--gold-zari)', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Make Primary
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ background: 'none', border: 'none', color: '#f98080', cursor: 'pointer', fontSize: '13px' }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Status & Flags */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#fff', borderRadius: 'var(--radius-md)' }}>
        <h3 className="display-sm text-plum mb-4">5. Visibility & Badges</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--plum-royal)' }}>
              👑 Featured Signature Couture
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isNewArrival}
              onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--plum-royal)' }}>
              ✨ New Arrival
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isCustomizable}
              onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--plum-royal)' }}>
              ✂️ Bespoke Customizable
            </span>
          </label>
        </div>
      </div>

      {/* Submit / Cancel Footer */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="btn btn-primary btn-lg"
          style={{ minWidth: '180px' }}
        >
          {loading ? 'Saving in Atelier...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
