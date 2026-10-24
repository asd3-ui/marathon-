import React, { useState } from 'react';
import { 
  Play, 
  Infinity, 
  Layers, 
  ShoppingBag, 
  BarChart2, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Coins, 
  Gift, 
  Download,
  Share2,
  X
} from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MainMenuProps {
  progress: PlayerProgress;
  onStartCampaign: () => void;
  onStartEndless: () => void;
  onOpenCharacters: () => void;
  onOpenLevels: () => void;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onOpenDailyReward: () => void;
  hasUnclaimedDailyReward?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  controlsMode: 'swipe' | 'buttons' | 'both';
  onToggleControls: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartCampaign,
  onStartEndless,
  onOpenCharacters,
  onOpenLevels,
  onOpenShop,
  onOpenStats,
  onOpenDailyReward,
  hasUnclaimedDailyReward = true,
  isMuted,
  onToggleMute,
  controlsMode,
  onToggleControls
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90 select-none">
      {/* Top Bar: Coin Balance, Daily Reward, Install Button, Audio & Touch Toggles */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Coins Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-500/30 shadow-lg">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-base font-black text-amber-300">
              {progress.coins.toLocaleString()}
            </span>
          </div>

          {/* Daily Reward Button */}
          <button
            onClick={onOpenDailyReward}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-black shadow-lg transition active:scale-95 ${
              hasUnclaimedDailyReward
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400 text-amber-300 shadow-amber-500/20 animate-pulse'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>المكافأة اليومية</span>
            {hasUnclaimedDailyReward && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-slate-950 rounded-full" />
            )}
          </button>
        </div>

        {/* Quick Toggles & Install Button */}
        <div className="flex items-center gap-2">
          {/* PWA In-App Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 shadow-lg shadow-cyan-500/30 active:scale-95 transition"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSInstallGuide(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-cyan-400/50 text-cyan-300 font-bold text-xs hover:bg-slate-800 active:scale-95 transition shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تثبيت على الآيفون</span>
            </button>
          )}

          <button
            onClick={onToggleControls}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
            title="نمط التحكم"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {controlsMode === 'swipe' ? 'سحب فقط' : controlsMode === 'buttons' ? 'أزرار فقط' : 'سحب وأزرار'}
            </span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Center Branding & Hero Title (Selected elements removed per user instruction) */}
      <div className="flex flex-col items-center text-center my-auto px-4 max-w-2xl mx-auto">
        {/* Logo Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_4px_16px_rgba(6,182,212,0.6)] tracking-tight leading-tight mb-1">
          Math Run 3D
        </h1>
        <h2 className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)] mb-6">
          سباق الرياضيات
        </h2>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mb-4">
          <button
            onClick={onStartCampaign}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition"
          >
            <Play className="w-6 h-6 fill-slate-950 stroke-[2.5]" />
            <span>بدء اللعبة</span>
          </button>

          <button
            onClick={onStartEndless}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition"
          >
            <Infinity className="w-6 h-6 stroke-[3]" />
            <span>السباق اللانهائي</span>
          </button>
        </div>

        {/* Character Quick Selection Pill */}
        <button
          onClick={onOpenCharacters}
          className="mb-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-cyan-400/60 text-white font-extrabold text-xs sm:text-sm hover:bg-slate-800 hover:border-cyan-300 shadow-lg shadow-cyan-950/60 active:scale-95 transition"
        >
          <span className="text-base">👤</span>
          <span>اختيار البطل والمظهر ثلاثي الأبعاد</span>
          <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full text-[10px]">مخصص</span>
        </button>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            🎮 100 مرحلة متدرجة
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            🌍 7 عوالم ثلاثية الأبعاد
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            🧠 ذكاء حسابي تكيفي
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            ⚡ نفاثات وتخصيص كامل
          </span>
        </div>
      </div>

      {/* Bottom Nav: Characters, Levels, Shop, Stats */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-around gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-3xl border border-slate-800 shadow-2xl">
        <button
          onClick={onOpenCharacters}
          className="flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 active:scale-95 transition"
        >
          <span className="text-base leading-none">👤</span>
          <span className="text-[11px] font-bold">الأبطال</span>
        </button>

        <button
          onClick={onOpenLevels}
          className="flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 active:scale-95 transition"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[11px] font-bold">المراحل</span>
        </button>

        <button
          onClick={onOpenShop}
          className="flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 active:scale-95 transition"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-bold">المتجر</span>
        </button>

        <button
          onClick={onOpenStats}
          className="flex-1 py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 active:scale-95 transition"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[11px] font-bold">الإحصائيات</span>
        </button>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                <span>تثبيت اللعبة على iPhone / iPad</span>
              </h3>
              <button 
                onClick={() => setShowIOSInstallGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2">
              <span className="block">1. اضغط على زر <strong>المشاركة (Share)</strong> أسفل متصفح Safari.</span>
              <span className="block">2. مرّر للأسفل واضغط على <strong>إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.</span>
              <span className="block text-cyan-300 font-bold">ستعمل اللعبة بعدها كتطبيق هاتف كامل ومستقل!</span>
            </p>
            <button
              onClick={() => setShowIOSInstallGuide(false)}
              className="mt-5 w-full rounded-2xl bg-cyan-500 py-3 text-sm font-black text-slate-950 hover:bg-cyan-400"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
