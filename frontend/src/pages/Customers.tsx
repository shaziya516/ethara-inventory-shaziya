import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Users, X,
  RefreshCw, Mail, Phone, MapPin, ShoppingBag, AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { customersApi } from '../api/customers';
import type { Customer } from '../types';
import { AxiosError } from 'axios';
import { format } from 'date-fns';

// ── Validation schema ─────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ── Client Modal ──────────────────────────────────────────
interface ClientModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

function ClientModal({ customer, onClose, onSave }: ClientModalProps) {
  const isEdit = !!customer;
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          address: customer.address || '',
        }
      : {},
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    setSaving(true);
    try {
      if (isEdit) await customersApi.update(customer!.id, data);
      else await customersApi.create(data);
      onSave();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setServerError(e.response?.data?.error || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a1a1a' }}>
              {isEdit ? 'Edit Client' : 'Register New Client'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#8a8a8a', marginTop: 2 }}>
              {isEdit ? 'Update client information below.' : 'Add a new client to your system.'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            {serverError && (
              <div className="alert-error" style={{ marginBottom: 20 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Section: Identity */}
            <p className="modal-section-title">Identity</p>
            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Full Name *</label>
                <input
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Alice Johnson"
                  {...register('name')}
                />
                {errors.name && (
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#c0392b' }}>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="alice@company.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#c0392b' }}>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section: Contact */}
            <p className="modal-section-title">Contact Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">
                  Phone Number{' '}
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#9a9a9a' }}>(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder="+1-555-0100"
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="label">
                  Mailing Address{' '}
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#9a9a9a' }}>(optional)</span>
                </label>
                <textarea
                  className="input"
                  rows={3}
                  style={{ resize: 'none' }}
                  placeholder="Street, City, State, ZIP Code"
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Client' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────
function DeleteClientModal({
  customer, onClose, onConfirm, error, loading,
}: {
  customer: Customer; onClose: () => void;
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
              Remove Client
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
            Remove{' '}
            <strong style={{ color: '#1a1a1a' }}>{customer.name}</strong>{' '}
            from your client list?
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#9a9a9a', marginTop: 8 }}>
            Clients with existing orders cannot be removed. This action is permanent.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Keep Client</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Removing…' : 'Remove Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Clients() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersApi.list({ page, per_page: 15, search });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await customersApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setDeleteError(e.response?.data?.error || 'Failed to remove client');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{total} registered client{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add Client
        </button>
      </div>

      {/* Search bar */}
      <div className="search-action-row" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={15} color="#b0b0b0" style={{ flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="Search by name, email address, or phone number…"
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
          onClick={fetchCustomers}
          title="Refresh"
          style={{ width: 38, height: 38 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Member Since</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div className="spinner" />
                      <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading clients…</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Users size={22} /></div>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>No clients found</p>
                      <p style={{ fontSize: '0.875rem', color: '#8a8a8a', marginBottom: 16 }}>
                        {search ? 'Try a different search term.' : 'Add your first client to get started.'}
                      </p>
                      {!search && (
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                          <Plus size={14} /> Add First Client
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    {/* Client name + avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#fde8e6',
                            border: '1.5px solid #f5c0bb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#c0392b',
                            flexShrink: 0,
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.9rem' }}>
                          {c.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#3d3d3d' }}>
                        <Mail size={12} color="#b0b0b0" style={{ flexShrink: 0 }} />
                        {c.email}
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      {c.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#6b6b6b' }}>
                          <Phone size={12} color="#b0b0b0" style={{ flexShrink: 0 }} />
                          {c.phone}
                        </div>
                      ) : (
                        <span style={{ color: '#d4d4d4', fontSize: '0.875rem' }}>—</span>
                      )}
                    </td>

                    {/* Location */}
                    <td>
                      {c.address ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 6,
                            fontSize: '0.8125rem',
                            color: '#6b6b6b',
                            maxWidth: 180,
                          }}
                        >
                          <MapPin size={12} color="#b0b0b0" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {c.address}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#d4d4d4', fontSize: '0.875rem' }}>—</span>
                      )}
                    </td>

                    {/* Orders count */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShoppingBag size={13} color={c.total_orders > 0 ? '#c0392b' : '#d4d4d4'} />
                        <span
                          style={{
                            fontWeight: c.total_orders > 0 ? 700 : 400,
                            color: c.total_orders > 0 ? '#1a1a1a' : '#d4d4d4',
                            fontSize: '0.875rem',
                          }}
                        >
                          {c.total_orders}
                        </span>
                      </div>
                    </td>

                    {/* Member since */}
                    <td style={{ fontSize: '0.8125rem', color: '#8a8a8a' }}>
                      {format(new Date(c.created_at), 'MMM d, yyyy')}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          className="btn-icon"
                          onClick={() => setEditCustomer(c)}
                          title="Edit client"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => { setDeleteTarget(c); setDeleteError(''); }}
                          title="Remove client"
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
      {showAddModal && (
        <ClientModal
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); fetchCustomers(); }}
        />
      )}
      {editCustomer && (
        <ClientModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onSave={() => { setEditCustomer(null); fetchCustomers(); }}
        />
      )}
      {deleteTarget && (
        <DeleteClientModal
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          error={deleteError}
          loading={deleting}
        />
      )}
    </div>
  );
}
