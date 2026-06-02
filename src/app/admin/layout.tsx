import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    template: '%s — EMISA Admin',
    default: 'Admin — EMISA MAKEUP',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#050505',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
      }}
    >
      <AdminSidebar />

      {/* ── Main content area ── */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        {children}
      </main>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.8rem',
          },
        }}
      />
    </div>
  );
}
