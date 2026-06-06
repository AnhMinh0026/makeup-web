'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Phone,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
} from 'lucide-react';

interface ContactInfo {
  _id: string;
  icon: string;
  label: string;
  value: string;
  sub?: string;
  link?: string;
  order: number;
  createdAt: string;
}

export default function AdminContactInfosPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [icon, setIcon] = useState('📱');
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [sub, setSub] = useState('');
  const [link, setLink] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editSub, setEditSub] = useState('');
  const [editLink, setEditLink] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await fetch('/api/contact-infos');
      const json = await res.json();
      if (json.success) {
        setContacts(json.data);
      }
    } catch {
      toast.error('Không thể tải danh sách thông tin liên hệ.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  async function handleAdd() {
    if (!label.trim()) {
      toast.error('Vui lòng nhập nhãn liên hệ (VD: Facebook).');
      return;
    }
    if (!value.trim()) {
      toast.error('Vui lòng nhập giá trị hiển thị.');
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/contact-infos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icon: icon.trim(),
          label: label.trim(),
          value: value.trim(),
          sub: sub.trim(),
          link: link.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi thêm thông tin liên hệ.');
      } else {
        toast.success(`Đã thêm liên hệ "${label.trim()}"`);
        setIcon('📱');
        setLabel('');
        setValue('');
        setSub('');
        setLink('');
        setShowAdd(false);
        fetchContacts();
      }
    } catch {
      toast.error('Không thể kết nối đến server.');
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: ContactInfo) {
    setEditingId(c._id);
    setEditIcon(c.icon);
    setEditLabel(c.label);
    setEditValue(c.value);
    setEditSub(c.sub || '');
    setEditLink(c.link || '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id: string) {
    if (!editLabel.trim()) {
      toast.error('Nhãn liên hệ không được trống.');
      return;
    }
    if (!editValue.trim()) {
      toast.error('Giá trị không được trống.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/contact-infos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icon: editIcon.trim(),
          label: editLabel.trim(),
          value: editValue.trim(),
          sub: editSub.trim(),
          link: editLink.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi cập nhật liên hệ.');
      } else {
        toast.success('Cập nhật thành công.');
        setEditingId(null);
        fetchContacts();
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleOrderChange(c: ContactInfo, direction: 'up' | 'down') {
    const currentIndex = contacts.findIndex((item) => item._id === c._id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === contacts.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetContact = contacts[targetIndex];

    try {
      const order1 = c.order;
      const order2 = targetContact.order;

      await Promise.all([
        fetch(`/api/contact-infos/${c._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: order2 }),
        }),
        fetch(`/api/contact-infos/${targetContact._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: order1 }),
        }),
      ]);

      fetchContacts();
    } catch {
      toast.error('Lỗi khi đổi thứ tự hiển thị.');
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contact-infos/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi xóa thông tin liên hệ.');
      } else {
        toast.success(`Đã xóa liên hệ "${confirmDelete.label}"`);
        fetchContacts();
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
  };

  return (
    <div style={{ padding: '2rem 2.25rem', fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .contact-input:focus { border-color: rgba(255,255,255,0.28) !important; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Phone size={14} color="rgba(255,255,255,0.3)" />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Quản lý
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Thông Tin Liên Hệ
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
            }}
          >
            <Plus size={13} />
            Thêm kênh liên hệ
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ ...cardStyle, padding: '1.4rem 1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(255,255,255,0.12)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
            Thêm kênh liên hệ mới
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Icon (Emoji)</label>
                <input
                  className="contact-input"
                  style={{ ...inputStyle, textAlign: 'center' }}
                  placeholder="VD: 📱"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Nhãn liên hệ</label>
                <input
                  className="contact-input"
                  style={inputStyle}
                  placeholder="VD: Zalo / Điện thoại"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Giá trị hiển thị</label>
                <input
                  className="contact-input"
                  style={inputStyle}
                  placeholder="VD: 0909 xxx xxx"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Dòng phụ (subtext)</label>
                <input
                  className="contact-input"
                  style={inputStyle}
                  placeholder="VD: Giờ làm việc: 8:00 – 20:00"
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>Đường dẫn (link liên kết - Tùy chọn)</label>
                <input
                  className="contact-input"
                  style={inputStyle}
                  placeholder="VD: https://zalo.me/0909xxxxxx"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => { setShowAdd(false); setIcon('📱'); setLabel(''); setValue(''); setSub(''); setLink(''); }}
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
                {adding ? 'Đang thêm...' : 'Lưu liên hệ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div style={cardStyle}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500 }}>
            Danh sách liên hệ ({contacts.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={18} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Phone size={24} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>
              Chưa có kênh liên hệ nào.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {contacts.map((c, index) => {
              const isEditing = editingId === c._id;
              return (
                <div
                  key={c._id}
                  className="row-hover"
                  style={{
                    padding: '1.1rem 1.5rem',
                    borderBottom: index === contacts.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Icon</label>
                          <input
                            className="contact-input"
                            style={{ ...inputStyle, textAlign: 'center' }}
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Nhãn</label>
                          <input
                            className="contact-input"
                            style={inputStyle}
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Giá trị</label>
                          <input
                            className="contact-input"
                            style={inputStyle}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Dòng phụ</label>
                          <input
                            className="contact-input"
                            style={inputStyle}
                            value={editSub}
                            onChange={(e) => setEditSub(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Đường dẫn</label>
                          <input
                            className="contact-input"
                            style={inputStyle}
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        <button
                          onClick={cancelEdit}
                          disabled={updating}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', padding: '0.35rem 0.75rem', fontSize: '0.72rem', cursor: 'pointer' }}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleUpdate(c._id)}
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
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                        <div>
                          <p style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.15rem' }}>
                            {c.label}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                              {c.value}
                            </p>
                            {c.link && (
                              <a
                                href={c.link}
                                target="_blank"
                                rel="noreferrer"
                                title={c.link}
                                style={{ display: 'inline-flex', color: 'rgba(255,255,255,0.25)', transition: 'color 0.15s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                              >
                                <LinkIcon size={11} />
                              </a>
                            )}
                          </div>
                          {c.sub && (
                            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', margin: '0.15rem 0 0' }}>
                              {c.sub}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <button
                            onClick={() => handleOrderChange(c, 'up')}
                            disabled={index === 0}
                            style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => handleOrderChange(c, 'down')}
                            disabled={index === contacts.length - 1}
                            style={{ background: 'none', border: 'none', color: index === contacts.length - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.3)', cursor: index === contacts.length - 1 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => startEdit(c)}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(255,255,255,0.45)', padding: '6px', cursor: 'pointer' }}
                          title="Sửa liên hệ"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() => setConfirmDelete({ id: c._id, label: c.label })}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'rgba(248,113,113,0.7)', padding: '6px', cursor: 'pointer' }}
                          title="Xóa liên hệ"
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

      {/* Delete confirm dialog */}
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
                Xóa liên hệ?
              </p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 1.1rem' }}>
              Bạn chuẩn bị xóa kênh liên hệ <strong style={{ color: '#fff' }}>{confirmDelete.label}</strong>. Thao tác này sẽ làm kênh này biến mất ngoài trang chủ.
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
