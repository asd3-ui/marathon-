import React from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Gift, Check, Coins, Gem, Sparkles, X } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface DailyRewardModalProps {
  consecutiveDays: number;
  hasClaimedToday: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export const DAILY_REWARDS = [
  { day: 1, coins: 100, gems: 0, titleAr: 'اليوم الأول' },
  { day: 2, coins: 200, gems: 0, titleAr: 'اليوم الثاني' },
  { day: 3, coins: 300, gems: 3, titleAr: 'اليوم الثالث' },
  { day: 4, coins: 450, gems: 0, titleAr: 'اليوم الرابع' },
  { day: 5, coins: 600, gems: 5, titleAr: 'اليوم الخامس' },
  { day: 6, coins: 800, gems: 8, titleAr: 'اليوم السادس' },
  { day: 7, coins: 1500, gems: 15, titleAr: 'اليوم الأسطوري' }
];

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  consecutiveDays,
  hasClaimedToday,
  onClaim,
  onClose
}) => {
  // Current active day (1 to 7)
  const currentStreakDay = Math.max(1, Math.min(7, consecutiveDays || 1));
  const activeReward = DAILY_REWARDS[currentStreakDay - 1];

  const handleClaim = () => {
    if (hasClaimedToday) return;

    // Trigger celebration effects
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    sound.playPowerup();
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
              <Gift className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>مكافأة الدخول اليومي</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                سجّل الدخول يومياً لجمع عملات وجواهر مجانية ومضاعفة تقدمك!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Days Reward Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-5">
          {DAILY_REWARDS.map((rew) => {
            const isPast = rew.day < currentStreakDay || (rew.day === currentStreakDay && hasClaimedToday);
            const isToday = rew.day === currentStreakDay && !hasClaimedToday;
            const isFuture = rew.day > currentStreakDay;
            const isGrand = rew.day === 7;

            return (
              <div
                key={rew.day}
                className={`relative rounded-2xl p-3 sm:p-3.5 border flex flex-col items-center justify-between text-center transition-all ${
                  isGrand ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isToday
                    ? 'bg-gradient-to-b from-amber-500/25 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105'
                    : isPast
                    ? 'bg-slate-950/60 border-slate-800 opacity-70'
                    : 'bg-slate-950/40 border-slate-800/60'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-black text-slate-400">
                    {rew.titleAr}
                  </span>
                  {isPast ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : isToday ? (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      اليوم
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-bold">قريباً</span>
                  )}
                </div>

                {/* Reward Icons */}
                <div className="my-2 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-black text-sm text-white">+{rew.coins}</span>
                  </div>
                  {rew.gems > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                      <span className="font-black text-xs text-cyan-300">+{rew.gems}</span>
                    </div>
                  )}
                </div>

                {/* Status Footer */}
                <div className="text-[10px] font-bold text-slate-400 w-full pt-1 border-t border-slate-800/60">
                  {isPast ? 'مستلمة' : isToday ? 'جاهزة للاستلام!' : `يوم ${rew.day}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <div className="pt-2 flex flex-col gap-2">
          {hasClaimedToday ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center gap-1">
              <span className="text-emerald-400 font-black text-sm flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                تم استلام مكافأة اليوم بنجاح!
              </span>
              <p className="text-xs text-slate-400">
                عُد غداً لاستلام مكافأة اليوم التالي ومضاعفة تقدمك.
              </p>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition"
            >
              <Gift className="w-5 h-5" />
              <span>استلام مكافأة اليوم (+{activeReward?.coins} عملة{activeReward?.gems ? ` و +${activeReward.gems} جوهرة` : ''})</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
