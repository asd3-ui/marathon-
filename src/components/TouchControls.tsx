import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  showButtons: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
  showButtons
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Swipe Gesture Listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const minSwipeDistance = 28;

      if (Math.max(absX, absY) > minSwipeDistance) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onRight();
          } else {
            onLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            onJump();
          } else {
            onSlide();
          }
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onLeft, onRight, onJump, onSlide]);

  if (!showButtons) return null;

  return (
    <div className="absolute inset-x-0 bottom-6 px-6 pointer-events-none z-30 flex items-center justify-between">
      {/* Left/Right Directional Pad */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onLeft}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/50 flex items-center justify-center text-cyan-400 active:scale-90 active:bg-cyan-500 active:text-slate-950 transition shadow-lg shadow-cyan-950/50"
          aria-label="Move Left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={onRight}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/50 flex items-center justify-center text-cyan-400 active:scale-90 active:bg-cyan-500 active:text-slate-950 transition shadow-lg shadow-cyan-950/50"
          aria-label="Move Right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Jump & Slide Action Pad */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onSlide}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-amber-500/50 flex items-center justify-center text-amber-400 active:scale-90 active:bg-amber-500 active:text-slate-950 transition shadow-lg shadow-amber-950/50"
          aria-label="Slide"
        >
          <ArrowDown className="w-7 h-7" />
        </button>

        <button
          onClick={onJump}
          className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-sky-400 border border-white/40 flex items-center justify-center text-slate-950 font-black active:scale-90 transition shadow-xl shadow-cyan-500/40"
          aria-label="Jump"
        >
          <ArrowUp className="w-8 h-8 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
