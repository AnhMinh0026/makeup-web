'use client';

import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LAYOUT_CATEGORIES } from '@/lib/categories';

export interface LayoutItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  fileSize: number;
  createdAt: string;
}

interface LayoutFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: LayoutItem | null;
}

const emptyForm = {
  title: '',
  description: '',
  category: 'MAKEUP CONCEPT',
  imageUrl: '',
  featured: false,
  fileSize: 0,
};

export default function LayoutForm({ open, onClose, onSuccess, editItem }: LayoutFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const isEdit = !!editItem;

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title,
        description: editItem.description ?? '',
        category: editItem.category,
        imageUrl: editItem.imageUrl,
        featured: editItem.featured,
        fileSize: editItem.fileSize,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Tên layout và URL ảnh là bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/layouts/${editItem!._id}` : '/api/layouts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Có lỗi xảy ra.');
        return;
      }

      toast.success(isEdit ? 'Cập nhật thành công!' : 'Thêm layout thành công!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Không thể kết nối server.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.82rem',
    height: '38px',
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '14px',
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '480px',
          fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
          padding: '1.5rem',
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {isEdit ? 'Chỉnh sửa Layout' : 'Thêm Layout mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.5rem' }}>

          {/* Title */}
          <Field label="Tên Layout *">
            <Input
              id="layout-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Ethereal Bridal Glow"
              required
              disabled={loading}
              style={inputStyle}
            />
          </Field>

          {/* Description */}
          <Field label="Mô tả">
            <textarea
              id="layout-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Mô tả ngắn về bộ ảnh..."
              disabled={loading}
              rows={2}
              style={{
                ...inputStyle,
                height: 'auto',
                width: '100%',
                padding: '0.5rem 0.75rem',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </Field>

          {/* Category */}
          <Field label="Danh mục">
            <Select
              value={form.category}
              onValueChange={(v) => set('category', v)}
              disabled={loading}
            >
              <SelectTrigger
                id="layout-category"
                style={{ ...inputStyle, width: '100%', paddingLeft: '0.75rem' }}
              >
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {LAYOUT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} style={{ fontSize: '0.8rem' }}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Image URL */}
          <Field label="URL Ảnh (Cloudinary) *">
            <Input
              id="layout-image-url"
              type="url"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              required
              disabled={loading}
              style={inputStyle}
            />
          </Field>

          {/* Image preview */}
          {form.imageUrl && (
            <div
              style={{
                width: '100%',
                height: '120px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#1a1a1a',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          {/* File size */}
          <Field label="Dung lượng (bytes)">
            <Input
              id="layout-filesize"
              type="number"
              min={0}
              value={form.fileSize}
              onChange={(e) => set('fileSize', parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={loading}
              style={inputStyle}
            />
          </Field>

          {/* Featured toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <input
              id="layout-featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              disabled={loading}
              style={{ accentColor: 'rgba(255,255,255,0.7)', width: '14px', height: '14px' }}
            />
            Đánh dấu là Featured (nổi bật)
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
            <Button
              id="layout-form-cancel"
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                height: '38px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.45)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              <X size={13} style={{ marginRight: '4px' }} />
              Hủy
            </Button>
            <Button
              id="layout-form-submit"
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: '38px',
                background: loading ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                color: loading ? 'rgba(255,255,255,0.3)' : '#0a0a0a',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          textarea:focus { border-color: rgba(255,255,255,0.28) !important; outline: none; }
          [data-radix-popper-content-wrapper] { z-index: 9999 !important; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

// Small helper
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.62rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
