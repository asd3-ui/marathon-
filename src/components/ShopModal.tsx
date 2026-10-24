import React, { useState } from 'react';
import { CharacterSkin, ThrusterColorOption, PlayerProgress } from '../types/game';
import { X, ShoppingBag, Coins, Check, Lock, Shield, Magnet, Zap, Clock, Rocket, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundEngine';

import { GAME_CHARACTERS } from '../config/characters';

interface ShopModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updater: (prev: PlayerProgress) => PlayerProgress) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onUpdateProgress,
  onClose
}) => {
  const [tab, setTab] = useState<'skins' | 'thrusters' | 'upgrades'>('skins');

  const skins: CharacterSkin[] = GAME_CHARACTERS.map(c => ({
    ...c,
    unlocked: c.unlocked || progress.unlockedSkins.includes(c.id)
  }));


  const thrusters: ThrusterColorOption[] = [
    {
      id: 'cyan',
      name: 'Laser Cyan',
      nameAr: 'شعاع الليزر السماوي',
      price: 0,
      unlocked: true,
      colorHex: 0x38bdf8,
      colorCss: '#38bdf8'
    },
    {
      id: 'solar',
      name: 'Solar Flame',
      nameAr: 'لهب الشمس الذهبي',
      price: 250,
      unlocked: progress.unlockedThrusters.includes('solar'),
      colorHex: 0xf97316,
      colorCss: '#f97316'
    },
    {
      id: 'emerald',
      name: 'Emerald Plasma',
      nameAr: 'بلازما الزمرد',
      price: 400,
      unlocked: progress.unlockedThrusters.includes('emerald'),
      colorHex: 0x10b981,
      colorCss: '#10b981'
    },
    {
      id: 'violet',
      name: 'Cosmic Violet',
      nameAr: 'الشفق الكوني',
      price: 600,
      unlocked: progress.unlockedThrusters.includes('violet'),
      colorHex: 0xa855f7,
      colorCss: '#a855f7'
    }
  ];

  const handleBuySkin = (skin: CharacterSkin) => {
    if (skin.unlocked || progress.unlockedSkins.includes(skin.id)) {
      // Equip
      onUpdateProgress(prev => ({ ...prev, equippedSkin: skin.id }));
      sound.playCoin();
      return;
    }

    if (progress.coins >= skin.price) {
      sound.playPowerup();
      onUpdateProgress(prev => ({
        ...prev,
        coins: prev.coins - skin.price,
        unlockedSkins: [...prev.unlockedSkins, skin.id],
        equippedSkin: skin.id
      }));
    } else {
      sound.playWrongAnswer();
    }
  };

  const handleBuyThruster = (th: ThrusterColorOption) => {
    if (th.unlocked || progress.unlockedThrusters.includes(th.id)) {
      onUpdateProgress(prev => ({ ...prev, equippedThruster: th.id }));
      sound.playCoin();
      return;
    }

    if (progress.coins >= th.price) {
      sound.playPowerup();
      onUpdateProgress(prev => ({
        ...prev,
        coins: prev.coins - th.price,
        unlockedThrusters: [...prev.unlockedThrusters, th.id],
        equippedThruster: th.id
      }));
    } else {
      sound.playWrongAnswer();
    }
  };

  const handleUpgradePowerup = (type: keyof PlayerProgress['powerUpLevels']) => {
    const currentLvl = progress.powerUpLevels[type];
    const cost = (currentLvl + 1) * 200;

    if (currentLvl >= 5) return;

    if (progress.coins >= cost) {
      sound.playPowerup();
      onUpdateProgress(prev => ({
        ...prev,
        coins: prev.coins - cost,
        powerUpLevels: {
          ...prev.powerUpLevels,
          [type]: prev.powerUpLevels[type] + 1
        }
      }));
    } else {
      sound.playWrongAnswer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">متجر الأبطال والمكافآت</h2>
              <p className="text-xs text-slate-400">خصص مظهر بطلك وطور قواك الخارقة</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-amber-300">{progress.coins}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-slate-800">
          <button
            onClick={() => setTab('skins')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'skins'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>أزياء الشخصية</span>
          </button>

          <button
            onClick={() => setTab('thrusters')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'thrusters'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>نفاثات الحذاء</span>
          </button>

          <button
            onClick={() => setTab('upgrades')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'upgrades'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>ترقيات القدرات</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto py-4 flex-1 pr-1">
          {tab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skins.map(sk => {
                const isEquipped = progress.equippedSkin === sk.id;
                const isOwned = sk.unlocked || progress.unlockedSkins.includes(sk.id);

                return (
                  <div
                    key={sk.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20"
                        style={{ backgroundColor: sk.hoodieColor }}
                      >
                        {sk.icon}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white">{sk.nameAr}</h4>
                        <p className="text-[11px] text-slate-400">{sk.name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuySkin(sk)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950'
                          : isOwned
                          ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>مفعّل</span>
                        </>
                      ) : isOwned ? (
                        <span>ارتداء</span>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>{sk.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'thrusters' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {thrusters.map(th => {
                const isEquipped = progress.equippedThruster === th.id;
                const isOwned = th.unlocked || progress.unlockedThrusters.includes(th.id);

                return (
                  <div
                    key={th.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-400'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: th.colorCss, boxShadow: `0 0 12px ${th.colorCss}` }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white">{th.nameAr}</h4>
                        <p className="text-[11px] text-slate-400">{th.name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyThruster(th)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950'
                          : isOwned
                          ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>مفعّل</span>
                        </>
                      ) : isOwned ? (
                        <span>تجهيز</span>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>{th.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'upgrades' && (
            <div className="flex flex-col gap-3">
              {[
                { key: 'shield' as const, name: 'الدرع المغناطيسي', desc: 'يحمي من الاصطدامات والمسائل الخاطئة', icon: Shield, color: 'text-sky-400' },
                { key: 'magnet' as const, name: 'مغناطيس العملات', desc: 'يجذب العملات تلقائياً من كل المسارات', icon: Magnet, color: 'text-rose-400' },
                { key: 'multiplier' as const, name: 'مضاعف النقاط 2X', desc: 'يضاعف جميع نقاط الرياضيات والعملات', icon: Zap, color: 'text-amber-400' },
                { key: 'slowmo' as const, name: 'إبطاء الوقت', desc: 'يمنحك وقتاً كافياً لقراءة واختيار البوابات', icon: Clock, color: 'text-purple-400' }
              ].map(item => {
                const lvl = progress.powerUpLevels[item.key];
                const cost = (lvl + 1) * 200;
                const isMax = lvl >= 5;

                return (
                  <div
                    key={item.key}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{item.name}</h4>
                          <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                            مستوى {lvl}/5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      disabled={isMax}
                      onClick={() => handleUpgradePowerup(item.key)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110'
                      }`}
                    >
                      {isMax ? (
                        <span>الحد الأقصى</span>
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>ترقية ({cost})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
