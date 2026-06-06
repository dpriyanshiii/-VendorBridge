import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  ShoppingCart,
  Receipt,
  Settings,
  BarChart3,
  Activity,
  X,
  Menu,
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

const NAV_ITEMS = [
  {
    group: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER', 'VENDOR'] },
    ],
  },
  {
    group: 'Procurement',
    items: [
      { name: 'Vendors', path: '/vendors', icon: Users, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'] },
      { name: 'RFQs', path: '/rfqs', icon: FileText, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
      { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'] },
      { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'] },
      { name: 'Invoices', path: '/invoices', icon: Receipt, roles: ['ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR', 'MANAGER'] },
    ],
  },
  {
    group: 'Insights',
    items: [
      { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'] },
      { name: 'Activity Logs', path: '/activity', icon: Activity, roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'] },
    ],
  },
  {
    group: 'System',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, role }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 39,
            backdropFilter: 'blur(2px)',
          }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">V</div>
          <span className="sidebar-brand-name">VendorBridge</span>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--neutral-500)',
              cursor: 'pointer',
              display: 'none',
              padding: '0.25rem',
            }}
            className="mobile-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((group) => {
            const visibleItems = group.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.group}>
                <div className="sidebar-section-label">{group.group}</div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                    onClick={() => { if (window.innerWidth < 768) onClose(); }}
                  >
                    <item.icon className="sidebar-icon" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.6875rem',
          color: 'var(--neutral-600)',
        }}>
          VendorBridge v1.0
        </div>
      </aside>
    </>
  );
};
