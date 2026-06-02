'use client';

import { useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  // Spring physics for the trailing gold ring
  const springConfig = { damping: 28, stiffness: 180, mass: 0.5 };
  const x = useSpring(-100, springConfig);
  const y = useSpring(-100, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      {/* Outer ring - gold, mix-blend-mode difference */}
      <div
        style={{ mixBlendMode: 'difference' }}
        className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center"
      >
        {/* Inner dot */}
        <div className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-70" />
      </div>
    </motion.div>
  );
}
