import React from 'react';
import { PlayerProgress, MathCategory } from '../types/game';
import { X, BarChart3, Target, Award, CheckCircle2, Flame } from 'lucide-react';

interface StatsModalProps {
  progress: PlayerProgress;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ progress, onClose }) => {
  const totalAnswers = progress.totalCorrectAnswers + progress.totalWrongAnswers;
  const overallAccuracy = totalAnswers > 0
    ? Math.round((progress.totalCorrectAnswers / totalAnswers) * 100)
    : 100;

  const categoryNames: Record<MathCategory, { nameAr: string; icon: string }> = {
    addition: { nameAr: 'الجمع الحسابي', icon: '➕' },
    subtraction: { nameAr: 'الطرح الذهني', icon: '➖' },
    multiplication: { nameAr: 'جدول الضرب', icon: '✖️' },
    division: { nameAr: 'القسمة الصحيحة', icon: '➗' },
    order_of_ops: { nameAr: 'ترتيب العمليات', icon: '🔢' },
    fractions: { nameAr: 'الكسور والنسب', icon: '٪' },
    algebra: { nameAr: 'معادلات المتغيرات', icon: '📐' },
    mixed: { nameAr: 'التحديات الشاملة', icon: '⭐' }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إحصائيات التفوق الرياضي</h2>
              <p className="text-xs text-slate-400">تقييم مهاراتك وسرعة بديهتك في الحساب</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Target className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold">الدقة العامة</span>
            <span className="text-lg font-black text-emerald-400">{overallAccuracy}%</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold">مسائل مجابة</span>
            <span className="text-lg font-black text-cyan-400">{progress.totalCorrectAnswers}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold">أعلى مرحلة</span>
            <span className="text-lg font-black text-amber-400">م {progress.highestLevelUnlocked}</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>تفاصيل الدقة حسب العمليات:</span>
          </h4>

          {(Object.keys(categoryNames) as MathCategory[]).map(cat => {
            const data = progress.categoryStats[cat] || { correct: 0, total: 0 };
            const catAcc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            const meta = categoryNames[cat];

            return (
              <div
                key={cat}
                className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span>{meta.nameAr}</span>
                  </span>
                  <span className="text-cyan-300 font-black">
                    {data.correct} / {data.total} ({catAcc}%)
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${catAcc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
