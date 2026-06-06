'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Images,
  Settings,
  LogOut,
  Sparkles,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/layouts', label: 'Quản lý Ảnh', icon: Images },
  { href: '/admin/categories', label: 'Danh mục', icon: Tag },
  { href: '/admin/layout-display', label: 'Quản lý Blocks', icon: LayoutGrid },
  { href: '/admin/settings', label: 'Cài đặt hệ thống', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
        zIndex: 10,
      }}
    >
      {/* ── Brand ── */}
      <div
        style={{
          padding: '1.4rem 1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={13} color="rgba(255,255,255,0.7)" />
          </div>
          <div>
            <p
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              EMISA MAKEUP
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: '0.5rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                margin: 0,
                marginTop: '1px',
              }}
            >
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav style={{ flex: 1, padding: '0.75rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.52rem 0.75rem',
                borderRadius: '8px',
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.38)',
                fontSize: '0.78rem',
                fontWeight: active ? 500 : 400,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                border: active ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.38)';
                }
              }}
            >
              <Icon size={14} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: '0.75rem 0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.52rem 0.75rem',
            borderRadius: '8px',
            background: 'transparent',
            color: loggingOut ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.32)',
            fontSize: '0.78rem',
            fontWeight: 400,
            border: '1px solid transparent',
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s, color 0.15s',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            if (!loggingOut) {
              e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
              e.currentTarget.style.color = 'rgba(252,165,165,0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loggingOut) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.32)';
            }
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    </aside>
  );
}
