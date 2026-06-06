'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.6;

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reset pan when scale returns to 1
  const resetPosition = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    lastOffset.current = { x: 0, y: 0 };
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(parseFloat((s + ZOOM_STEP).toFixed(2)), MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(parseFloat((s - ZOOM_STEP).toFixed(2)), MIN_SCALE);
      if (next <= MIN_SCALE) resetPosition();
      return next;
    });
  }, [resetPosition]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomIn, zoomOut]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - lastOffset.current.x, y: e.clientY - lastOffset.current.y };
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setOffset({ x: newX, y: newY });
  };

  const stopDrag = () => {
    if (isDragging.current) {
      lastOffset.current = offset;
    }
    isDragging.current = false;
  };

  const cursor = scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default';

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ── Control bar top-right ── */}
        <div
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 10,
          }}
        >
          {/* Scale indicator */}
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              minWidth: '3rem',
              textAlign: 'center',
            }}
          >
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom out */}
          <ControlBtn
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            title="Thu nhỏ"
            aria-label="Zoom out"
          >
            <ZoomOutIcon />
          </ControlBtn>

          {/* Zoom in */}
          <ControlBtn
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            title="Phóng to"
            aria-label="Zoom in"
          >
            <ZoomInIcon />
          </ControlBtn>

          {/* Reset */}
          {scale !== 1 && (
            <ControlBtn
              onClick={() => { setScale(1); resetPosition(); }}
              title="Reset"
              aria-label="Reset zoom"
            >
              <ResetIcon />
            </ControlBtn>
          )}

          {/* Close */}
          <ControlBtn
            onClick={onClose}
            title="Đóng (Esc)"
            aria-label="Close lightbox"
            danger
          >
            <CloseIcon />
          </ControlBtn>
        </div>

        {/* ── Image container ── */}
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor,
            userSelect: 'none',
          }}
        >
          <motion.img
            src={src}
            alt={alt}
            draggable={false}
            animate={{ scale, x: offset.x, y: offset.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              maxWidth: '92vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Hint ── */}
        {scale === 1 && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              position: 'absolute',
              bottom: '1.4rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 1)',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            Scroll hoặc nhấn + / − để zoom
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Control Button ────────────────────────────────────────────────────────────
function ControlBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
  [key: string]: unknown;
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
        width: '36px',
        height: '36px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '8px',
        background: hovered
          ? danger
            ? 'rgba(220,38,38,0.85)'
            : 'rgba(255,255,255,0.15)'
          : 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        borderColor: hovered && danger ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.15)',
      }}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 4.5V9.5M4.5 7H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 7H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8A4.5 4.5 0 0 1 8 3.5a4.5 4.5 0 0 1 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M12.5 4.5V8H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
