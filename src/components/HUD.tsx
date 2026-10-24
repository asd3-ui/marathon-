import React from 'react';
import { Heart, Coins, Gem, Pause, Volume2, VolumeX, Shield, Magnet, Zap, Clock, Rocket } from 'lucide-react';
import { PowerUpItem } from '../types/game';

interface HUDProps {
  score: number;
  distance: number;
  coins: number;
  gems: number;
  lives: number;
  maxLives: number;
  currentLevelNumber?: number;
  questionsAnswered: number;
  targetQuestions: number;
  isEndless: boolean;
  activePowerups: { [key: string]: number };
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  distance,
  coins,
  gems,
  lives,
  maxLives,
  currentLevelNumber,
  questionsAnswered,
  targetQuestions,
  isEndless,
  activePowerups,
  isMuted,
  onToggleMute,
  onPause
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left Stats: Lives & Score */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
            {Array.from({ length: maxLives }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-5 h-5 transition-transform duration-300 ${
                  idx < lives
                    ? 'text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                    : 'text-slate-600 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Score Counter */}
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-slate-700/60 shadow-lg">
            <span className="text-[11px] text-slate-400 block font-semibold">النقاط / SCORE</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Distance */}
          <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1 rounded-xl border border-slate-700/60 text-xs font-bold text-sky-400 flex items-center gap-1.5">
            <span>{distance} م</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">المسافة</span>
          </div>
        </div>

        {/* Center: Compact Stage Progress Badge */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-cyan-500/40 shadow-md flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-cyan-300">
              {isEndless ? 'السباق اللانهائي • ENDLESS' : `المرحلة ${currentLevelNumber}`}
            </span>

            {!isEndless && (
              <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold border-r border-slate-700 pr-2 mr-1">
                <span>البوابات:</span>
                <span className="text-amber-400 font-black">{questionsAnswered} / {targetQuestions}</span>
              </div>
            )}
          </div>

          {/* Active Powerups Row */}
          <div className="flex items-center gap-2 mt-2">
            {activePowerups.shield > 0 && (
              <div className="bg-sky-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                <Shield className="w-3.5 h-3.5" />
                <span>{Math.ceil(activePowerups.shield)}s</span>
              </div>
            )}
            {activePowerups.magnet > 0 && (
              <div className="bg-rose-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                <Magnet className="w-3.5 h-3.5" />
                <span>{Math.ceil(activePowerups.magnet)}s</span>
              </div>
            )}
            {activePowerups.multiplier > 0 && (
              <div className="bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>2X {Math.ceil(activePowerups.multiplier)}s</span>
              </div>
            )}
            {activePowerups.slowmo > 0 && (
              <div className="bg-purple-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.ceil(activePowerups.slowmo)}s</span>
              </div>
            )}
            {activePowerups.turbo > 0 && (
              <div className="bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                <Rocket className="w-3.5 h-3.5" />
                <span>{Math.ceil(activePowerups.turbo)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Stats: Coins, Gems, Pause & Audio buttons */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Controls: Audio & Pause */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-2.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-md"
              aria-label="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={onPause}
              className="p-2.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-md"
              aria-label="Pause Game"
            >
              <Pause className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Coins Collected */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-lg">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <span className="text-base sm:text-lg font-black text-amber-300">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 text-xs font-black text-cyan-300">
            <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>{gems}</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for touch / lanes */}
      <div className="w-full flex justify-center pb-2">
        <div className="bg-slate-950/70 backdrop-blur-sm px-4 py-1 rounded-full border border-slate-800 text-[11px] text-slate-400 text-center">
          اسحب يميناً ويساراً لتغيير المسار • لأعلى للقفز • لأسفل للانزلاق
        </div>
      </div>
    </div>
  );
};
