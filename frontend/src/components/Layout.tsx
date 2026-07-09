import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#fafaf8',
        overflow: 'hidden',
      }}
    >
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button
          className="btn-icon"
          onClick={() => setSidebarOpen(true)}
          style={{ width: 36, height: 36 }}
        >
          <Menu size={18} />
        </button>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a1a' }}>
          Stockwise
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#fafaf8',
        }}
      >
        <div
          className="animate-fade-in page-content-wrapper"
          style={{
            padding: '28px 32px',
            minHeight: '100%',
            maxWidth: 1320,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
