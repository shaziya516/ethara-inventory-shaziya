import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Archive,
  AlertTriangle, X, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { productsApi } from '../api/products';
import type { Product } from '../types';
import { AxiosError } from 'axios';

// ── Types ─────────────────────────────────────────────────
type ProductFormData = {
  name: string;
  price: string;
  stock_quantity: string;
  category: string;
  description: string;
  low_stock_threshold: string;
  sku: string;
};

// ── Stock status badge ────────────────────────────────────
function StockBadge({ product }: { product: Product }) {
  if (product.is_out_of_stock) return <span className="badge-out-stock">Out of Stock</span>;
  if (product.is_low_stock)    return <span className="badge-low-stock">Low Stock</span>;
  return <span className="badge-in-stock">In Stock</span>;
}

// ── Product Modal ─────────────────────────────────────────
interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const isEdit = !!product;
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: product
      ? {
          name: product.name,
          price: String(product.price),
          stock_quantity: String(product.stock_quantity),
          category: product.category || '',
          description: product.description || '',
          low_stock_threshold: String(product.low_stock_threshold),
          sku: product.sku || '',
        }
      : {
          low_stock_threshold: '10',
          stock_quantity: '0',
          price: '',
          name: '',
          category: '',
          description: '',
          sku: '',
        },
  });

  const onSubmit = async (raw: ProductFormData) => {
    setServerError('');
    setSaving(true);
    const payload = {
      name: raw.name.trim(),
      price: parseFloat(raw.price),
      stock_quantity: parseInt(raw.stock_quantity, 10),
      category: raw.category?.trim() || undefined,
      description: raw.description?.trim() || undefined,
      low_stock_threshold: parseInt(raw.low_stock_threshold, 10),
      sku: raw.sku?.trim() || undefined,
    };
    try {
      if (isEdit) {
        await productsApi.update(product!.id, payload);
      } else {
        await productsApi.create(payload);
      }
      onSave();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setServerError(e.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a' }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#8a8a8a', marginTop: 2 }}>
              {isEdit ? 'Update product details below.' : 'Fill in the details to add a new inventory item.'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            {serverError && (
              <div className="alert-error" style={{ marginBottom: 20 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Section: Classification */}
            <p className="modal-section-title">Classification</p>
            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="label">Category</label>
                <input className="input" placeholder="e.g. Electronics" {...register('category')} />
              </div>
              <div>
                <label className="label">
                  SKU Code{' '}
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#9a9a9a' }}>
                    {isEdit ? '(optional)' : '(auto-generated if empty)'}
                  </span>
                </label>
                <input
                  className="input"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  placeholder={isEdit ? 'Leave blank to keep current' : 'e.g. ELEC-001'}
                  {...register('sku')}
                />
              </div>
            </div>

            {/* Section: Product details */}
            <p className="modal-section-title">Product Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Product Name *</label>
                <input
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Wireless Bluetooth Headset"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#c0392b' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={2}
                  style={{ resize: 'none' }}
                  placeholder="Brief description of this product…"
                  {...register('description')}
                />
              </div>
            </div>

            {/* Section: Pricing & Stock */}
            <p className="modal-section-title" style={{ marginTop: 20 }}>Pricing & Stock</p>
            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label className="label">Unit Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
                  {...register('price', { required: 'Price is required' })}
                />
                {errors.price && (
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#c0392b' }}>
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Qty in Stock *</label>
                <input
                  type="number"
                  min="0"
                  className={`input ${errors.stock_quantity ? 'input-error' : ''}`}
                  placeholder="0"
                  {...register('stock_quantity', { required: 'Quantity is required' })}
                />
                {errors.stock_quantity && (
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#c0392b' }}>
                    {errors.stock_quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="10"
                  {...register('low_stock_threshold')}
                />
                <p style={{ marginTop: 3, fontSize: '0.7rem', color: '#9a9a9a' }}>
                  Triggers low-stock alert
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────
function DeleteModal({
  product, onClose, onConfirm, error, loading,
}: {
  product: Product; onClose: () => void;
  onConfirm: () => void; error: string; loading: boolean;
}) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: '#fde8e6',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={17} color="#c0392b" />
            </div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a' }}>
              Remove Product
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          <p style={{ fontSize: '0.9375rem', color: '#3d3d3d', lineHeight: 1.55 }}>
            Are you sure you want to permanently remove{' '}
            <strong style={{ color: '#1a1a1a' }}>{product.name}</strong> from inventory?
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#9a9a9a', marginTop: 8 }}>
            This action cannot be undone. The product will be removed from all future reports.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Keep Product</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Removing…' : 'Remove Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ page, per_page: 15, search });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await productsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setDeleteError(e.response?.data?.error || 'Failed to remove product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{total} product{total !== 1 ? 's' : ''} in catalogue</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search & refresh bar */}
      <div className="search-action-row" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={15} color="#b0b0b0" style={{ flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="Search by product name or SKU code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0b0b0', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          className="btn-icon"
          onClick={fetchProducts}
          title="Refresh"
          style={{ width: 38, height: 38 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table card */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Product Name</th>
                <th>SKU Code</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div className="spinner" />
                      <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading inventory…</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Archive size={22} />
                      </div>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                        No products found
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#8a8a8a', marginBottom: 16 }}>
                        {search ? 'Try adjusting your search.' : 'Add your first product to get started.'}
                      </p>
                      {!search && (
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                          <Plus size={14} /> Add First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: '#6b6b6b',
                          background: '#f4f0ec',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {product.category || '—'}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.9rem' }}>
                        {product.name}
                      </p>
                      {product.description && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: '#9a9a9a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 220,
                          }}
                        >
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="sku-tag">{product.sku}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2e7d32' }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: product.is_out_of_stock
                              ? '#c0392b'
                              : product.is_low_stock
                              ? '#e65100'
                              : '#1a1a1a',
                          }}
                        >
                          {product.stock_quantity}
                        </span>
                        {product.is_low_stock && !product.is_out_of_stock && (
                          <AlertTriangle size={12} color="#e65100" />
                        )}
                      </div>
                    </td>
                    <td>
                      <StockBadge product={product} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          className="btn-icon"
                          onClick={() => setEditProduct(product)}
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => { setDeleteTarget(product); setDeleteError(''); }}
                          title="Remove product"
                          style={{ color: '#c0392b' }}
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

        {/* Pagination */}
        {pages > 1 && (
          <div
            className="pagination-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid #eae4dc',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: '#8a8a8a' }}>
              Showing page {page} of {pages} &middot; {total} total
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <button
                className="pagination-btn"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <ProductModal
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); fetchProducts(); }}
        />
      )}
      {editProduct && (
        <ProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={() => { setEditProduct(null); fetchProducts(); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          error={deleteError}
          loading={deleting}
        />
      )}
    </div>
  );
}
