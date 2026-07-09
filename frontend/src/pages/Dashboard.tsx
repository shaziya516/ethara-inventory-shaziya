import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Archive, Users,
  AlertTriangle, Clock, TrendingUp, Plus, ArrowRight,
  CheckCircle, Circle, Loader, XCircle,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import type { DashboardStats } from '../types';
import { format } from 'date-fns';

// ── Status display helpers ─────────────────────────────────
const ORDER_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:    { label: 'Pending',    icon: Circle,      color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'Processing', icon: Loader,      color: '#1565c0', bg: '#e3f2fd' },
  fulfilled:  { label: 'Delivered',  icon: CheckCircle, color: '#2e7d32', bg: '#e8f5e9' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,     color: '#c0392b', bg: '#fde8e6' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status] || { label: status, icon: Circle, color: '#6b6b6b', bg: '#f4f0ec' };
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 99,
        background: cfg.bg,
        color: cfg.color,
        fontSize: '0.75rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, iconColor, iconBg, note,
}: {
  label: string; value: string | number; icon: React.ElementType;
  iconColor: string; iconBg: string; note?: string;
}) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon" style={{ background: iconBg }}>
          <Icon size={17} color={iconColor} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      {note && (
        <div style={{ fontSize: '0.75rem', color: '#8a8a8a', marginTop: 2 }}>{note}</div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.stats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: 12 }}>
        <div className="spinner" />
        <span style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>Loading overview…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><AlertTriangle size={22} /></div>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
          Could not load data
        </p>
        <p style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>{error || 'No data available'}</p>
      </div>
    );
  }

  const { summary, orders_by_status, low_stock_alerts, recent_orders, top_products } = stats;

  const totalRevFmt = `$${summary.total_revenue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Business snapshot
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => navigate('/products')}>
            <Archive size={14} /> Add Stock
          </button>
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <KpiCard
          label="Total Revenue"
          value={totalRevFmt}
          icon={DollarSign}
          iconColor="#2e7d32"
          iconBg="#e8f5e9"
          note="Fulfilled orders only"
        />
        <KpiCard
          label="Purchase Orders"
          value={summary.total_orders.toLocaleString()}
          icon={ShoppingBag}
          iconColor="#c0392b"
          iconBg="#fde8e6"
        />
        <KpiCard
          label="SKUs in Inventory"
          value={summary.total_products.toLocaleString()}
          icon={Archive}
          iconColor="#1565c0"
          iconBg="#e3f2fd"
        />
        <KpiCard
          label="Registered Clients"
          value={summary.total_customers.toLocaleString()}
          icon={Users}
          iconColor="#6d28d9"
          iconBg="#ede9fe"
        />
      </div>

      {/* Status summary strip */}
      {Object.keys(orders_by_status).length > 0 && (
        <div
          className="status-strip"
          style={{
            display: 'flex',
            gap: 0,
            background: '#ffffff',
            border: '1px solid #eae4dc',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {Object.entries(orders_by_status).map(([status, count], i, arr) => {
            const cfg = ORDER_STATUS_CONFIG[status] || { label: status, color: '#6b6b6b', bg: '#f4f0ec', icon: Circle };
            return (
              <div
                key={status}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  borderRight: i < arr.length - 1 ? '1px solid #eae4dc' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8a8a8a', textTransform: 'capitalize' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: cfg.color }}>
                  {count as number}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#b0b0b0' }}>orders</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main content grid */}
      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>

        {/* Recent orders table */}
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px 16px',
              borderBottom: '1px solid #eae4dc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#c0392b" />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                Recent Activity
              </span>
            </div>
            <button
              className="btn-ghost"
              onClick={() => navigate('/orders')}
              style={{ fontSize: '0.8125rem' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {recent_orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ShoppingBag size={20} /></div>
              <p style={{ fontSize: '0.875rem', color: '#8a8a8a' }}>No orders recorded yet</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="sku-tag">{order.order_number}</span>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.875rem' }}>
                            {order.customer_name}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9a9a9a' }}>
                            {order.customer_email}
                          </p>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#8a8a8a' }}>
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </td>
                      <td style={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.9rem' }}>
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td>
                        <StatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Low stock alerts */}
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px 14px',
                borderBottom: '1px solid #eae4dc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={15} color="#e65100" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>
                  Stock Alerts
                </span>
              </div>
              {low_stock_alerts.length > 0 && (
                <span
                  style={{
                    background: '#fde8e6',
                    color: '#c0392b',
                    borderRadius: 99,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid #f5c0bb',
                  }}
                >
                  {low_stock_alerts.length}
                </span>
              )}
            </div>

            {low_stock_alerts.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center' }}>
                <CheckCircle size={22} color="#a5d6a7" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.8125rem', color: '#8a8a8a' }}>All items well-stocked</p>
              </div>
            ) : (
              <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {low_stock_alerts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </p>
                      <span className="sku-tag" style={{ marginTop: 2 }}>{product.sku}</span>
                    </div>
                    <span
                      className={product.is_out_of_stock ? 'badge-out-stock' : 'badge-low-stock'}
                      style={{ flexShrink: 0, marginLeft: 8 }}
                    >
                      {product.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}

            {low_stock_alerts.length > 0 && (
              <div style={{ padding: '8px 18px 14px' }}>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                  onClick={() => navigate('/products')}
                >
                  Manage Inventory <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Top products */}
          {top_products.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '16px 18px 14px',
                  borderBottom: '1px solid #eae4dc',
                }}
              >
                <TrendingUp size={15} color="#c0392b" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>
                  Best Sellers
                </span>
              </div>
              <div style={{ padding: '10px 8px' }}>
                {top_products.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: i === 0 ? '#fde8e6' : '#f4f0ec',
                        color: i === 0 ? '#c0392b' : '#8a8a8a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: '#9a9a9a' }}>
                        {p.total_sold} units sold
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2e7d32', flexShrink: 0 }}>
                      ${p.total_revenue.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="card">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Add new product',  path: '/products',  icon: Archive },
                { label: 'Create order',     path: '/orders',    icon: ShoppingBag },
                { label: 'Register client',  path: '/customers', icon: Users },
              ].map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  className="btn-secondary"
                  style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => navigate(path)}
                >
                  <Icon size={14} color="#c0392b" />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
