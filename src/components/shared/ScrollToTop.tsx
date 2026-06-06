'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

        setVisible(scrollY > 300);
        setProgress(pct);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circle progress ring
  const SIZE = 44;
  const STROKE = 2;
  const RADIUS = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  return (
    <>
      <style>{`
        .stt-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 900;
          width: ${SIZE}px;
          height: ${SIZE}px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          /* Transition for show/hide */
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          pointer-events: none;
        }
        .stt-btn.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .stt-svg {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotate(-90deg);
        }
        .stt-track {
          stroke: rgba(255,255,255,0.08);
        }
        .stt-ring {
          stroke: rgba(201, 169, 110, 0.85);
          stroke-linecap: round;
          transition: stroke-dashoffset 0.2s linear;
        }
        .stt-inner {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s, border-color 0.25s;
        }
        .stt-btn:hover .stt-inner {
          background: rgba(30, 30, 30, 0.9);
          border-color: rgba(201, 169, 110, 0.5);
        }
        .stt-btn:hover .stt-ring {
          stroke: #c9a96e;
        }
        .stt-arrow {
          width: 12px;
          height: 12px;
          display: block;
          color: rgba(255,255,255,0.8);
          transition: transform 0.25s ease, color 0.25s;
        }
        .stt-btn:hover .stt-arrow {
          transform: translateY(-1px);
          color: #c9a96e;
        }
      `}</style>

      <button
        className={`stt-btn${visible ? ' visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Lên đầu trang"
      >
        {/* Progress ring */}
        <svg
          className="stt-svg"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
        >
          <circle
            className="stt-track"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className="stt-ring"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Inner circle with arrow */}
        <div className="stt-inner">
          <svg
            className="stt-arrow"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9.5V2.5M2.5 6l3.5-3.5L9.5 6" />
          </svg>
        </div>
      </button>
    </>
  );
}
