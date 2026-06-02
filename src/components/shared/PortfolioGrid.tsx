'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from './ImageLightbox';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LayoutItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  featured: boolean;
}

// ─── Mock fallback data ─────────────────────────────────────────────────────────
const MOCK_LAYOUTS: LayoutItem[] = [
  {
    _id: 'mk1',
    title: 'Ethereal Bridal Glow',
    description: 'Seamless, dewy, timeless.',
    category: 'MAKEUP CÔ DÂU',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13edd793be?auto=format&fit=crop&q=90&w=1200',
    featured: true,
  },
  {
    _id: 'mk2',
    title: 'Neon Editorial Vibe',
    description: 'Glass skin for the avant-garde.',
    category: 'MAKEUP CONCEPT',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=90&w=1200',
    featured: true,
  },
  {
    _id: 'mk3',
    title: 'Midnight Glam Party',
    description: 'Smoke & liquid gold.',
    category: 'MAKEUP TIỆC',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=90&w=1200',
    featured: true,
  },
  {
    _id: 'mk4',
    title: 'Sun-Kissed Daily Fresh',
    description: 'Minimal skin, maximum glow.',
    category: 'MAKEUP KỶ YẾU',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=90&w=1200',
    featured: false,
  },
  {
    _id: 'mk5',
    title: 'Vogue Runway Sculpt',
    description: 'Architecture for the face.',
    category: 'MAKEUP SỰ KIỆN',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=90&w=1200',
    featured: true,
  },
  {
    _id: 'mk6',
    title: 'Classic Rosé Bride',
    description: 'Romance for the modern bride.',
    category: 'MAKEUP CÔ DÂU',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=90&w=1200',
    featured: false,
  },
  {
    _id: 'mk7',
    title: 'Golden Hour Concept',
    description: 'Warm tones, artistic vision.',
    category: 'MAKEUP CONCEPT',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=90&w=1200',
    featured: true,
  },
  {
    _id: 'mk8',
    title: 'Cherry Blossom Event',
    description: 'Soft pinks for the season.',
    category: 'MAKEUP SỰ KIỆN',
    imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100d293?auto=format&fit=crop&q=90&w=1200',
    featured: false,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const TITLE = 'EMISA MAKEUP';

const NAV_ITEMS = [
  'ALL',
  'MAKEUP CÔ DÂU',
  'MAKEUP TIỆC',
  'MAKEUP KỶ YẾU',
  'MAKEUP SỰ KIỆN',
  'MAKEUP CONCEPT',
];

// ─── Asymmetric grid pattern (cycles every 6 items) ──────────────────────────
// Each entry: [colSpan, rowSpan] in a 3-column grid
const GRID_PATTERN: [number, number][] = [
  [2, 2], // tall wide  — dominant
  [1, 1], // small square
  [1, 1], // small square (stacks beside the tall)
  [1, 1], // small left
  [2, 1], // wide landscape
  [3, 1], // full-width banner
];

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
  colSpan,
  rowSpan,
  onImageClick,
}: {
  item: LayoutItem;
  index: number;
  colSpan: number;
  rowSpan: number;
  onImageClick: (item: LayoutItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Row height unit — each row = 220px
  const rowH = 220;

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
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        height: rowSpan * rowH + (rowSpan - 1) * 16, // account for gap-4
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
          sizes={colSpan === 3 ? '100vw' : colSpan === 2 ? '66vw' : '33vw'}
          className="object-cover"
        />
      </motion.div>

      {/* Dark overlay — always subtle, stronger on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Caption — slides up on hover */}
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
            fontSize: colSpan >= 2 ? '1rem' : '0.78rem',
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
          {item.category} &mdash; {String(index + 1).padStart(2, '0')}
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
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PortfolioGrid() {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<LayoutItem | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchLayouts() {
      setIsLoading(true);
      try {
        const url =
          selectedCategory === 'ALL'
            ? '/api/layouts'
            : `/api/layouts?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('unavailable');
        const json = await res.json();

        if (json.success && json.data?.length > 0) {
          setLayouts(json.data);
        } else {
          const filtered =
            selectedCategory === 'ALL'
              ? MOCK_LAYOUTS
              : MOCK_LAYOUTS.filter((item) => item.category === selectedCategory);
          setLayouts(filtered);
        }
      } catch {
        const filtered =
          selectedCategory === 'ALL'
            ? MOCK_LAYOUTS
            : MOCK_LAYOUTS.filter((item) => item.category === selectedCategory);
        setLayouts(filtered);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLayouts();
  }, [selectedCategory]);

  // ── Scroll arrows ──────────────────────────────────────────────────────────
  const scrollMenu = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'right' ? 160 : -160,
      behavior: 'smooth',
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-black min-h-screen text-white" style={{ overflow: 'hidden' }}>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — EMISA MAKEUP giant title (UNTOUCHED)
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
          animate="visible"
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
          SECTION 2 — Scrollable category menu with arrow buttons
         ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EXPO_OUT, delay: 1.0 }}
        style={{
          marginTop: '0.6rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => scrollMenu('left')}
          aria-label="Scroll left"
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.35)',
            padding: '0.55rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowIcon direction="left" />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            // Hide scrollbar cross-browser
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        // WebKit scrollbar hidden via inline style trick
        >
          <style>{`.menu-track::-webkit-scrollbar { display: none; }`}</style>
          <div
            className="menu-track"
            style={{
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
            }}
          >
            {NAV_ITEMS.map((label) => {
              const isActive = selectedCategory === label;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedCategory(label)}
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.58rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.28)',
                    borderBottom: isActive
                      ? '1px solid rgba(255,255,255,0.6)'
                      : '1px solid transparent',
                    paddingBottom: '0.35rem',
                    transition: 'color 0.25s, border-color 0.25s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.28)';
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollMenu('right')}
          aria-label="Scroll right"
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.35)',
            padding: '0.55rem 0.65rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <ArrowIcon direction="right" />
        </button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — Asymmetric editorial grid
         ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EXPO_OUT, delay: 1.15 }}
        style={{ padding: '1rem 36px 0' }}
      >
        {isLoading ? (
          // Loading skeleton — mimics the asymmetric grid
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {GRID_PATTERN.map(([cs, rs], i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  gridColumn: `span ${cs}`,
                  gridRow: `span ${rs}`,
                  height: rs * 220 + (rs - 1) * 16,
                  background: 'rgba(24,24,27,0.9)',
                }}
              />
            ))}
          </div>
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
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {layouts.map((item, i) => {
                const [cs, rs] = GRID_PATTERN[i % GRID_PATTERN.length];
                return (
                  <GridCard
                    key={item._id}
                    item={item}
                    index={i}
                    colSpan={cs}
                    rowSpan={rs}
                    onImageClick={setLightboxItem}
                  />
                );
              })}
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

    </div>
  );
}
