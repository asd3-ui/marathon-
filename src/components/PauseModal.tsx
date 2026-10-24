import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Mic, MicOff, Monitor } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (val: number) => void;
  onSfxVolumeChange: (val: number) => void;
  voiceTts: boolean;
  onToggleVoiceTts: () => void;
  quality: 'high' | 'medium' | 'low';
  onQualityChange: (q: 'high' | 'medium' | 'low') => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
  voiceTts,
  onToggleVoiceTts,
  quality,
  onQualityChange
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-black text-cyan-300 mb-1">
          اللعبة متوقفة مؤقتاً
        </h2>
        <p className="text-xs text-slate-400 mb-6">PAUSED</p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 mb-6">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>استئناف اللعب</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>إعادة المرحلة</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 active:scale-95 transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-5 h-5 text-cyan-400" />
            <span>القائمة الرئيسية</span>
          </button>
        </div>

        {/* Settings Box */}
        <div className="w-full bg-slate-950/70 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>الصوت العام</span>
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>موسيقى اللعبة: {Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={e => onMusicVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>المؤثرات الصوتية: {Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={e => onSfxVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Voice Prompt Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-slate-300">
            <span>نطق الأسئلة بالصوت</span>
            <button
              onClick={onToggleVoiceTts}
              className={`p-1.5 rounded-lg font-bold flex items-center gap-1 ${
                voiceTts ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voiceTts ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>{voiceTts ? 'مفعل' : 'معطل'}</span>
            </button>
          </div>

          {/* Graphics Quality */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>جودة الرسوم</span>
            </span>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    quality === q
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q === 'low' ? 'منخفضة' : q === 'medium' ? 'متوسطة' : 'عالية'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
