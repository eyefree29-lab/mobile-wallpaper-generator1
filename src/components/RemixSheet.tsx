import { useState } from 'react';
import { Loader2, Shuffle, X } from 'lucide-react';
import type { GeneratedWallpaper } from '../shared/wallpaperTypes.ts';

interface RemixSheetProps {
  target: GeneratedWallpaper | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (target: GeneratedWallpaper, remixPrompt: string) => void;
}

const REMIX_PRESETS = [
  '노을빛 따뜻한 색감으로 전환',
  '새벽 안개를 더 짙고 몽환적으로',
  '비 내리는 효과를 더 선명하게',
  '미니멀한 구도와 깊은 밤 대비',
];

export function RemixSheet({
  target,
  isLoading,
  onClose,
  onSubmit,
}: RemixSheetProps) {
  const [remixNote, setRemixNote] = useState('');

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit(target, remixNote.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="배경화면 Remix"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#14161D] border-t border-white/10 sm:rounded-3xl sm:border sm:border-white/10 shadow-2xl"
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white">배경화면 Remix</h2>
            <p className="text-xs text-slate-400">
              선택한 구도를 바탕으로 4가지 새로운 버전을 생성합니다
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Remix 닫기"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7CFA]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pb-safe px-5 pt-4 space-y-4">
          {/* Selected source preview */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-[#0B0C10] p-3 border border-white/10">
            <img
              src={target.dataUrl}
              alt={target.blueprint.title}
              referrerPolicy="no-referrer"
              className="h-20 w-[45px] shrink-0 rounded-lg object-cover border border-white/10"
            />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">기준 배경화면</p>
              <p className="truncate text-sm font-semibold text-white">
                {target.blueprint.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {target.blueprint.moodNote}
              </p>
            </div>
          </div>

          {/* Quick direction buttons */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-300">
              추천 변화 방향
            </p>
            <div className="flex flex-wrap gap-2">
              {REMIX_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRemixNote(preset)}
                  className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border whitespace-nowrap ${
                    remixNote === preset
                      ? 'bg-[#5B7CFA]/20 border-[#5B7CFA] text-white'
                      : 'bg-[#1C1F28] border-white/10 text-slate-300 hover:bg-[#232734] hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom remix direction */}
          <div>
            <label
              htmlFor="remix-instruction"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              원하는 변화 설명 (선택 사항)
            </label>
            <textarea
              id="remix-instruction"
              rows={2}
              value={remixNote}
              onChange={(e) => setRemixNote(e.target.value)}
              placeholder="예: 보랏빛 새벽 느낌 대신 따뜻한 노을빛과 잔잔한 빗방울을 더해줘"
              className="w-full resize-none rounded-2xl bg-[#0B0C10] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 border border-white/10 focus:border-[#5B7CFA] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#5B7CFA] px-4 text-sm font-semibold text-white shadow-lg shadow-[#5B7CFA]/20 transition-colors hover:bg-[#4B6CF0] active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>4가지 Remix 생성 중...</span>
              </>
            ) : (
              <>
                <Shuffle className="h-4 w-4" />
                <span>이 스타일로 4가지 Remix</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
