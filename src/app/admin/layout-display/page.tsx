'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2, Trash2, LayoutGrid, CheckSquare, Square,
  Rows3, Columns2, Columns3, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

// ─── Types ─────────────────────────────────────────────────────────────────────
type BlockLayoutType = '1col' | '2col' | '3col';

interface PhotoItem {
  _id: string;
  title: string;
  imageUrl: string;
  order: number;
  category: string;
}

interface PhotoBlock {
  _id: string;
  photos: PhotoItem[];
  layoutType: BlockLayoutType;
  order: number;
}

// ─── Layout config ─────────────────────────────────────────────────────────────
const LAYOUT_OPTIONS: {
  value: BlockLayoutType;
  label: string;
  count: number;
  icon: React.ElementType;
  description: string;
}[] = [
  { value: '1col', label: '1 ảnh / hàng', count: 1, icon: Rows3, description: '1 ảnh ngang toàn chiều rộng' },
  { value: '2col', label: '2 ảnh / hàng', count: 2, icon: Columns2, description: '2 ảnh dọc cạnh nhau' },
  { value: '3col', label: '3 ảnh / hàng', count: 3, icon: Columns3, description: '3 ảnh dọc trong 1 hàng' },
];

// ─── Block Preview Row (like public page) ──────────────────────────────────────
function BlockPreviewRow({
  block,
  onDelete,
  deleting,
}: {
  block: PhotoBlock;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const cols = block.layoutType === '3col' ? 3 : block.layoutType === '2col' ? 2 : 1;
  const height = block.layoutType === '1col' ? 260 : block.layoutType === '2col' ? 240 : 200;

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Row header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 0.85rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.58rem',
            fontFamily: 'var(--font-geist-mono), monospace',
            padding: '1px 6px',
            letterSpacing: '0.1em',
          }}>
            BLOCK #{block.order}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
            {block.layoutType === '1col' ? '1 ảnh' : block.layoutType === '2col' ? '2 ảnh' : '3 ảnh'} · Bố cục {block.layoutType}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.6rem' }}>
            (ảnh #{block.photos.map(p => p.order).join(', #')})
          </span>
        </div>

        <button
          onClick={() => onDelete(block._id)}
          disabled={deleting}
          title="Xóa block này"
          style={{
            background: 'transparent',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: '6px',
            color: 'rgba(248,113,113,0.5)',
            cursor: deleting ? 'not-allowed' : 'pointer',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
            e.currentTarget.style.color = 'rgba(248,113,113,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(248,113,113,0.5)';
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Photo grid preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '2px',
        padding: '8px',
        background: '#080808',
      }}>
        {block.photos.map((photo) => (
          <div
            key={photo._id}
            style={{
              position: 'relative',
              height: `${height}px`,
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#1a1a1a',
            }}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              sizes={cols === 1 ? '100vw' : cols === 2 ? '50vw' : '33vw'}
              style={{ objectFit: 'cover' }}
            />
            {/* Order badge */}
            <div style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.6rem',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontWeight: 600,
              padding: '1px 5px',
              letterSpacing: '0.05em',
            }}>
              #{photo.order}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Photo Selector Card ────────────────────────────────────────────────────────
function PhotoSelectorCard({
  photo,
  selected,
  inBlock,
  onToggle,
}: {
  photo: PhotoItem;
  selected: boolean;
  inBlock: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={!inBlock ? onToggle : undefined}
      disabled={inBlock}
      style={{
        position: 'relative',
        background: selected
          ? 'rgba(74,222,128,0.08)'
          : inBlock
          ? 'rgba(255,255,255,0.02)'
          : '#0d0d0d',
        border: selected
          ? '1.5px solid rgba(74,222,128,0.4)'
          : inBlock
          ? '1.5px solid rgba(255,255,255,0.05)'
          : '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '0',
        cursor: inBlock ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        textAlign: 'left',
        width: '100%',
        opacity: inBlock ? 0.45 : 1,
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4' }}>
        <Image
          src={photo.imageUrl}
          alt={photo.title}
          fill
          sizes="180px"
          style={{ objectFit: 'cover' }}
        />

        {/* Order badge */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          background: 'rgba(0,0,0,0.75)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '4px',
          color: 'white',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontWeight: 700,
          padding: '1px 5px',
        }}>
          #{photo.order}
        </div>

        {/* Selection overlay */}
        {selected && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(74,222,128,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckSquare size={24} color="rgba(74,222,128,0.9)" />
          </div>
        )}

        {/* In-block overlay */}
        {inBlock && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
          }}>
            <Square size={16} color="rgba(255,255,255,0.3)" />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
              ĐÃ CÓ BLOCK
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.45rem 0.55rem' }}>
        <p style={{
          color: inBlock ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
          fontSize: '0.65rem',
          fontWeight: 500,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {photo.title}
        </p>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BlockManagerPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [blocks, setBlocks] = useState<PhotoBlock[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chosenLayout, setChosenLayout] = useState<BlockLayoutType | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // IDs already in a block
  const usedPhotoIds = new Set(blocks.flatMap((b) => b.photos.map((p) => p._id)));

  const fetchPhotos = useCallback(async () => {
    setPhotosLoading(true);
    try {
      const res = await fetch('/api/layouts?sortBy=order&limit=200');
      const data = await res.json();
      if (data.success) setPhotos(data.data);
    } catch {
      toast.error('Không thể tải danh sách ảnh.');
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  const fetchBlocks = useCallback(async () => {
    setBlocksLoading(true);
    try {
      const res = await fetch('/api/photo-blocks');
      const data = await res.json();
      if (data.success) setBlocks(data.data);
    } catch {
      toast.error('Không thể tải danh sách blocks.');
    } finally {
      setBlocksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetchBlocks();
  }, [fetchPhotos, fetchBlocks]);

  function togglePhoto(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Reset layout choice if selection changes
    setChosenLayout(null);
  }

  const selectedCount = selectedIds.size;

  async function handleCreateBlock() {
    if (!chosenLayout || selectedCount === 0) return;

    setCreating(true);
    try {
      const res = await fetch('/api/photo-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: Array.from(selectedIds),
          layoutType: chosenLayout,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Tạo block thất bại.');
        return;
      }

      toast.success(`Đã tạo block ${chosenLayout} thành công!`);
      setSelectedIds(new Set());
      setChosenLayout(null);
      await fetchBlocks();
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBlock(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/photo-blocks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa block.');
        await fetchBlocks();
      } else {
        toast.error(data.error ?? 'Xóa thất bại.');
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setDeletingId(null);
    }
  }

  const isLoading = photosLoading || blocksLoading;

  return (
    <div style={{ padding: '2rem 2.25rem', fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <LayoutGrid size={14} color="rgba(255,255,255,0.3)" />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Tuỳ chỉnh giao diện
          </span>
        </div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Quản lý Bố cục Khối
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.75rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          Tích chọn ảnh → chọn bố cục hàng → tạo block. Trang public sẽ hiển thị đúng như preview bên dưới.
        </p>
      </div>

      {isLoading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', padding: '5rem',
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
        }}>
          <Loader2 size={16} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>Đang tải...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── LEFT PANEL: Photo selector ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Selection action bar */}
            <div style={{
              background: '#0d0d0d',
              border: selectedCount > 0 ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              transition: 'border-color 0.2s',
            }}>
              {/* Selection count */}
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
                  {selectedCount === 0
                    ? 'Chưa chọn ảnh nào'
                    : `Đang chọn ${selectedCount} ảnh`}
                </span>
              </div>

              {/* Layout type buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {LAYOUT_OPTIONS.map((opt) => {
                  const isMatch = selectedCount === opt.count;
                  const isActive = chosenLayout === opt.value;
                  const isDisabled = !isMatch;

                  return (
                    <button
                      key={opt.value}
                      onClick={() => isMatch && setChosenLayout(opt.value)}
                      disabled={isDisabled}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.55rem 0.75rem',
                        background: isActive
                          ? 'rgba(74,222,128,0.1)'
                          : isMatch
                          ? 'rgba(255,255,255,0.04)'
                          : 'transparent',
                        border: isActive
                          ? '1px solid rgba(74,222,128,0.35)'
                          : isMatch
                          ? '1px solid rgba(255,255,255,0.12)'
                          : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      <opt.icon
                        size={14}
                        color={isActive ? 'rgba(74,222,128,0.9)' : isMatch ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
                      />
                      <div>
                        <p style={{
                          color: isActive ? 'rgba(74,222,128,0.9)' : isMatch ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          margin: 0,
                        }}>
                          {opt.label}
                        </p>
                        <p style={{
                          color: isActive ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.22)',
                          fontSize: '0.6rem',
                          margin: 0,
                        }}>
                          {isMatch
                            ? isActive ? '✓ Đã chọn bố cục này' : 'Nhấn để chọn bố cục này'
                            : `Cần chọn đúng ${opt.count} ảnh`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Validate hint */}
              {selectedCount > 0 && !chosenLayout && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                  padding: '0.5rem 0.6rem',
                  background: 'rgba(251,191,36,0.06)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  borderRadius: '7px',
                  marginBottom: '0.6rem',
                }}>
                  <AlertCircle size={12} color="rgba(251,191,36,0.7)" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(251,191,36,0.7)', fontSize: '0.62rem', lineHeight: 1.5 }}>
                    Đang chọn {selectedCount} ảnh — bố cục <strong>{selectedCount}col</strong> sẽ được kích hoạt.
                  </span>
                </div>
              )}

              {/* Create button */}
              <button
                onClick={handleCreateBlock}
                disabled={!chosenLayout || creating}
                style={{
                  width: '100%',
                  height: '36px',
                  background: chosenLayout && !creating
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '8px',
                  color: chosenLayout && !creating ? '#0a0a0a' : 'rgba(255,255,255,0.2)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: !chosenLayout || creating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                {creating && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {creating ? 'Đang tạo...' : chosenLayout ? `Tạo block ${chosenLayout}` : 'Chọn bố cục để tạo block'}
              </button>
            </div>

            {/* Photo list */}
            <div style={{
              background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '0.85rem',
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: '0 0 0.75rem',
              }}>
                {photos.length} ảnh — tích chọn để tạo block
              </p>

              {photos.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', textAlign: 'center', padding: '2rem 0' }}>
                  Chưa có ảnh. Tải ảnh lên từ trang Quản lý Layouts.
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  paddingRight: '2px',
                }}>
                  {photos.map((photo) => (
                    <PhotoSelectorCard
                      key={photo._id}
                      photo={photo}
                      selected={selectedIds.has(photo._id)}
                      inBlock={usedPhotoIds.has(photo._id)}
                      onToggle={() => togglePhoto(photo._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL: Blocks preview ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                  Preview Bố cục
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', margin: '2px 0 0' }}>
                  Hiển thị đúng như trang public — {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div style={{
                background: '#0d0d0d',
                border: '1px dashed rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '4rem',
                textAlign: 'center',
              }}>
                <LayoutGrid size={24} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
                  Chưa có block nào. Tích chọn ảnh và tạo block đầu tiên.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {blocks.map((block) => (
                  <BlockPreviewRow
                    key={block._id}
                    block={block}
                    onDelete={handleDeleteBlock}
                    deleting={deletingId === block._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
