'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from './ImageLightbox';

// ─── Dropdown Portal — renders directly into document.body to escape all stacking contexts
function DropdownPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  return ReactDOM.createPortal(children, document.body);
}

// ─── Modal Overlay ─────────────────────────────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '2px',
            width: '100%', maxWidth: 680,
            maxHeight: '88vh',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1.2rem', right: '1.2rem',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            aria-label="Đóng"
          >
            ✕
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Bảng Giá Modal ────────────────────────────────────────────────────────────
function BangGiaModal({ onClose }: { onClose: () => void }) {
  const packages = [
    {
      name: 'Makeup Cô Dâu',
      price: 'Từ 2.500.000đ',
      items: ['Tư vấn & thử makeup trước ngày cưới', 'Makeup cô dâu ngày cưới', 'Chăm sóc & fix makeup cả ngày', 'Bao gồm: làm tóc cô dâu cơ bản'],
      highlight: true,
    },
    {
      name: 'Makeup Tiệc / Sự Kiện',
      price: 'Từ 800.000đ',
      items: ['Makeup dự tiệc sang trọng', 'Phù hợp các buổi lễ, sự kiện', 'Tư vấn phong cách phù hợp'],
      highlight: false,
    },
    {
      name: 'Makeup Kỷ Yếu',
      price: 'Từ 650.000đ',
      items: ['Makeup trẻ trung, rạng rỡ', 'Phong cách tự nhiên hoặc glamour', 'Phù hợp chụp kỷ yếu ngoài trời & phòng'],
      highlight: false,
    },
    {
      name: 'Makeup Concept / Editorial',
      price: 'Từ 1.200.000đ',
      items: ['Makeup nghệ thuật theo concept', 'Phù hợp chụp ảnh nghệ thuật, TVC', 'Trao đổi chi tiết trước buổi chụp'],
      highlight: false,
    },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '2.5rem 2.5rem 2rem' }}>
        <p style={{ fontSize: '0.5rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
          EMISA MAKEUP STUDIO
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.3rem', color: '#fff' }}>
          Bảng Giá Dịch Vụ
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', letterSpacing: '0.04em' }}>
          Giá tham khảo — liên hệ để nhận báo giá chính xác theo yêu cầu cụ thể.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              style={{
                border: pkg.highlight ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '2px',
                padding: '1.4rem 1.5rem',
                background: pkg.highlight ? 'rgba(255,255,255,0.04)' : 'transparent',
                position: 'relative',
              }}
            >
              {pkg.highlight && (
                <span style={{
                  position: 'absolute', top: '-0.6rem', left: '1rem',
                  background: '#fff', color: '#000',
                  fontSize: '0.42rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                  padding: '2px 8px', fontWeight: 700,
                }}>
                  PHỔ BIẾN NHẤT
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                  {pkg.name}
                </h3>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: pkg.highlight ? '#fff' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {pkg.price}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {pkg.items.map((item) => (
                  <li key={item} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: '1px' }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.05em' }}>
          * Giá có thể thay đổi theo địa điểm, thời gian, yêu cầu đặc biệt.
        </p>
      </div>
    </ModalOverlay>
  );
}

// ─── Liên Hệ Modal ─────────────────────────────────────────────────────────────
function LienHeModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '2.5rem 2.5rem 2rem' }}>
        <p style={{ fontSize: '0.5rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
          EMISA MAKEUP STUDIO
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem', color: '#fff' }}>
          Thông Tin Liên Hệ
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {[
            { icon: '📱', label: 'Điện thoại / Zalo', value: '0909 xxx xxx', sub: 'Giờ làm việc: 8:00 – 20:00' },
            { icon: '📘', label: 'Facebook', value: 'Emisa Makeup Artist', sub: 'fb.com/emisamakeup' },
            { icon: '📸', label: 'Instagram', value: '@emisa.makeup', sub: 'Portfolio đầy đủ tại Instagram' },
            { icon: '📍', label: 'Studio', value: 'TP. Hồ Chí Minh', sub: 'Hỗ trợ makeup tại nhà & studio' },
            { icon: '✉️', label: 'Email', value: 'hello@emisamakeup.vn', sub: 'Phản hồi trong vòng 24h' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex', gap: '1.1rem', alignItems: 'flex-start',
              padding: '1rem 1.2rem',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '2px',
            }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.52rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 0.25rem' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 0.2rem' }}>
                  {item.value}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.8rem', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', margin: 0 }}>
            Vui lòng nhắn tin trước để đặt lịch & được tư vấn miễn phí 💛
          </p>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Xem Lịch Modal ────────────────────────────────────────────────────────────
function XemLichModal({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Demo: random booked days
  const bookedDays = new Set([3, 7, 8, 14, 15, 21, 22, 28]);
  const partialDays = new Set([5, 12, 19, 25]);

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ padding: '2.5rem 2.5rem 2rem' }}>
        <p style={{ fontSize: '0.5rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
          EMISA MAKEUP STUDIO
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.3rem', color: '#fff' }}>
          Lịch Còn Trống
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
          Chọn ngày phù hợp và liên hệ để đặt lịch nhanh.
        </p>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '0.3rem 0.8rem', cursor: 'pointer', borderRadius: '2px', fontSize: '0.75rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >‹</button>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', color: '#fff' }}>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '0.3rem 0.8rem', cursor: 'pointer', borderRadius: '2px', fontSize: '0.75rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.52rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', padding: '0.3rem 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isBooked = bookedDays.has(day);
            const isPartial = partialDays.has(day);
            const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            let bg = 'transparent';
            let border = '1px solid rgba(255,255,255,0.07)';
            let color = 'rgba(255,255,255,0.75)';
            let dotColor = '#4ade80';

            if (isPast) { color = 'rgba(255,255,255,0.18)'; dotColor = 'transparent'; }
            else if (isBooked) { bg = 'rgba(239,68,68,0.08)'; border = '1px solid rgba(239,68,68,0.2)'; color = 'rgba(255,255,255,0.3)'; dotColor = '#ef4444'; }
            else if (isPartial) { bg = 'rgba(251,191,36,0.06)'; border = '1px solid rgba(251,191,36,0.18)'; dotColor = '#fbbf24'; }
            else { dotColor = '#4ade80'; }

            if (isToday) { border = '1px solid rgba(255,255,255,0.6)'; }

            return (
              <div key={day} style={{
                padding: '0.55rem 0.3rem 0.4rem',
                background: bg, border, borderRadius: '2px',
                textAlign: 'center', position: 'relative',
                cursor: isBooked || isPast ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!isBooked && !isPast) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; }}
              >
                <span style={{ fontSize: '0.72rem', color, fontWeight: isToday ? 700 : 400 }}>{day}</span>
                {!isPast && <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor, margin: '3px auto 0', opacity: 0.8 }} />}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { dot: '#4ade80', label: 'Còn trống' },
            { dot: '#fbbf24', label: 'Còn 1 slot' },
            { dot: '#ef4444', label: 'Đã kín lịch' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.dot }} />
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Để đặt lịch, vui lòng nhắn tin Zalo / Facebook với ngày bạn chọn 📅
          </p>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LayoutItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  order?: number;
}

