import React from 'react';
import { CharacterSkin, PlayerProgress } from '../types/game';
import { X, Check, Lock, Coins, Sparkles, Zap, ArrowUp, Shield } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface CharacterSelectModalProps {
  progress: PlayerProgress;
  characters: CharacterSkin[];
  onSelectCharacter: (charId: string) => void;
  onBuyCharacter: (char: CharacterSkin) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  progress,
  characters,
  onSelectCharacter,
  onBuyCharacter,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                اختيار وشراء الأبطال
              </h2>
              <p className="text-xs text-slate-400">
                شخصيات ثلاثية الأبعاد واقعية بمظاهر وعتاد وقدرات سباق مميزة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coin balance */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-amber-300">{progress.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto py-4 pr-1 flex-1">
          {characters.map(char => {
            const isEquipped = progress.equippedSkin === char.id;
            const isOwned = char.unlocked || progress.unlockedSkins.includes(char.id);
            const canAfford = progress.coins >= char.price;

            return (
              <div
                key={char.id}
                className={`relative rounded-3xl p-4 border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-gradient-to-b from-cyan-950/50 to-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : isOwned
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900/80'
                }`}
              >
                {/* Top Badge & Model Avatar */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20 relative overflow-hidden"
                      style={{ backgroundColor: char.hoodieColor }}
                    >
                      <span>{char.icon}</span>
                      {/* Accent glow corner */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg"
                        style={{ backgroundColor: char.thrusterColor }}
                      />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{char.nameAr}</h3>
                      <span className="text-[11px] font-bold text-cyan-300 block">{char.titleAr}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{char.name}</span>
                    </div>
                  </div>

                  {isEquipped && (
                    <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      مفعّل
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {char.descriptionAr}
                </p>

                {/* Character Realistic Stats */}
                <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>السرعة الأساسية</span>
                    </span>
                    <span className="text-amber-300">{char.speedRating}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${char.speedRating}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold pt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>قوة القفز النفاث</span>
                    </span>
                    <span className="text-cyan-300">{char.jumpRating}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${char.jumpRating}%` }}
                    />
                  </div>
                </div>

                {/* Action Button: Equip or Buy */}
                {isEquipped ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-2xl bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default border border-cyan-500/30"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>البطل المختار حالياً</span>
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => {
                      sound.playCoin();
                      onSelectCharacter(char.id);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>اختيار هذا البطل</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyCharacter(char)}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-amber-500/25'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>شراء البطل ({char.price.toLocaleString()} عملة)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
