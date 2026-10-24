import React, { useState } from 'react';
import { LevelInfo, EnvironmentTheme } from '../types/game';
import { X, Star, Lock, Play, Sparkles } from 'lucide-react';

interface LevelSelectModalProps {
  levels: LevelInfo[];
  currentHighestUnlocked: number;
  onSelectLevel: (lvl: LevelInfo) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentHighestUnlocked,
  onSelectLevel,
  onClose
}) => {
  const [selectedWorld, setSelectedWorld] = useState<EnvironmentTheme | 'all'>('all');

  const worlds: { id: EnvironmentTheme | 'all'; name: string }[] = [
    { id: 'all', name: 'الكل (100)' },
    { id: 'cosmic_math_dimension', name: 'البُعد الكوني' },
    { id: 'futuristic_city', name: 'المدينة المستقبلية' },
    { id: 'magic_forest', name: 'الغابة السحرية' },
    { id: 'desert_temple', name: 'الصحراء القديمة' },
    { id: 'ice_kingdom', name: 'مملكة الجليد' },
    { id: 'volcano_world', name: 'عالم الحمم' },
    { id: 'math_sanctuary', name: 'معبد الرياضيات' }
  ];

  const filteredLevels = selectedWorld === 'all'
    ? levels
    : levels.filter(l => l.world === selectedWorld);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>اختيار المرحلة (100 مرحلة)</span>
            </h2>
            <p className="text-xs text-slate-400">تحديات رياضية متدرجة عبر 6 عوالم ثلاثية الأبعاد</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-b border-slate-800">
          {worlds.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWorld(w.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedWorld === w.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto py-4 pr-1 flex-1">
          {filteredLevels.map(lvl => {
            // All stages are unlocked and open for player selection
            const isUnlocked = true;
            const isCompleted = lvl.levelNumber < currentHighestUnlocked;

            return (
              <button
                key={lvl.levelNumber}
                onClick={() => onSelectLevel(lvl)}
                className="relative rounded-2xl p-3 flex flex-col items-center justify-between border transition-all text-center group bg-slate-950/70 border-slate-700 hover:border-cyan-400 hover:scale-105 active:scale-95 shadow-md"
              >
                {/* Level Number */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] text-slate-400 font-bold">م {lvl.levelNumber}</span>
                  <Play className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-125 transition" />
                </div>

                {/* Level Title */}
                <span className="text-xs font-bold text-white mb-2 line-clamp-1">
                  {lvl.titleAr}
                </span>

                {/* Category badge */}
                <span className="text-[9px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full mb-2 font-semibold">
                  {lvl.category === 'addition' && 'جمع'}
                  {lvl.category === 'subtraction' && 'طرح'}
                  {lvl.category === 'multiplication' && 'ضرب'}
                  {lvl.category === 'division' && 'قسمة'}
                  {lvl.category === 'order_of_ops' && 'عمليات'}
                  {lvl.category === 'fractions' && 'كسور'}
                  {lvl.category === 'algebra' && 'معادلات'}
                  {lvl.category === 'mixed' && 'شامل'}
                </span>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= lvl.starsEarned
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