interface PhotoBlock {
  _id: string;
  photos: LayoutItem[];
  layoutType: '1col' | '2col' | '3col';
  order: number;
}


// ─── Config ───────────────────────────────────────────────────────────────────
const TITLE = 'EMISA MAKEUP';

// ─── Signature Easing ─────────────────────────────────────────────────────────
const EXPO_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ─── Title Animation Variants ─────────────────────────────────────────────────
const titleContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const titleCharVariants = {
  hidden: { y: '115%' },
  visible: {
    y: '0%',
    transition: {
      duration: 0.65,
      ease: EXPO_OUT,
    },
  },
};

// ─── Arrow Icon ───────────────────────────────────────────────────────────────
function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ display: 'block' }}
    >
      {direction === 'left' ? (
        <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// ─── Single Grid Card ─────────────────────────────────────────────────────────
function GridCard({
  item,
  index,
  displayMode,
  onImageClick,
}: {
  item: LayoutItem;
  index: number;
  displayMode: '3col' | '2col' | '1col';
  onImageClick: (item: LayoutItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Aspect ratio by display mode — keeps images proportional on all screen sizes
  // Mobile: use a taller portrait ratio; Desktop: classic portrait ratios
  const aspectRatio =
    displayMode === '1col' ? '3 / 2' :   // landscape for full-width
      displayMode === '2col' ? '3 / 4' :   // portrait 3:4 for 2 columns
        '2 / 3';                             // portrait 2:3 for 3 columns

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: EXPO_OUT, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onImageClick(item)}
      style={{
        aspectRatio,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#111',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.7, ease: EXPO_OUT }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes={displayMode === '1col' ? '100vw' : displayMode === '2col' ? '50vw' : '33vw'}
          className="object-cover"
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Caption */}
      <motion.div
        className="absolute z-10"
        style={{ bottom: 0, left: 0, padding: '1.1rem 1.2rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
        transition={{ duration: 0.35, ease: EXPO_OUT }}
      >
        <p
          style={{
            color: 'white',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: displayMode === '1col' ? '1.1rem' : displayMode === '2col' ? '0.95rem' : '0.78rem',
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.52rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginTop: '0.3rem',
          }}
        >
          {item.category}{item.order ? ` — #${String(item.order).padStart(2, '0')}` : ` — ${String(index + 1).padStart(2, '0')}`}
        </p>
      </motion.div>

      {/* Featured dot */}
      {item.featured && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
          }}
        />
      )}

      {/* Order badge — always visible, subtle */}
      {item.order && (
        <div style={{
          position: 'absolute',
          top: '0.65rem',
          left: '0.65rem',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '4px',
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.52rem',
          fontFamily: 'monospace',
          fontWeight: 600,
          padding: '1px 5px',
          letterSpacing: '0.05em',
        }}>
          {String(item.order).padStart(2, '0')}
        </div>
      )}
    </motion.div>
  );
}

// ─── Responsive Grid CSS ──────────────────────────────────────────────────────
// Columns stay intact on mobile — aspect-ratio handles proportional height automatically.
// On a 390px iPhone: 3-col → ~126px wide each → ~189px tall (2:3 ratio). Compact & correct.
const RESPONSIVE_GRID_CSS = `
  /* ── Sticky header on mobile only ── */
  .pg-sticky-header {
    background: #000;
  }
  @media (max-width: 768px) {
    .pg-sticky-header {
      position: sticky;
      top: 0;
      z-index: 200;
      background: #000;
    }
    .pg-title-size { font-size: 15vw !important; }
  }

  /* ── Grid layouts ── */
  .pg-block-row  { display: grid; gap: 6px; }
  .pg-block-row.cols-1 { grid-template-columns: 1fr; }
  .pg-block-row.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .pg-block-row.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .pg-legacy-grid { display: grid; gap: 6px; }
  .pg-legacy-grid.cols-1 { grid-template-columns: 1fr; }
  .pg-legacy-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .pg-legacy-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
`;

// ─── Block Row (for photo-block mode) ────────────────────────────────────────
function BlockRow({
  block,
  blockIndex,
  onImageClick,
}: {
  block: PhotoBlock;
  blockIndex: number;
  onImageClick: (item: LayoutItem) => void;
}) {
  const cols = block.layoutType === '3col' ? 3 : block.layoutType === '2col' ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EXPO_OUT, delay: blockIndex * 0.08 }}
      className={`pg-block-row cols-${cols}`}
    >
      {block.photos.map((item, i) => (
        <GridCard
          key={item._id}
          item={item}
          index={i}
          displayMode={block.layoutType}
          onImageClick={onImageClick}
        />
      ))}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PortfolioGrid() {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [blocks, setBlocks] = useState<PhotoBlock[]>([]);
  const [hasBlocks, setHasBlocks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<LayoutItem | null>(null);
  const [navItems, setNavItems] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<'3col' | '2col' | '1col'>('3col');

  // ── Modal & submenu state ─────────────────────────────────────────────────
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'banggia' | 'lienhe' | 'xemlich' | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const allBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // ── Intro sequence state ───────────────────────────────────────────────────
  const [titleReady, setTitleReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [gridReady, setGridReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setNavItems(json.data.map((c: { name: string }) => c.name));
        }
      } catch {
        // silent fallback — keep ['ALL']
      }
    }
    fetchCategories();
  }, []);

  // ── Fetch display mode from settings (for legacy fallback) ────────────────
  useEffect(() => {
    async function fetchDisplayMode() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data?.displayMode) {
          setDisplayMode(json.data.displayMode);
        }
      } catch {
        // silent fallback
      }
    }
    fetchDisplayMode();
  }, []);

  // ── Fetch photo blocks ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchBlocks() {
      try {
        const res = await fetch('/api/photo-blocks');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setBlocks(json.data);
          setHasBlocks(true);
        } else {
          setHasBlocks(false);
        }
      } catch {
        setHasBlocks(false);
      }
    }
    fetchBlocks();
  }, []);

  // ── Fetch layouts (for legacy fallback when no blocks exist) ──────────────
  useEffect(() => {
    async function fetchLayouts() {
      setIsLoading(true);
      try {
        const url =
          selectedCategory === 'ALL'
            ? '/api/layouts?sortBy=order&limit=200'
            : `/api/layouts?category=${encodeURIComponent(selectedCategory)}&sortBy=order&limit=200`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('unavailable');
        const json = await res.json();

        if (json.success && json.data?.length > 0) {
          setLayouts(json.data);
        } else {
          setLayouts([]);
        }
      } catch {
        setLayouts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLayouts();
  }, [selectedCategory]);

  // ── Intro sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onTitle = () => setTitleReady(true);
    const onContent = () => setContentReady(true);
    window.addEventListener('intro:title', onTitle);
    window.addEventListener('intro:content', onContent);
    return () => {
      window.removeEventListener('intro:title', onTitle);
      window.removeEventListener('intro:content', onContent);
    };
  }, []);

  // ── Grid appears after ribbon animation ───────────────────────────────────
  useEffect(() => {
    if (!contentReady) return;
    const t = setTimeout(() => setGridReady(true), 850);
    return () => clearTimeout(t);
  }, [contentReady]);

  // ── Scroll arrows ──────────────────────────────────────────────────────────
  const scrollMenu = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'right' ? 160 : -160,
      behavior: 'smooth',
    });
  }, []);

  // ── Filter blocks by selected category ────────────────────────────────────
  const filteredBlocks =
    selectedCategory === 'ALL'
      ? blocks
      : blocks.map((block) => ({
        ...block,
        photos: block.photos.filter((p) => p.category === selectedCategory),
      })).filter((block) => block.photos.length > 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-black min-h-screen text-white">

      {/* ══ STICKY HEADER (mobile only) ══════════════════════════════════════
          Wraps title + nav — sticky on mobile, static on desktop
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="pg-sticky-header">

        {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — EMISA MAKEUP giant title
         ═══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            paddingTop: '1.2rem',
            paddingLeft: '0.15rem',
            lineHeight: 0,
          }}
        >
          <motion.div
            variants={titleContainerVariants}
            initial="hidden"
            animate={titleReady ? 'visible' : 'hidden'}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              fontSize: '12vw',
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
            }}
          >
            {TITLE.split('').map((char, i) => (
              <span
                key={`${char}-${i}`}
                style={{
                  display: 'inline-flex',
                  overflow: 'hidden',
                  height: '0.9em',
                  alignItems: 'flex-end',
                  ...(char === ' '
                    ? { width: '0.3em', minWidth: '0.3em', flexShrink: 0 }
                    : {}),
                }}
              >
                <motion.span
                  variants={titleCharVariants}
                  style={{ display: 'block', lineHeight: 1 }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — Navigation bar: ALL (with submenu) + extra nav items
         ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: contentReady ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
          transition={{ duration: 0.85, ease: EXPO_OUT }}
          style={{
            marginTop: '0.6rem',
            borderTop: '1px solid rgba(255, 255, 255, 1)',
            borderBottom: '1px solid rgba(255, 255, 255, 1)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* ── ALL button with category dropdown ── */}
          <div ref={categoryMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              ref={allBtnRef}
              id="nav-all"
              onClick={() => {
                if (!categoryMenuOpen && allBtnRef.current) {
                  const rect = allBtnRef.current.getBoundingClientRect();
                  setDropdownPos({ top: rect.bottom + 1, left: rect.left });
                }
                setCategoryMenuOpen(o => !o);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.55rem 1rem',
                fontSize: '0.58rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 400,
                color: selectedCategory !== 'ALL' || categoryMenuOpen ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.85)',
                borderBottom: selectedCategory !== 'ALL'
                  ? '1px solid transparent'
                  : '1px solid rgba(255,255,255,0.6)',
                paddingBottom: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.2s',
              }}
            >
              ALL
              <svg
                width="8" height="8" viewBox="0 0 8 8" fill="none"
                style={{ transform: categoryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s', opacity: 0.6 }}
              >
                <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

          </div>

          {/* Category submenu dropdown — portal to document.body to escape all stacking contexts */}
          <DropdownPortal>
            <AnimatePresence>
              {categoryMenuOpen && (
                <>
                  {/* Invisible backdrop to close on outside click */}
                  <div
                    onClick={() => setCategoryMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 19998 }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.92 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.92 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'fixed',
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      minWidth: 220,
                      background: '#0d0d0d',
                      border: '1px solid rgba(255,255,255,0.15)',
                      zIndex: 19999,
                      transformOrigin: 'top left',
                    }}
                  >
                    {/* "Tất Cả" option inside dropdown */}
                    <button
                      onClick={() => { setSelectedCategory('ALL'); setCategoryMenuOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        background: selectedCategory === 'ALL' ? 'rgba(255,255,255,0.06)' : 'none',
                        border: 'none',
                        padding: '0.7rem 1.1rem',
                        fontSize: '0.58rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: selectedCategory === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = selectedCategory === 'ALL' ? 'rgba(255,255,255,0.06)' : 'none'; e.currentTarget.style.color = selectedCategory === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)'; }}
                    >
                      Tất Cả
                      {selectedCategory === 'ALL' && <span style={{ fontSize: '0.52rem', opacity: 0.6 }}>✓</span>}
                    </button>

                    {/* Divider */}
                    {navItems.length > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.8rem' }} />}

                    {/* Category items */}
                    {navItems.map((label) => (
                      <button
                        key={label}
                        onClick={() => { setSelectedCategory(label); setCategoryMenuOpen(false); }}
                        style={{
                          width: '100%', textAlign: 'left',
                          background: selectedCategory === label ? 'rgba(255,255,255,0.06)' : 'none',
                          border: 'none',
                          padding: '0.7rem 1.1rem',
                          fontSize: '0.58rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: selectedCategory === label ? '#fff' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = selectedCategory === label ? 'rgba(255,255,255,0.06)' : 'none'; e.currentTarget.style.color = selectedCategory === label ? '#fff' : 'rgba(255,255,255,0.5)'; }}
                      >
                        {label}
                        {selectedCategory === label && <span style={{ fontSize: '0.52rem', opacity: 0.6 }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </DropdownPortal>

          {/* ── Divider ── */}
          <div style={{ width: '1px', height: '1rem', background: 'rgba(255,255,255,0.15)', flexShrink: 0, margin: '0 0.1rem' }} />

          {/* ── Extra nav items ── */}
          {([
            { id: 'banggia', label: 'Bảng Giá' },
            { id: 'lienhe', label: 'Liên Hệ' },
            { id: 'xemlich', label: 'Xem Lịch' },
          ] as { id: 'banggia' | 'lienhe' | 'xemlich'; label: string }[]).map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveModal(item.id)}
              style={{
                flexShrink: 0,
                background: 'none',
                border: 'none',
                padding: '0.55rem 0.9rem',
                paddingBottom: '0.35rem',
                fontSize: '0.58rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.38)',
                borderBottom: '1px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.22s, border-color 0.22s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.borderBottomColor = 'transparent'; }}
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* ── close pg-sticky-header ── */}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — Grid (block-based or legacy)
         ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: gridReady ? 1 : 0, y: gridReady ? 0 : 20 }}
        transition={{ duration: 0.65, ease: EXPO_OUT }}
        style={{ padding: '1rem 36px 0' }}
      >
        {isLoading ? (
          // Loading skeleton
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  height: 280,
                  background: 'rgba(24,24,27,0.9)',
                }}
              />
            ))}
          </div>
        ) : hasBlocks && filteredBlocks.length > 0 ? (
          /* ── Block-based mode (admin configured) ── */
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {filteredBlocks.map((block, blockIndex) => (
                <BlockRow
                  key={block._id}
                  block={block}
                  blockIndex={blockIndex}
                  onImageClick={setLightboxItem}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : layouts.length === 0 ? (
          <div
            style={{
              padding: '5rem 0',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.18)',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            No works in this category yet
          </div>
        ) : (
          /* ── Legacy flat grid (fallback when no blocks configured) ── */
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${displayMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`pg-legacy-grid cols-${displayMode === '1col' ? 1 : displayMode === '2col' ? 2 : 3}`}
            >
              {layouts.map((item, i) => (
                <GridCard
                  key={item._id}
                  item={item}
                  index={i}
                  displayMode={displayMode}
                  onImageClick={setLightboxItem}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Image Lightbox Modal ── */}
      {lightboxItem && (
        <ImageLightbox
          src={lightboxItem.imageUrl}
          alt={lightboxItem.title}
          onClose={() => setLightboxItem(null)}
        />
      )}

      {/* ── Extra Nav Modals ── */}
      {activeModal === 'banggia' && <BangGiaModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'lienhe' && <LienHeModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'xemlich' && <XemLichModal onClose={() => setActiveModal(null)} />}

    </div>

  );
}
