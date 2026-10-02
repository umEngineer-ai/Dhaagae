'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  categories: CategoryItem[];
  totalProducts: number;
}

export default function ShopFilters({ categories, totalProducts }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Active filters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentColor = searchParams.get('color') || '';
  const currentOccasion = searchParams.get('occasion') || '';
  const currentFabric = searchParams.get('fabric') || '';
  const currentAge = searchParams.get('age') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentCustomizable = searchParams.get('customizable') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const currentFeatured = searchParams.get('featured') || '';

  // Local search input
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [naturalLoading, setNaturalLoading] = useState(false);

  // Update URL helper
  const updateQuery = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination when filter changes
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const runNaturalSearch = async () => {
    if (!searchInput.trim()) return;
    setNaturalLoading(true);
    try {
      const response = await fetch('/api/ai/natural-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: searchInput }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search unavailable');
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', searchInput.trim());
      const filters = data.parsedFilters || {};
      for (const [key, value] of Object.entries(filters)) if (value !== null && value !== undefined && value !== '' && key !== 'keyword') params.set(key === 'maxPrice' ? 'maxPrice' : key === 'minPrice' ? 'minPrice' : key, String(value));
      params.delete('page');
      router.push(`/shop?${params.toString()}`);
    } catch { updateQuery('search', searchInput); }
    finally { setNaturalLoading(false); }
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
      currentCategory ||
      currentColor ||
      currentOccasion ||
      currentFabric ||
      currentAge ||
      currentMinPrice ||
      currentMaxPrice ||
      currentCustomizable ||
      currentAvailability ||
      currentFeatured
  );

  const colorsList = ['Pink', 'Maroon', 'Mint', 'White', 'Blue', 'Gold', 'Lilac', 'Coral', 'Mustard', 'Sage'];
  const occasionsList = ['Eid', 'Wedding', 'Birthday', 'Party', 'Casual'];
  const fabricsList = ['Silk', 'Organza', 'Lawn', 'Jamawar', 'Cotton', 'Velvet', 'Georgette'];
  const ageRanges = ['2-3Y', '3-4Y', '4-5Y', '5-6Y'];

  const filterContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Search Input */}
      <div>
          <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Search Collection with AI</label>
        <form
            onSubmit={(e) => { e.preventDefault(); void runNaturalSearch(); }}
          style={{ display: 'flex', gap: '6px' }}
        >
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={naturalLoading}>{naturalLoading ? '…' : 'Find'}</button>
        </form>
        <p style={{ fontSize: '11px', color: 'var(--earth-taupe)', marginTop: '6px' }}>Try: “lavender frock for a 4 year old under 7000”</p>
      </div>

      {/* Category Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Category</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          <button
            onClick={() => updateQuery('category', null)}
            style={{
              textAlign: 'left',
              background: 'none',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              fontWeight: !currentCategory ? 700 : 400,
              color: !currentCategory ? 'var(--plum-royal)' : 'var(--charcoal-warm)',
            }}
          >
            All Collections
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateQuery('category', c.slug)}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '4px 0',
                cursor: 'pointer',
                fontWeight: currentCategory === c.slug ? 700 : 400,
                color: currentCategory === c.slug ? 'var(--plum-royal)' : 'var(--charcoal-warm)',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Occasion</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {occasionsList.map((occ) => {
            const isSelected = currentOccasion.toLowerCase() === occ.toLowerCase();
            return (
              <button
                key={occ}
                onClick={() => updateQuery('occasion', isSelected ? null : occ)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--plum-royal)' : '#fff',
                  color: isSelected ? '#fff' : 'var(--charcoal-warm)',
                }}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {colorsList.map((col) => {
            const isSelected = currentColor.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={col}
                onClick={() => updateQuery('color', isSelected ? null : col)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--gold-zari)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--cream-soft)' : '#fff',
                  color: isSelected ? 'var(--plum-royal)' : 'var(--charcoal-warm)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {col}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Age Range</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ageRanges.map((age) => {
            const isSelected = currentAge === age;
            return (
              <button
                key={age}
                onClick={() => updateQuery('age', isSelected ? null : age)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--cream-soft)' : '#fff',
                  color: 'var(--plum-royal)',
                  fontWeight: 600,
                }}
              >
                {age}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Fabric</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {fabricsList.map((fab) => {
            const isSelected = currentFabric.toLowerCase() === fab.toLowerCase();
            return (
              <button
                key={fab}
                onClick={() => updateQuery('fabric', isSelected ? null : fab)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--plum-royal)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--plum-royal)' : '#fff',
                  color: isSelected ? '#fff' : 'var(--charcoal-warm)',
                }}
              >
                {fab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <label className="label" style={{ marginBottom: '10px', display: 'block' }}>Price (PKR)</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateQuery('minPrice', e.target.value)}
            className="input"
            style={{ fontSize: '12px', padding: '6px 8px' }}
          />
          <span style={{ color: 'var(--earth-taupe)' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateQuery('maxPrice', e.target.value)}
            className="input"
            style={{ fontSize: '12px', padding: '6px 8px' }}
          />
        </div>
      </div>

      {/* Additional Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={currentCustomizable === 'true'}
            onChange={(e) => updateQuery('customizable', e.target.checked ? 'true' : null)}
          />
          <span>Customizable / Bespoke</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={currentAvailability === 'in_stock'}
            onChange={(e) => updateQuery('availability', e.target.checked ? 'in_stock' : null)}
          />
          <span>In Stock Only</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={currentFeatured === 'true'}
            onChange={(e) => updateQuery('featured', e.target.checked ? 'true' : null)}
          />
          <span>Featured Only</span>
        </label>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="btn btn-secondary btn-sm btn-full"
          style={{ marginTop: '8px' }}
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Top Bar on Mobile & Sort Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="btn btn-secondary btn-sm md:hidden"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚙️ Filters</span>
            {hasActiveFilters && (
              <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '10px' }}>
                Active
              </span>
            )}
          </button>
          <span style={{ fontSize: '13px', color: 'var(--earth-taupe)' }}>
            Showing <strong>{totalProducts}</strong> handcrafted outfits
          </span>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sort-select" style={{ fontSize: '13px', color: 'var(--charcoal-warm)', fontWeight: 500 }}>
            Sort by:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => updateQuery('sort', e.target.value)}
            className="select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--earth-taupe)', fontWeight: 500 }}>Active Filters:</span>
          {currentSearch && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              &ldquo;{currentSearch}&rdquo;
              <button onClick={() => updateQuery('search', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentCategory && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button onClick={() => updateQuery('category', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentColor && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Color: {currentColor}
              <button onClick={() => updateQuery('color', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentOccasion && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Occasion: {currentOccasion}
              <button onClick={() => updateQuery('occasion', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentFabric && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Fabric: {currentFabric}
              <button onClick={() => updateQuery('fabric', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentAge && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Age: {currentAge}
              <button onClick={() => updateQuery('age', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          {currentCustomizable && (
            <span className="badge badge-cream" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Customizable Only
              <button onClick={() => updateQuery('customizable', null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            style={{ background: 'none', border: 'none', color: 'var(--plum-royal)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Desktop Sidebar (Rendered inside desktop grid) */}
      <aside className="hidden md:block" style={{ width: '260px', flexShrink: 0 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-subtle)', position: 'sticky', top: '96px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--plum-royal)', marginBottom: '16px' }}>
            Filter Boutique
          </h3>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '360px',
              backgroundColor: '#fff',
              height: '100%',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--plum-royal)' }}>Filters</h3>
              <button onClick={() => setMobileDrawerOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {filterContent}
            <div style={{ marginTop: '24px' }}>
              <button onClick={() => setMobileDrawerOpen(false)} className="btn btn-primary btn-full">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
