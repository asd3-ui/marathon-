import React from 'react';
import { RotateCcw, Home, Award, Coins, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { MathQuestion } from '../types/game';

interface GameOverModalProps {
  score: number;
  distance: number;
  coinsEarned: number;
  reason: string;
  mathHistory: { question: MathQuestion; isCorrect: boolean; chosenOption: number }[];
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  coinsEarned,
  reason,
  mathHistory,
  onRetry,
  onHome
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Banner */}
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3">
          <XCircle className="w-10 h-10" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-rose-400 mb-1">
          انتهى السباق!
        </h2>
        <p className="text-xs text-slate-400 mb-4">{reason}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold">النقاط</span>
            <span className="text-lg font-black text-amber-400">{score.toLocaleString()}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 mb-1">المسافة</span>
            <span className="text-[10px] text-slate-400 font-bold">متر</span>
            <span className="text-lg font-black text-sky-400">{distance} م</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <Coins className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-bold">العملات</span>
            <span className="text-lg font-black text-yellow-400">+{coinsEarned}</span>
          </div>
        </div>

        {/* Math Question Review / Learning section */}
        {mathHistory.length > 0 && (
          <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>مراجعة المسائل في هذا السباق:</span>
            </div>

            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {mathHistory.map((h, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold border ${
                    h.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {h.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{h.question.equation} = {h.question.correctAnswer}</span>
                  </div>

                  {!h.isCorrect && (
                    <span className="text-[10px] text-slate-400">
                      إجابتك: {h.chosenOption}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>حاول مجدداً</span>
          </button>

          <button
            onClick={onHome}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-5 h-5 text-cyan-400" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
