import React from 'react';
import { MathQuestion } from '../types/game';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface MathGateBannerProps {
  question: MathQuestion | null;
  currentLane: number; // -1: Left, 0: Center, 1: Right
}

export const MathGateBanner: React.FC<MathGateBannerProps> = ({ question, currentLane }) => {
  if (!question) return null;

  // Individual lane configurations mapped to screen positions
  // Left: 3D lane -2.2 -> Screen Left (~22%)
  // Center: 3D lane 0 -> Screen Center (50%)
  // Right: 3D lane 2.2 -> Screen Right (~78%)
  const lanes = [
    {
      laneId: -1,
      option: question.options[0],
      label: 'يسار',
      screenPosClass: 'left-[16%] sm:left-[22%] -translate-x-1/2',
      color: 'text-pink-400',
      border: 'border-pink-500/60',
      activeBorder: 'border-pink-400 ring-2 ring-pink-400/60 shadow-[0_0_15px_rgba(236,72,153,0.7)]',
      bg: 'bg-slate-950/85',
      activeBg: 'bg-pink-950/90'
    },
    {
      laneId: 0,
      option: question.options[1],
      label: 'وسط',
      screenPosClass: 'left-1/2 -translate-x-1/2',
      color: 'text-cyan-300',
      border: 'border-cyan-400/60',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.7)]',
      bg: 'bg-slate-950/85',
      activeBg: 'bg-cyan-950/90'
    },
    {
      laneId: 1,
      option: question.options[2],
      label: 'يمين',
      screenPosClass: 'left-[84%] sm:left-[78%] -translate-x-1/2',
      color: 'text-emerald-400',
      border: 'border-emerald-400/60',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_15px_rgba(34,197,94,0.7)]',
      bg: 'bg-slate-950/85',
      activeBg: 'bg-emerald-950/90'
    }
  ];

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-30 select-none animate-in fade-in duration-200">
      {/* 1. Slim, slightly enlarged Question Equation pinned cleanly at top center */}
      <div className="absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-300 hidden sm:inline">
            {question.questionArabic}
          </span>
          <span className="text-lg sm:text-2xl font-black text-amber-300 tracking-wider drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
            {question.equation} = ؟
          </span>
        </div>
      </div>

      {/* 2. Smaller Absolute-Positioned Labels aligned directly above each lane's specific gate */}
      <div className="absolute top-22 sm:top-24 inset-x-0 w-full max-w-4xl mx-auto h-12">
        {lanes.map((lane) => {
          const isPlayerInThisLane = currentLane === lane.laneId;

          return (
            <div
              key={lane.laneId}
              className={`absolute top-0 ${lane.screenPosClass} flex flex-col items-center transition-all duration-200`}
            >
              {/* Compact Floating Answer Chip */}
              <div
                className={`px-3 py-1 rounded-xl border backdrop-blur-md flex items-center gap-1.5 transition-all ${
                  isPlayerInThisLane
                    ? `${lane.activeBg} ${lane.activeBorder} scale-110 shadow-lg`
                    : `${lane.bg} ${lane.border} opacity-85 scale-95`
                }`}
              >
                <span className={`text-[10px] font-bold ${lane.color}`}>
                  {lane.label}:
                </span>
                <span className={`text-sm sm:text-base font-black ${isPlayerInThisLane ? 'text-white' : lane.color}`}>
                  {lane.option}
                </span>

                {isPlayerInThisLane && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
                )}
              </div>

              {/* Minimalist guide arrow pointing toward lane */}
              {isPlayerInThisLane && (
                <ChevronDown className="w-4 h-4 text-white -mt-0.5 animate-bounce" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
