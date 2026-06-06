'use client';

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, X, UploadCloud, ImageIcon, CheckCircle2, Hash } from 'lucide-react';
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

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export interface LayoutItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  fileSize: number;
  order: number;
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
  category: '',
  imageUrl: '',
  featured: false,
  fileSize: 0,
};

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<{ url: string; bytes: number }> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? 'Upload thất bại.');
  }

  const data = await res.json();
  return { url: data.secure_url as string, bytes: data.bytes as number };
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({
  value,
  onChange,
  onFileSizeChange,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  onFileSizeChange: (bytes: number) => void;
  disabled: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP...)');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Ảnh quá lớn! Tối đa 20MB.');
        return;
      }

      setUploading(true);
      setProgress(0);

      // Fake progress for UX
      const timer = setInterval(() => {
        setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
      }, 300);

      try {
        const { url, bytes } = await uploadToCloudinary(file);
        setProgress(100);
        onChange(url);
        onFileSizeChange(bytes);
        toast.success('Tải ảnh lên thành công!');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload thất bại.');
      } finally {
        clearInterval(timer);
        setUploading(false);
      }
    },
    [onChange, onFileSizeChange]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  const hasImage = !!value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Ảnh *
      </label>

      {/* Drop Zone */}
      <div
        onClick={() => !uploading && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!uploading && !disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          position: 'relative',
          width: '100%',
          height: hasImage ? '180px' : '130px',
          borderRadius: '10px',
          border: `2px dashed ${dragging ? 'rgba(255,255,255,0.5)' : hasImage ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}`,
          background: dragging ? 'rgba(255,255,255,0.05)' : '#111',
          cursor: (uploading || disabled) ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.2s, background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background image preview */}
        {hasImage && !uploading && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        {/* Overlay when image exists */}
        {hasImage && !uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}>
            <CheckCircle2 size={20} color="rgba(74,222,128,0.9)" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Đã tải lên</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>Click để đổi ảnh</span>
          </div>
        )}

        {/* Uploading state */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <Loader2 size={22} color="rgba(255,255,255,0.7)" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'rgba(255,255,255,0.75)',
                borderRadius: '99px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>
              Đang tải lên Cloudinary...
            </span>
          </div>
        )}

        {/* Empty state */}
        {!hasImage && !uploading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
            {dragging ? (
              <ImageIcon size={24} color="rgba(255,255,255,0.6)" />
            ) : (
              <UploadCloud size={24} color="rgba(255,255,255,0.25)" />
            )}
            <span style={{ color: dragging ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', fontSize: '0.75rem', textAlign: 'center' }}>
              {dragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.62rem' }}>
              hoặc click để chọn file — JPG, PNG, WEBP (tối đa 20MB)
            </span>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onInputChange}
          disabled={uploading || disabled}
        />
      </div>

      {/* Clear button */}
      {hasImage && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(''); onFileSizeChange(0); }}
          disabled={disabled}
          style={{
            alignSelf: 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'rgba(248,113,113,0.6)',
            fontSize: '0.65rem',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <X size={11} /> Xóa ảnh
        </button>
      )}
    </div>
  );
}

// ─── Order Info Banner ────────────────────────────────────────────────────────
function OrderInfoBanner({
  nextOrder,
  usedOrders,
  loading,
}: {
  nextOrder: number;
  usedOrders: number[];
  loading: boolean;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '0.75rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Hash size={11} color="rgba(255,255,255,0.3)" />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Số thứ tự ảnh
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Loader2 size={11} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>Đang tải...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Already used */}
          {usedOrders.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.62rem' }}>Đã dùng:</span>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {usedOrders.map((n) => (
                  <span
                    key={n}
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.6rem',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      padding: '1px 5px',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          {usedOrders.length > 0 && (
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.08)' }} />
          )}

          {/* Next order — highlight */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem' }}>Ảnh này sẽ là số:</span>
            <span style={{
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '5px',
              color: 'rgba(74,222,128,0.9)',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-geist-mono), monospace',
              padding: '1px 8px',
            }}>
              #{nextOrder}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function LayoutForm({ open, onClose, onSuccess, editItem }: LayoutFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [nextOrder, setNextOrder] = useState(1);
  const [usedOrders, setUsedOrders] = useState<number[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const isEdit = !!editItem;

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setCategories(data.data.map((c: { name: string }) => c.name));
        }
      } catch {
        // silent fallback
      }
    }
    loadCategories();
  }, []);

  // Fetch next order info when opening "add" form
  useEffect(() => {
    if (!open || isEdit) return;

    async function loadNextOrder() {
      setOrderLoading(true);
      try {
        const res = await fetch('/api/layouts/next-order');
        const data = await res.json();
        if (data.success) {
          setNextOrder(data.nextOrder ?? 1);
          setUsedOrders(data.usedOrders ?? []);
        }
      } catch {
        // silent
      } finally {
        setOrderLoading(false);
      }
    }
    loadNextOrder();
  }, [open, isEdit]);

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
      setForm((prev) => ({ ...emptyForm, category: prev.category || categories[0] || '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem, open]);

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên ảnh.');
      return;
    }
    if (!form.imageUrl) {
      toast.error('Vui lòng tải ảnh lên trước.');
      return;
    }
    if (!form.category) {
      toast.error('Vui lòng chọn danh mục.');
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

      toast.success(isEdit ? 'Cập nhật thành công!' : `Đã thêm ảnh #${nextOrder} thành công!`);
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
          maxWidth: '500px',
          fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
          padding: '1.5rem',
          maxHeight: '90vh',
          overflowY: 'auto',
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
            {isEdit ? 'Chỉnh sửa ảnh' : 'Thêm ảnh mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>

          {/* Order Info — only for add mode */}
          {!isEdit && (
            <OrderInfoBanner
              nextOrder={nextOrder}
              usedOrders={usedOrders}
              loading={orderLoading}
            />
          )}

          {/* Edit mode — show current order */}
          {isEdit && editItem?.order && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
            }}>
              <Hash size={11} color="rgba(255,255,255,0.25)" />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem' }}>
                Số thứ tự:
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-geist-mono), monospace',
              }}>
                #{editItem.order}
              </span>
            </div>
          )}

          {/* Image Upload */}
          <ImageUploadZone
            value={form.imageUrl}
            onChange={(url) => set('imageUrl', url)}
            onFileSizeChange={(bytes) => set('fileSize', bytes)}
            disabled={loading}
          />

          {/* Title */}
          <Field label="Tên ảnh *">
            <Input
              id="layout-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Tone hồng cô dâu"
              required
              disabled={loading}
              style={inputStyle}
            />
          </Field>

          {/* Category */}
          <Field label="Danh mục *">
            <Select
              value={form.category}
              onValueChange={(v) => { if (v) set('category', v); }}
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
                {(categories.length > 0 ? categories : ['MAKEUP CONCEPT']).map((cat) => (
                  <SelectItem key={cat} value={cat} style={{ fontSize: '0.8rem' }}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : `Thêm ảnh #${nextOrder}`}
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
