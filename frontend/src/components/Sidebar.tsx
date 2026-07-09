import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  Archive,
  Users,
  ClipboardList,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutGrid, label: 'Overview' },
      { to: '/products',  icon: Archive,       label: 'Inventory' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/orders',    icon: ClipboardList, label: 'Purchase Orders' },
      { to: '/customers', icon: Users,         label: 'Clients' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <aside
      className={`sidebar-wrapper ${isOpen ? 'sidebar-open' : ''}`}
      style={{
        width: 228,
        flexShrink: 0,
        background: '#ffffff',
        borderRight: '1px solid #eae4dc',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid #eae4dc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: '#c0392b',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Archive size={17} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a1a', letterSpacing: '-0.01em' }}>
              Stockwise
            </div>
            <div style={{fontSize: '0.6875rem', color: '#9a9a9a', marginTop: 1, letterSpacing: '0.02em' }}>
              Admin Console
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          className="btn-icon mobile-sidebar-close"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#b0b0b0',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                padding: '0 8px',
                marginBottom: 6,
              }}
            >
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link-active' : 'nav-link'
                  }
                  onClick={() => {
                    if (window.innerWidth <= 768 && onClose) onClose();
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + logout */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #eae4dc',
        }}
      >
        <div
          style={{
            background: '#fafaf8',
            border: '1px solid #eae4dc',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
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
              flexShrink: 0,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#c0392b',
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1a1a1a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.username}
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: '#9a9a9a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </div>
          </div>
          <ChevronDown size={13} style={{ color: '#b0b0b0', flexShrink: 0 }} />
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#8a8a8a',
            cursor: 'pointer',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fde8e6';
            (e.currentTarget as HTMLButtonElement).style.color = '#c0392b';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#8a8a8a';
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
