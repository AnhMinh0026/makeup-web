'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  GripVertical,
  FolderOpen,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
}

// ─── Inline editable row ─────────────────────────────────────────────────────
function CategoryRow({
  cat,
  onDelete,
  onRename,
}: {
  cat: Category;
  onDelete: (id: string, name: string) => void;
  onRename: (id: string, newName: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(cat.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setValue(cat.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  }

  function cancelEdit() {
    setValue(cat.name);
    setEditing(false);
  }

  async function confirmEdit() {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed || trimmed === cat.name) { setEditing(false); return; }
    setSaving(true);
    const ok = await onRename(cat._id, trimmed);
    setSaving(false);
    if (ok) setEditing(false);
  }

  async function handleDelete() {
    setDeleting(true);
    onDelete(cat._id, cat.name);
    setDeleting(false);
  }

  const tdStyle: React.CSSProperties = {
    padding: '0.7rem 0.85rem',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    verticalAlign: 'middle',
  };

  return (
    <tr>
      {/* Drag handle + order */}
      <td style={{ ...tdStyle, width: '44px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
          <GripVertical size={12} color="rgba(255,255,255,0.2)" />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', fontFamily: 'monospace' }}>
            {String(cat.order).padStart(2, '0')}
          </span>
        </div>
      </td>

      {/* Name */}
      <td style={{ ...tdStyle, flex: 1 }}>
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
            disabled={saving}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.78rem',
              padding: '0.3rem 0.65rem',
              outline: 'none',
              width: '100%',
              maxWidth: '320px',
              fontFamily: 'inherit',
            }}
            autoFocus
          />
        ) : (
          <span style={{ letterSpacing: '0.06em', fontWeight: 500 }}>{cat.name}</span>
        )}
      </td>

      {/* Slug */}
      <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontFamily: 'monospace' }}>
        {cat.slug}
      </td>

      {/* Date */}
      <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.22)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
        {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
      </td>

      {/* Actions */}
      <td style={{ ...tdStyle, width: '96px' }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          {editing ? (
            <>
              <ActionBtn
                onClick={confirmEdit}
                disabled={saving}
                color="#4ade80"
                title="Lưu"
              >
                {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
              </ActionBtn>
              <ActionBtn onClick={cancelEdit} disabled={saving} color="rgba(255,255,255,0.4)" title="Hủy">
                <X size={12} />
              </ActionBtn>
            </>
          ) : (
            <>
              <ActionBtn onClick={startEdit} color="rgba(255,255,255,0.4)" title="Đổi tên">
                <Pencil size={12} />
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                disabled={deleting}
                color="rgba(248,113,113,0.7)"
                hoverColor="rgba(248,113,113,1)"
                title="Xóa"
              >
                {deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
              </ActionBtn>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({
  onClick,
  disabled,
  children,
  color,
  hoverColor,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  color: string;
  hoverColor?: string;
  title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px',
        color: hovered && hoverColor ? hoverColor : color,
        padding: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Confirm dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch {
      toast.error('Không thể tải danh mục.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAdd() {
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) { toast.error('Vui lòng nhập tên danh mục.'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Có lỗi xảy ra.');
      } else {
        toast.success(`Đã thêm danh mục "${trimmed}"`);
        setNewName('');
        setShowAdd(false);
        fetchCategories();
      }
    } catch {
      toast.error('Không thể kết nối server.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(id: string, newCatName: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Không thể đổi tên.');
        return false;
      }
      toast.success('Đã đổi tên danh mục.');
      fetchCategories();
      return true;
    } catch {
      toast.error('Không thể kết nối server.');
      return false;
    }
  }

  function requestDelete(id: string, name: string) {
    setConfirmDelete({ id, name });
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${confirmDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Không thể xóa danh mục.');
      } else {
        toast.success(`Đã xóa danh mục "${confirmDelete.name}"`);
        fetchCategories();
      }
    } catch {
      toast.error('Không thể kết nối server.');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  // ─── Panel card style ──────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: '#0d0d0d',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  return (
    <div style={{ padding: '2rem 2.25rem', fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cat-add-input:focus { border-color: rgba(255,255,255,0.28) !important; outline: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Tag size={14} color="rgba(255,255,255,0.3)" />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Quản lý
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Danh mục
          </h1>
          <button
            onClick={() => setShowAdd((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            <Plus size={13} />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* ── Add form ── */}
      {showAdd && (
        <div style={{ ...cardStyle, padding: '1.1rem 1.25rem', marginBottom: '1rem', borderColor: 'rgba(255,255,255,0.12)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
            Tên danh mục mới
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input
              className="cat-add-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewName(''); } }}
              placeholder="VD: MAKEUP CONCEPT"
              disabled={adding}
              autoFocus
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.82rem',
                padding: '0.45rem 0.75rem',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
                transition: 'border-color 0.15s',
              }}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              style={{
                background: adding ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                color: adding ? 'rgba(255,255,255,0.3)' : '#0a0a0a',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: adding ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
              }}
            >
              {adding ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
              {adding ? 'Đang thêm...' : 'Xác nhận'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); }}
              disabled={adding}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', padding: '0.45rem 0.7rem', cursor: 'pointer' }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderOpen size={13} color="rgba(255,255,255,0.4)" />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500 }}>
              Tất cả danh mục
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', fontFamily: 'monospace' }}>
            {categories.length} danh mục
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={18} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
              Đang tải...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Tag size={24} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              Chưa có danh mục nào
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Tên danh mục', 'Slug', 'Ngày tạo', ''].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.58rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.2)',
                      textAlign: i === 4 ? 'right' : 'left',
                      fontWeight: 400,
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <CategoryRow
                  key={cat._id}
                  cat={cat}
                  onDelete={requestDelete}
                  onRename={handleRename}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Confirm Delete Dialog ── */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            style={{
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '1.5rem',
              maxWidth: '380px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={14} color="rgba(248,113,113,0.8)" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                Xóa danh mục?
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 1.1rem' }}>
              Bạn sắp xóa danh mục{' '}
              <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{confirmDelete.name}</strong>.
              Nếu còn ảnh thuộc danh mục này, yêu cầu sẽ bị từ chối.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => !deleting && setConfirmDelete(null)}
                disabled={deleting}
                style={{ flex: 1, padding: '0.52rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={deleting}
                style={{
                  flex: 1, padding: '0.52rem',
                  background: deleting ? 'rgba(248,113,113,0.1)' : 'rgba(248,113,113,0.85)',
                  border: 'none', borderRadius: '8px',
                  color: deleting ? 'rgba(248,113,113,0.4)' : '#fff',
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                {deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
