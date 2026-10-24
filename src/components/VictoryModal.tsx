import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, Home, Coins, Gem } from 'lucide-react';

interface VictoryModalProps {
  levelNumber: number;
  score: number;
  coinsEarned: number;
  gemsEarned: number;
  accuracy: number;
  stars: number; // 1, 2, or 3
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  score,
  coinsEarned,
  gemsEarned,
  accuracy,
  stars,
  onNextLevel,
  onReplay,
  onHome
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-2">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">
          اكتملت المرحلة بنجاح!
        </h2>
        <p className="text-xs text-slate-400 mb-4">المرحلة {levelNumber} — إنجاز رائع!</p>

        {/* Stars */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`p-2.5 rounded-2xl border transition-all ${
                s <= stars
                  ? 'bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-600'
              }`}
            >
              <Star className={`w-8 h-8 ${s <= stars ? 'fill-amber-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold">النقاط</span>
            <span className="text-lg font-black text-amber-400">{score.toLocaleString()}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold">دقة الحساب</span>
            <span className="text-lg font-black text-emerald-400">{Math.round(accuracy)}%</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-base font-black text-yellow-300">+{coinsEarned}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
            <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-base font-black text-cyan-300">+{gemsEarned}</span>
          </div>
        </div>

        {/* Action Buttons with clear spacing and zero overlap */}
        <div className="w-full shrink-0 flex flex-col gap-3 pt-3 border-t border-slate-800/80 mt-2">
          {/* Next Stage Button */}
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition shrink-0"
          >
            <span>المرحلة التالية</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>

          {/* Secondary Buttons Row: Replay & Home */}
          <div className="grid grid-cols-2 gap-3 w-full shrink-0">
            <button
              onClick={onReplay}
              className="py-3 px-3 rounded-2xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5 border border-slate-700 text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>إعادة المحاولة</span>
            </button>

            <button
              onClick={onHome}
              className="py-3 px-3 rounded-2xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5 border border-slate-700 text-xs sm:text-sm"
            >
              <Home className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>القائمة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
