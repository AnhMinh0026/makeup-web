'use client';

import { useEffect, useState } from 'react';

// ── Timing (ms) ───────────────────────────────────────────────────────────────
// LOGO_HOLD  : time the logo is shown before curtains begin opening
// CURTAIN_MS : CSS transition duration for the two panels
// TITLE_MS   : duration until all "EMISA MAKEUP" chars finish animating
//              12 chars × 80ms stagger + 650ms last-char duration ≈ 1530ms
const LOGO_HOLD = 400;
const CURTAIN_MS = 1050;
const TITLE_MS = 1600;

// Events dispatched on window so PortfolioGrid can sync without prop-drilling
// 'intro:title'   → curtains fully open, start title stagger
// 'intro:content' → title done, fade in nav + grid
const EV_TITLE = 'intro:title';
const EV_CONTENT = 'intro:content';

export default function CinematicIntro() {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');

  useEffect(() => {
    // ── Lock scroll while curtains are visible ──────────────────────────────
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0px';

    // Step 1 — start opening curtains after LOGO_HOLD
    const t1 = setTimeout(() => setPhase('opening'), LOGO_HOLD);

    // Step 2 — curtains fully open → unlock scroll + signal title animation
    const t2 = setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
      window.dispatchEvent(new CustomEvent(EV_TITLE));
    }, LOGO_HOLD + CURTAIN_MS);

    // Step 3 — title animation done → signal content (nav + grid) to appear
    const t3 = setTimeout(() => {
      window.dispatchEvent(new CustomEvent(EV_CONTENT));
    }, LOGO_HOLD + CURTAIN_MS + TITLE_MS);

    // Step 4 — remove curtain DOM once panels are off-screen
    const t4 = setTimeout(() => setPhase('done'), LOGO_HOLD + CURTAIN_MS + 300);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, []);

  if (phase === 'done') return null;

  const isOpen = phase === 'opening';

  return (
    <>
      <style>{`
        .cc-panel {
          position: fixed;
          left: 0;
          width: 100%;
          height: 50%;
          z-index: 9999;
          will-change: transform;
          transition: transform ${CURTAIN_MS}ms cubic-bezier(0.76, 0, 0.24, 1);
        }
        /* Subtle gradient so panels aren't pure flat black */
        .cc-panel-top {
          top: 0;
          transform: translateY(0);
          background: linear-gradient(to bottom, #111 0%, #0a0a0a 100%);
          /* Gold glow line at the bottom edge */
          box-shadow:
            0 2px 0 0 #c9a96e,
            0 4px 18px 0 rgba(201, 169, 110, 0.45),
            0 1px 0 0 rgba(201, 169, 110, 0.15);
        }
        .cc-panel-bot {
          bottom: 0;
          transform: translateY(0);
          background: linear-gradient(to top, #111 0%, #0a0a0a 100%);
          /* Gold glow line at the top edge */
          box-shadow:
            0 -2px 0 0 #c9a96e,
            0 -4px 18px 0 rgba(201, 169, 110, 0.45),
            0 -1px 0 0 rgba(201, 169, 110, 0.15);
        }
        .cc-panel-top.cc-open  { transform: translateY(-100%); }
        .cc-panel-bot.cc-open  { transform: translateY(100%); }

        .cc-logo {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          text-align: center;
          pointer-events: none;
          transition: opacity 0.45s ease;
          opacity: 1;
        }
        .cc-logo.cc-fade { opacity: 0; }

        .cc-logo-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.6rem, 5vw, 3.2rem);
          font-weight: 400;
          letter-spacing: 0.36em;
          color: #fff;
          text-transform: uppercase;
          margin: 0;
          line-height: 1;
        }
        .cc-logo-rule {
          width: 72px; height: 1px;
          
          margin: 18px auto 14px;
        }
        .cc-logo-sub {
          font-family: 'Inter', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.44em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }
      `}</style>

      {/* Two curtain panels */}
      <div className={`cc-panel cc-panel-top${isOpen ? ' cc-open' : ''}`} />
      <div className={`cc-panel cc-panel-bot${isOpen ? ' cc-open' : ''}`} />

      {/* Centre logo — fades as curtains open */}
      <div className={`cc-logo${isOpen ? ' cc-fade' : ''}`}>
        <p className="cc-logo-name">Emisa</p>
        <div className="cc-logo-rule" />
        <p className="cc-logo-sub">Makeup Artist</p>
      </div>
    </>
  );
}
