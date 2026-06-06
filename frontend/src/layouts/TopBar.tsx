import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  MANAGER: 'Manager',
  VENDOR: 'Vendor',
};

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: '0.375rem',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <span className="topbar-title">
            {user ? `Welcome, ${user.firstName}` : 'VendorBridge'}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Role badge */}
        <span style={{
          fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.625rem',
          background: 'var(--primary-muted)', color: 'var(--primary)',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-light)',
        }}>
          {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
        </span>

        {/* User menu */}
        <div className="user-menu-wrap" ref={menuRef}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-lg)' }}
            onClick={() => setMenuOpen(v => !v)}
          >
            <div className="user-avatar">{initials}</div>
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {menuOpen && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-menu-email">{user?.email}</div>
              </div>
              <div
                className="user-menu-item danger"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
