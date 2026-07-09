import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, X, RefreshCw, ClipboardList, ChevronRight,
  Minus, Trash2, AlertCircle, CheckCircle2, Archive,
  User, FileText, ArrowRight,
} from 'lucide-react';
import { ordersApi } from '../api/orders';
import { productsApi } from '../api/products';
import { customersApi } from '../api/customers';
import type { Order, Product, Customer } from '../types';
import { AxiosError } from 'axios';
import { format } from 'date-fns';

// ── Status Badge ──────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:    'badge-pending',
  processing: 'badge-processing',
  fulfilled:  'badge-fulfilled',
  cancelled:  'badge-cancelled',
};

function StatusBadge({ status }: { status: Order['status'] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={STATUS_STYLES[status] || 'badge'}>
      {status === 'fulfilled' ? 'Delivered' : label}
    </span>
  );
}

// ── Order Detail Modal ────────────────────────────────────
function OrderDetailModal({
  order, onClose, onStatusChange,
}: {
  order: Order; onClose: () => void; onStatusChange: () => void;
}) {
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    ordersApi.get(order.id)
      .then((res) => setFullOrder(res.data.order))
      .finally(() => setLoading(false));
  }, [order.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true);
    setStatusError('');
    try {
      await ordersApi.updateStatus(order.id, newStatus);
      onStatusChange();
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setStatusError(e.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancel = async () => {
    setUpdatingStatus(true);
    setStatusError('');
    try {
      await ordersApi.cancel(order.id);
      onStatusChange();
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setStatusError(e.response?.data?.error || 'Failed to cancel order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 660 }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a' }}>
                Order Details
              </h2>
              <span className="sku-tag">{order.order_number}</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#8a8a8a', marginTop: 3 }}>
              Placed {format(new Date(order.created_at), 'MMMM d, yyyy · HH:mm')}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10 }}>
            <div className="spinner" />
            <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading order…</span>
          </div>
        ) : fullOrder ? (
          <div className="modal-body">
            {statusError && (
              <div className="alert-error" style={{ marginBottom: 20 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{statusError}</span>
              </div>
            )}

            {/* Summary cards */}
            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="card-flat">
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Client
                </p>
                <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                  {fullOrder.customer_name}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>{fullOrder.customer_email}</p>
              </div>
              <div className="card-flat">
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Status
                </p>
                <StatusBadge status={fullOrder.status} />
              </div>
              <div className="card-flat">
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Total Value
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2e7d32' }}>
                  ${fullOrder.total_amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Line items */}
            <p className="modal-section-title">Line Items</p>
            <div className="table-wrapper" style={{ marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {fullOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.product_name}</td>
                      <td><span className="sku-tag">{item.product_sku}</span></td>
                      <td style={{ fontWeight: 700, color: '#1565c0' }}>{item.quantity}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <div
                style={{
                  background: '#f4f0ec',
                  border: '1px solid #eae4dc',
                  borderRadius: 6,
                  padding: '10px 16px',
                  fontSize: '0.875rem',
                  color: '#3d3d3d',
                }}
              >
                Order Total:{' '}
                <strong style={{ fontSize: '1.0625rem', color: '#1a1a1a' }}>
                  ${fullOrder.total_amount.toFixed(2)}
                </strong>
              </div>
            </div>

            {fullOrder.notes && (
              <>
                <p className="modal-section-title">Notes</p>
                <div className="card-flat" style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: '0.875rem', color: '#3d3d3d', lineHeight: 1.6 }}>
                    {fullOrder.notes}
                  </p>
                </div>
              </>
            )}

            {/* Status actions */}
            {fullOrder.status !== 'cancelled' && (
              <>
                <p className="modal-section-title">Update Status</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['pending', 'processing', 'fulfilled'].map(
                    (s) =>
                      s !== fullOrder.status && (
                        <button
                          key={s}
                          className="btn-secondary"
                          style={{ fontSize: '0.8125rem' }}
                          onClick={() => handleStatusUpdate(s)}
                          disabled={updatingStatus}
                        >
                          Mark as {s === 'fulfilled' ? 'Delivered' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ),
                  )}
                  {['pending', 'processing'].includes(fullOrder.status) && (
                    <button
                      className="btn-danger"
                      style={{ fontSize: '0.8125rem' }}
                      onClick={handleCancel}
                      disabled={updatingStatus}
                    >
                      Cancel & Restore Stock
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Create Order Wizard ───────────────────────────────────
interface CartItem { product: Product; quantity: number; }

function CreateOrderModal({
  onClose, onCreated,
}: {
  onClose: () => void; onCreated: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [insufficientItems, setInsufficientItems] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      customersApi.list({ per_page: 100 }),
      productsApi.list({ per_page: 100 }),
    ])
      .then(([custRes, prodRes]) => {
        setCustomers(custRes.data.customers);
        setProducts(prodRes.data.products);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    setSubmitting(true);
    setSubmitError('');
    setInsufficientItems([]);
    try {
      await ordersApi.create({
        customer_id: selectedCustomer.id,
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        notes: notes.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ error: string; insufficient_items?: any[] }>;
      setSubmitError(e.response?.data?.error || 'Failed to create order');
      if (e.response?.data?.insufficient_items) {
        setInsufficientItems(e.response.data.insufficient_items);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Select Client', icon: User },
    { num: 2, label: 'Choose Items', icon: Archive },
    { num: 3, label: 'Review & Place', icon: FileText },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 700 }}>
        {/* Header + stepper */}
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a' }}>
              Create Purchase Order
            </h2>
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
            {STEPS.map((s, i) => {
              const done = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: done ? '#e8f5e9' : active ? '#fde8e6' : '#f4f0ec',
                        border: `1.5px solid ${done ? '#a5d6a7' : active ? '#c0392b' : '#eae4dc'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: done ? '#2e7d32' : active ? '#c0392b' : '#b0b0b0',
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : s.num}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#1a1a1a' : done ? '#2e7d32' : '#9a9a9a',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: done ? '#a5d6a7' : '#eae4dc',
                        margin: '0 10px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-body" style={{ minHeight: 340 }}>
          {loadingData ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10 }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading data…</span>
            </div>
          ) : (
            <>
              {/* Step 1: Select Client */}
              {step === 1 && (
                <div>
                  <p className="modal-section-title">Choose a Client</p>
                  <div className="search-bar" style={{ marginBottom: 12 }}>
                    <Search size={14} color="#b0b0b0" style={{ flexShrink: 0 }} />
                    <input
                      className="search-input"
                      placeholder="Search clients by name or email…"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 6,
                          border: `1.5px solid ${selectedCustomer?.id === c.id ? '#c0392b' : '#eae4dc'}`,
                          background: selectedCustomer?.id === c.id ? '#fdf2f1' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: '#fde8e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: '#c0392b',
                            flexShrink: 0,
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>{c.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#8a8a8a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                        </div>
                        {selectedCustomer?.id === c.id && (
                          <CheckCircle2 size={16} color="#c0392b" style={{ flexShrink: 0 }} />
                        )}
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="empty-state" style={{ padding: '32px 0' }}>
                        <p style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>No clients found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Items */}
              {step === 2 && (
                <div className="wizard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Products */}
                  <div>
                    <p className="modal-section-title">Available Products</p>
                    <div className="search-bar" style={{ marginBottom: 10 }}>
                      <Search size={14} color="#b0b0b0" style={{ flexShrink: 0 }} />
                      <input
                        className="search-input"
                        placeholder="Search products…"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          disabled={p.is_out_of_stock}
                          onClick={() => !p.is_out_of_stock && addToCart(p)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: '1px solid #eae4dc',
                            background: p.is_out_of_stock ? '#fafaf8' : '#ffffff',
                            cursor: p.is_out_of_stock ? 'not-allowed' : 'pointer',
                            opacity: p.is_out_of_stock ? 0.5 : 1,
                            textAlign: 'left',
                            transition: 'border-color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={(e) => !p.is_out_of_stock && ((e.currentTarget as HTMLButtonElement).style.borderColor = '#c0392b')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#eae4dc')}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                            <span className="sku-tag">{p.sku}</span>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2e7d32' }}>${p.price.toFixed(2)}</p>
                            {p.is_out_of_stock ? (
                              <span className="badge-out-stock" style={{ fontSize: '0.6875rem' }}>Out</span>
                            ) : p.is_low_stock ? (
                              <span className="badge-low-stock" style={{ fontSize: '0.6875rem' }}>{p.stock_quantity} left</span>
                            ) : (
                              <span style={{ fontSize: '0.6875rem', color: '#9a9a9a' }}>{p.stock_quantity} in stock</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cart */}
                  <div>
                    <p className="modal-section-title">
                      Cart
                      {cart.length > 0 && (
                        <span style={{ float: 'right', fontWeight: 700, color: '#2e7d32' }}>
                          ${cartTotal.toFixed(2)}
                        </span>
                      )}
                    </p>
                    <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {cart.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                          <p style={{ fontSize: '0.8125rem', color: '#9a9a9a' }}>Click products to add them</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.product.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 6,
                              border: '1px solid #eae4dc',
                              background: '#ffffff',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.product.name}
                                </p>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2e7d32' }}>
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0b0b0', flexShrink: 0 }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => updateQty(item.product.id, -1)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 4,
                                  border: '1px solid #eae4dc',
                                  background: '#f4f0ec',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Minus size={11} />
                              </button>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', minWidth: 20, textAlign: 'center' }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.quantity >= item.product.stock_quantity}
                                onClick={() => updateQty(item.product.id, 1)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 4,
                                  border: '1px solid #eae4dc',
                                  background: '#f4f0ec',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: item.quantity >= item.product.stock_quantity ? 0.4 : 1,
                                }}
                              >
                                <Plus size={11} />
                              </button>
                              <span style={{ fontSize: '0.7rem', color: '#9a9a9a', marginLeft: 'auto' }}>
                                max {item.product.stock_quantity}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div>
                  <p className="modal-section-title">Order Summary</p>

                  {submitError && (
                    <div className="alert-error" style={{ marginBottom: 16 }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <span>{submitError}</span>
                        {insufficientItems.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            {insufficientItems.map((i) => (
                              <p key={i.product_id} style={{ fontSize: '0.75rem' }}>
                                <strong>{i.product_name}</strong>: requested {i.requested}, only {i.available} available
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div className="card-flat">
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Client
                      </p>
                      <p style={{ fontWeight: 600, color: '#1a1a1a' }}>{selectedCustomer?.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: '#8a8a8a' }}>{selectedCustomer?.email}</p>
                    </div>
                    <div className="card-flat">
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Order Total
                      </p>
                      <p style={{ fontSize: '1.375rem', fontWeight: 700, color: '#2e7d32' }}>${cartTotal.toFixed(2)}</p>
                      <p style={{ fontSize: '0.75rem', color: '#8a8a8a' }}>{cart.length} line item{cart.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="table-wrapper" style={{ marginBottom: 16 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.product.id}>
                            <td>
                              <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>{item.product.name}</p>
                              <span className="sku-tag">{item.product.sku}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: '#1565c0' }}>{item.quantity}</td>
                            <td>${item.product.price.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <label className="label">
                      Order Notes{' '}
                      <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#9a9a9a' }}>(optional)</span>
                    </label>
                    <textarea
                      className="input"
                      rows={2}
                      style={{ resize: 'none' }}
                      placeholder="Special instructions or delivery notes…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step > 1 && (
            <button
              type="button"
              className="btn-secondary"
              style={{ marginRight: 'auto' }}
              onClick={() => setStep((s) => (s - 1) as any)}
            >
              ← Back
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={(step === 1 && !selectedCustomer) || (step === 2 && cart.length === 0)}
              onClick={() => setStep((s) => (s + 1) as any)}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Placing Order…' : 'Place Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function PurchaseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.list({
        page,
        per_page: 15,
        status: statusFilter || undefined,
        search,
      });
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const STATUS_FILTERS = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'fulfilled', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{total} order{total !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Order
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="orders-filter-bar" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} color="#b0b0b0" style={{ flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="Search by reference number or client name…"
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
        <div className="filter-chips-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={statusFilter === f.value ? 'filter-chip-active' : 'filter-chip'}
            >
              {f.label}
            </button>
          ))}
          <button
            className="btn-icon"
            onClick={fetchOrders}
            title="Refresh"
            style={{ width: 36, height: 36 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Date Placed</th>
                <th>Items</th>
                <th>Value</th>
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
                      <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading orders…</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><ClipboardList size={22} /></div>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>No orders found</p>
                      <p style={{ fontSize: '0.875rem', color: '#8a8a8a', marginBottom: 16 }}>
                        {search || statusFilter ? 'Try adjusting your filters.' : 'Create your first purchase order.'}
                      </p>
                      {!search && !statusFilter && (
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                          <Plus size={14} /> Create Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setViewOrder(order)}
                  >
                    <td>
                      <span className="sku-tag">{order.order_number}</span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                        {order.customer_name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9a9a9a' }}>
                        {order.customer_email}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#6b6b6b' }}>
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>
                      {(order as any).items?.length ?? '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#2e7d32' }}>
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          onClick={(e) => { e.stopPropagation(); setViewOrder(order); }}
                          title="View details"
                        >
                          <ChevronRight size={15} />
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
              Page {page} of {pages} &middot; {total} total
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
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusChange={fetchOrders}
        />
      )}
      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchOrders}
        />
      )}
    </div>
  );
}
