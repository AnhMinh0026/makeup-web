'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CircleDollarSign,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  price: string;
  items: string[];
  highlight: boolean;
  order: number;
  createdAt: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editItemsText, setEditItemsText] = useState('');
  const [editHighlight, setEditHighlight] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const json = await res.json();
      if (json.success) {
        setServices(json.data);
      }
    } catch {
      toast.error('Không thể tải bảng giá dịch vụ.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  async function handleAdd() {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ.');
      return;
    }
    if (!price.trim()) {
      toast.error('Vui lòng nhập giá dịch vụ.');
      return;
    }

    setAdding(true);
    const items = itemsText
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: price.trim(),
          items,
          highlight,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi thêm dịch vụ.');
      } else {
        toast.success(`Đã thêm gói "${name.trim()}"`);
        setName('');
        setPrice('');
        setItemsText('');
        setHighlight(false);
        setShowAdd(false);
        fetchServices();
      }
    } catch {
      toast.error('Không thể kết nối đến server.');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(srv: Service) {
    setEditingId(srv._id);
    setEditName(srv.name);
    setEditPrice(srv.price);
    setEditItemsText(srv.items.join('\n'));
    setEditHighlight(srv.highlight);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) {
      toast.error('Tên dịch vụ không được trống.');
      return;
    }
    if (!editPrice.trim()) {
      toast.error('Giá dịch vụ không được trống.');
      return;
    }

    setUpdating(true);
    const items = editItemsText
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          price: editPrice.trim(),
          items,
          highlight: editHighlight,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi cập nhật dịch vụ.');
      } else {
        toast.success('Đã cập nhật dịch vụ thành công.');
        setEditingId(null);
        fetchServices();
      }
    } catch {
      toast.error('Không thể kết nối đến server.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleOrderChange(srv: Service, direction: 'up' | 'down') {
    const currentIndex = services.findIndex((s) => s._id === srv._id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === services.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetSrv = services[targetIndex];

    try {
      // Swap orders
      const order1 = srv.order;
      const order2 = targetSrv.order;

      await Promise.all([
        fetch(`/api/services/${srv._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: order2 }),
        }),
        fetch(`/api/services/${targetSrv._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: order1 }),
        }),
      ]);

      fetchServices();
    } catch {
      toast.error('Lỗi khi đổi thứ tự hiển thị.');
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/services/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Không thể xóa dịch vụ.');
      } else {
        toast.success(`Đã xóa dịch vụ "${confirmDelete.name}"`);
        fetchServices();
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: '#0d0d0d',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.82rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ padding: '2rem 2.25rem', fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .service-input:focus { border-color: rgba(255,255,255,0.28) !important; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <CircleDollarSign size={14} color="rgba(255,255,255,0.3)" />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Quản lý
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Bảng Giá Dịch Vụ
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
            Thêm gói dịch vụ
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ ...cardStyle, padding: '1.4rem 1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(255,255,255,0.12)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
            Thêm gói dịch vụ mới
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Tên dịch vụ</label>
                <input
                  className="service-input"
                  style={inputStyle}
                  placeholder="VD: Makeup Cô Dâu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Giá cả (hiển thị)</label>
                <input
                  className="service-input"
                  style={inputStyle}
                  placeholder="VD: Từ 2.500.000đ"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Chi tiết dịch vụ (Mỗi dòng là một mục đầu dòng)</label>
              <textarea
                className="service-input"
                style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                placeholder="VD:&#10;Tư vấn & thử makeup trước ngày cưới&#10;Makeup cô dâu ngày cưới&#10;Bao gồm làm tóc cơ bản"
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="add-highlight"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="add-highlight" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                Gói nổi bật (PHỔ BIẾN NHẤT) - Sẽ hiển thị viền nổi bật & nhãn riêng
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => { setShowAdd(false); setName(''); setPrice(''); setItemsText(''); setHighlight(false); }}
                disabled={adding}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: 'rgba(255,255,255,0.45)', padding: '0.45rem 1rem', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 1.25rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: adding ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {adding ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
                {adding ? 'Đang thêm...' : 'Lưu gói giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div style={cardStyle}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500 }}>
            Tất cả gói dịch vụ ({services.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={18} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <CircleDollarSign size={24} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
              Chưa có gói dịch vụ nào. Hãy bấm "Thêm gói dịch vụ" ở trên.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {services.map((srv, index) => {
              const isEditing = editingId === srv._id;
              return (
                <div
                  key={srv._id}
                  className="row-hover"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: index === services.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: srv.highlight ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                >
                  {isEditing ? (
                    /* Edit Form inline */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Tên dịch vụ</label>
                          <input
                            className="service-input"
                            style={inputStyle}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Giá cả</label>
                          <input
                            className="service-input"
                            style={inputStyle}
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Chi tiết dịch vụ (Mỗi dòng 1 mục)</label>
                        <textarea
                          className="service-input"
                          style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                          value={editItemsText}
                          onChange={(e) => setEditItemsText(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            id={`edit-highlight-${srv._id}`}
                            checked={editHighlight}
                            onChange={(e) => setEditHighlight(e.target.checked)}
                          />
                          <label htmlFor={`edit-highlight-${srv._id}`} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                            Gói nổi bật (PHỔ BIẾN NHẤT)
                          </label>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={cancelEdit}
                            disabled={updating}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', padding: '0.35rem 0.75rem', fontSize: '0.72rem', cursor: 'pointer' }}
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleUpdate(srv._id)}
                            disabled={updating}
                            style={{
                              background: '#fff',
                              color: '#000',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.9rem',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: updating ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            {updating ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={11} />}
                            Lưu
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Read Mode Card */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>
                            {srv.name}
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: srv.highlight ? '#4ade80' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                            {srv.price}
                          </span>
                          {srv.highlight && (
                            <span style={{ background: '#fff', color: '#000', fontSize: '0.45rem', padding: '1px 5px', fontWeight: 700, letterSpacing: '0.1em', borderRadius: '1px' }}>
                              PHỔ BIẾN
                            </span>
                          )}
                        </div>
                        <ul style={{ paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {srv.items.map((item, idx) => (
                            <li key={idx} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', listStyleType: 'dash' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right-side action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '1rem' }}>
                        {/* Sort order actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <button
                            onClick={() => handleOrderChange(srv, 'up')}
                            disabled={index === 0}
                            style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => handleOrderChange(srv, 'down')}
                            disabled={index === services.length - 1}
                            style={{ background: 'none', border: 'none', color: index === services.length - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)', cursor: index === services.length - 1 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => startEdit(srv)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.45)',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Sửa gói giá"
                        >
                          <Pencil size={12} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setConfirmDelete({ id: srv._id, name: srv.name })}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            color: 'rgba(248,113,113,0.7)',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Xóa gói giá"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
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
                Xóa gói dịch vụ?
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 1.1rem' }}>
              Bạn chuẩn bị xóa gói dịch vụ <strong style={{ color: '#fff' }}>{confirmDelete.name}</strong> khỏi bảng giá. Hành động này không thể hoàn tác.
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
