'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LayoutForm, { LayoutItem } from '@/components/admin/LayoutForm';

const PAGE_SIZE = 10;

// ─── Format helpers ────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '14px',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '400px',
          fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
          padding: '1.5rem',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 600 }}
          >
            Xác nhận xóa
          </DialogTitle>
        </DialogHeader>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', margin: '0.5rem 0 1.25rem' }}>
          Bạn chắc chắn muốn xóa layout{' '}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>"{title}"</span>?
          Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              height: '36px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.45)',
              borderRadius: '8px',
              fontSize: '0.8rem',
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              height: '36px',
              background: loading ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.85)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LayoutsManagerPage() {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<LayoutItem | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<LayoutItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLayouts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/layouts?page=${p}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (data.success) {
        setLayouts(data.data);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? data.count ?? 0);
      } else {
        toast.error(data.error ?? 'Không thể tải dữ liệu.');
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLayouts(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAdd() {
    setEditItem(null);
    setFormOpen(true);
  }

  function openEdit(item: LayoutItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/layouts/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa layout thành công.');
        setDeleteTarget(null);
        // Go back a page if last item on current page deleted
        const newPage = layouts.length === 1 && page > 1 ? page - 1 : page;
        setPage(newPage);
        fetchLayouts(newPage);
      } else {
        toast.error(data.error ?? 'Xóa thất bại.');
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setDeleting(false);
    }
  }

  const thStyle: React.CSSProperties = {
    padding: '0.65rem 0.85rem',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 400,
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.75rem 0.85rem',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.72)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '2rem 2.25rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
            Nội dung
          </p>
          <h1 style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '0.2rem 0 0',
            fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
          }}>
            Quản lý Layouts
          </h1>
        </div>
        <Button
          id="add-layout-btn"
          onClick={openAdd}
          style={{
            height: '36px',
            background: 'rgba(255,255,255,0.9)',
            color: '#0a0a0a',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            paddingInline: '0.9rem',
            border: 'none',
          }}
        >
          <Plus size={14} />
          Tải ảnh mới
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
          {loading ? '...' : `${total} layouts`}
          {totalPages > 1 && ` · Trang ${page}/${totalPages}`}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'rgba(255,255,255,0.2)', gap: '0.6rem', fontSize: '0.75rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Đang tải dữ liệu...
          </div>
        ) : layouts.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', letterSpacing: '0.12em' }}>
            Chưa có layout nào. Bấm "Tải ảnh mới" để bắt đầu.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '52px' }}>Ảnh</th>
                <th style={thStyle}>Tên Layout</th>
                <th style={thStyle}>Danh mục</th>
                <th style={thStyle}>Ngày up</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Dung lượng</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '90px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {layouts.map((item) => (
                <tr
                  key={item._id}
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  {/* Thumbnail */}
                  <td style={tdStyle}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '6px',
                      overflow: 'hidden', background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.opacity = '0.2'; }}
                      />
                    </div>
                  </td>

                  {/* Title */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 500, fontSize: '0.8rem' }}>
                        {item.title}
                      </span>
                      {item.featured && (
                        <Star size={10} color="rgba(251,191,36,0.75)" fill="rgba(251,191,36,0.4)" />
                      )}
                    </div>
                    {item.description && (
                      <p style={{
                        color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem',
                        marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis', maxWidth: '260px',
                      }}>
                        {item.description}
                      </p>
                    )}
                  </td>

                  {/* Category */}
                  <td style={tdStyle}>
                    <Badge
                      variant="outline"
                      style={{
                        fontSize: '0.55rem',
                        letterSpacing: '0.1em',
                        padding: '2px 7px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.45)',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '4px',
                        fontWeight: 400,
                      }}
                    >
                      {item.category}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.7rem' }}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* File size */}
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)' }}>
                    {formatBytes(item.fileSize)}
                  </td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <ActionBtn
                        title="Chỉnh sửa"
                        onClick={() => openEdit(item)}
                        color="rgba(96,165,250,0.7)"
                        hoverBg="rgba(96,165,250,0.12)"
                      >
                        <Pencil size={12} />
                      </ActionBtn>
                      <ActionBtn
                        title="Xóa"
                        onClick={() => setDeleteTarget(item)}
                        color="rgba(252,165,165,0.7)"
                        hoverBg="rgba(220,38,38,0.12)"
                      >
                        <Trash2 size={12} />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              width: '32px', height: '32px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: '32px', height: '32px',
                background: p === page ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                color: p === page ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
                fontWeight: p === page ? 700 : 400,
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              width: '32px', height: '32px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Dialogs ── */}
      <LayoutForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => fetchLayouts(page)}
        editItem={editItem}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Icon button helper ────────────────────────────────────────────────────────
function ActionBtn({
  children,
  onClick,
  title,
  color,
  hoverBg,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  color: string;
  hoverBg: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '28px', height: '28px',
        background: hovered ? hoverBg : 'transparent',
        border: '1px solid transparent',
        borderRadius: '6px',
        color,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  );
}
