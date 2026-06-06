'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Clock,
} from 'lucide-react';

interface BlockedSlot {
  _id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isFullDay: boolean;
  note?: string;
}

export default function AdminSchedulesPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date details
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Add new slot form state
  const [isFullDay, setIsFullDay] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get current date in Vietnam time format YYYY-MM-DD
  const todayVNStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  async function fetchSlots() {
    setLoading(true);
    try {
      const res = await fetch('/api/schedules');
      const json = await res.json();
      if (json.success) {
        setSlots(json.data);
      }
    } catch {
      toast.error('Không thể tải lịch bận.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSlots();
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const cells: (number | null)[] = [];
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  // Filter slots for currently selected date
  const selectedDateSlots = slots.filter((s) => s.date === selectedDateStr);

  function handleDateClick(day: number) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    // Validate past date clicking
    if (dateStr < todayVNStr) {
      toast.error('Không thể điều chỉnh hoặc chọn các ngày trong quá khứ.');
      return;
    }

    setSelectedDateStr(dateStr);
    setIsFullDay(false);
    setStartTime('08:00');
    setEndTime('12:00');
    setNote('');
  }

  async function handleAddSlot() {
    if (!selectedDateStr) return;
    setSaving(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDateStr,
          isFullDay,
          startTime: isFullDay ? '00:00' : startTime,
          endTime: isFullDay ? '23:59' : endTime,
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi lưu lịch bận.');
      } else {
        toast.success('Đã lưu lịch bận thành công.');
        setNote('');
        fetchSlots();
      }
    } catch {
      toast.error('Không thể kết nối đến server.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Lỗi khi xóa lịch bận.');
      } else {
        toast.success('Đã giải phóng khung giờ bận.');
        fetchSlots();
      }
    } catch {
      toast.error('Lỗi kết nối server.');
    } finally {
      setDeletingId(null);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: '#0d0d0d',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '1.5rem',
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
        .schedule-btn:hover { border-color: rgba(255,255,255,0.28) !important; }
        .cell-hover:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <CalendarIcon size={14} color="rgba(255,255,255,0.3)" />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Quản lý
          </span>
        </div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Lịch Bận Studio (Theo giờ & Cả ngày)
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Side: Calendar Board */}
        <div style={cardStyle}>
          
          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button
              onClick={prevMonth}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: '4px',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', color: '#fff' }}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: '4px',
                padding: '0.35rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: '0.55rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.25)',
                  padding: '0.4rem 0',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          {loading ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={18} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />;

                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const formattedDay = String(day).padStart(2, '0');
                const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();

                const isPast = dateStr < todayVNStr;

                // Day's slots
                const daySlots = slots.filter((s) => s.date === dateStr);
                const hasFullDay = daySlots.some((s) => s.isFullDay);
                const hasPartial = daySlots.length > 0 && !hasFullDay;

                let bg = 'rgba(255,255,255,0.01)';
                let border = '1px solid rgba(255,255,255,0.05)';
                let color = 'rgba(255,255,255,0.85)';
                let dotColor = '#4ade80'; // Free (green)

                if (isPast) {
                  color = 'rgba(255,255,255,0.15)';
                  dotColor = 'transparent';
                  border = '1px solid rgba(255,255,255,0.02)';
                } else if (hasFullDay) {
                  bg = 'rgba(239,68,68,0.08)';
                  border = '1px solid rgba(239,68,68,0.22)';
                  color = 'rgba(255,255,255,0.4)';
                  dotColor = '#ef4444'; // Red
                } else if (hasPartial) {
                  bg = 'rgba(251,191,36,0.06)';
                  border = '1px solid rgba(251,191,36,0.18)';
                  dotColor = '#fbbf24'; // Yellow
                }

                if (isToday) {
                  border = '1px solid rgba(255,255,255,0.6)';
                }

                if (selectedDateStr === dateStr) {
                  border = '1px solid #fff';
                  bg = 'rgba(255,255,255,0.1)';
                }

                return (
                  <div
                    key={day}
                    onClick={() => !isPast && handleDateClick(day)}
                    className={isPast ? '' : 'cell-hover'}
                    style={{
                      aspectRatio: '1',
                      padding: '0.45rem 0.25rem',
                      background: bg,
                      border,
                      borderRadius: '6px',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      transition: 'all 0.12s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color, fontWeight: isToday ? 700 : 400 }}>
                      {day}
                    </span>
                    {!isPast && (
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: dotColor,
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Color Legend */}
          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            {[
              { dot: '#4ade80', label: 'Còn trống (Available)' },
              { dot: '#fbbf24', label: 'Bận một số giờ (Partial Booked)' },
              { dot: '#ef4444', label: 'Đã kín lịch cả ngày (Fully Booked)' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.dot }} />
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Setup form for selected date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {selectedDateStr ? (
            <div style={cardStyle}>
              {/* Date Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Ngày chọn: {selectedDateStr}
                </span>
                <button
                  onClick={() => setSelectedDateStr(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Existing booked slots of the day */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Khung giờ bận trong ngày
                </p>
                {selectedDateSlots.length === 0 ? (
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>
                    Chưa có lịch bận. Ngày này đang còn trống.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedDateSlots.map((s) => (
                      <div
                        key={s._id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                            {s.isFullDay ? 'Khóa Cả Ngày' : `${s.startTime || '00:00'} - ${s.endTime || '23:59'}`}
                          </span>
                          {s.note && (
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                              {s.note}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(s._id)}
                          disabled={deletingId === s._id}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(248,113,113,0.7)',
                            cursor: deletingId === s._id ? 'not-allowed' : 'pointer',
                          }}
                          title="Giải phóng khung giờ này"
                        >
                          {deletingId === s._id ? (
                            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add slot form */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.2rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Thêm khung giờ bận mới
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Full day checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="isFullDayCheckbox"
                      checked={isFullDay}
                      onChange={(e) => setIsFullDay(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isFullDayCheckbox" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
                      Bận cả ngày (Khóa toàn bộ thời gian)
                    </label>
                  </div>

                  {/* Hour pickers (if not full day) */}
                  {!isFullDay && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Giờ bắt đầu</label>
                        <input
                          type="time"
                          style={inputStyle}
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Giờ kết thúc</label>
                        <input
                          type="time"
                          style={inputStyle}
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Note input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Ghi chú bận (Khách hàng / Ghi chú)</label>
                    <input
                      style={inputStyle}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={isFullDay ? "VD: Bận cưới cả ngày" : "VD: Makeup Tiệc cưới cô dâu"}
                    />
                  </div>

                  {/* Save button */}
                  <button
                    onClick={handleAddSlot}
                    disabled={saving}
                    style={{
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
                    Thêm lịch bận
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ ...cardStyle, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
              <CalendarIcon size={24} color="rgba(255,255,255,0.15)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
                Chọn một ngày trên lịch (không bôi mờ) để quản lý hoặc thêm lịch bận/khung giờ.
              </p>
            </div>
          )}

          {/* List of upcoming busy days */}
          <div style={cardStyle}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
              Danh sách lịch bận sắp tới
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {slots.filter(s => s.date >= todayVNStr).length === 0 ? (
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                  Không có lịch bận sắp tới.
                </p>
              ) : (
                slots.filter(s => s.date >= todayVNStr).map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      const parts = s.date.split('-');
                      setCurrentMonth(parseInt(parts[1], 10) - 1);
                      setCurrentYear(parseInt(parts[0], 10));
                      setSelectedDateStr(s.date);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '0.45rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    className="row-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.isFullDay ? '#ef4444' : '#fbbf24' }} />
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 500 }}>{s.date}</span>
                        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.4rem' }}>
                          {s.isFullDay ? '(Cả ngày)' : `(${s.startTime || '00:00'} - ${s.endTime || '23:59'})`}
                        </span>
                      </div>
                    </div>
                    {s.note && (
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.note}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
