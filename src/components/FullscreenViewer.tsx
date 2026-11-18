import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Shuffle, Smartphone, X } from 'lucide-react';
import type { GeneratedWallpaper } from '../shared/wallpaperTypes.ts';

interface FullscreenViewerProps {
  items: GeneratedWallpaper[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
  onDownload: (item: GeneratedWallpaper) => void;
  onRemix: (item: GeneratedWallpaper) => void;
}

export function FullscreenViewer({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
  onDownload,
  onRemix,
}: FullscreenViewerProps) {
  const [showLockscreen, setShowLockscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && activeIndex > 0) onChangeIndex(activeIndex - 1);
      if (e.key === 'ArrowRight' && activeIndex < items.length - 1) onChangeIndex(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, items.length, onChangeIndex, onClose]);

  if (activeIndex === null || !items[activeIndex]) return null;

  const current = items[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = endX - touchStartX.current;
    if (diff > 48 && hasPrev) {
      onChangeIndex(activeIndex - 1);
    } else if (diff < -48 && hasNext) {
      onChangeIndex(activeIndex + 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${current.blueprint.title} 전체 화면 미리보기`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-bleed 9:16 stage on mobile, centered phone-ratio stage on desktop */}
      <div className="relative flex h-full w-full max-w-[460px] items-center justify-center sm:h-[92dvh] sm:w-auto sm:aspect-[9/16] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-white/15 sm:shadow-2xl">
        <img
          src={current.dataUrl}
          alt={`${current.blueprint.title} — ${current.blueprint.moodNote}`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover select-none"
        />

        {/* Top scrim + controls */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent" />
        <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setShowLockscreen((v) => !v)}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium backdrop-blur-md transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              showLockscreen
                ? 'bg-white text-slate-950'
                : 'bg-black/45 text-white border border-white/20 hover:bg-black/65'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 shrink-0" />
            <span>{showLockscreen ? '원본 보기' : '잠금화면 미리보기'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="전체 화면 닫기"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/45 text-white border border-white/20 backdrop-blur-md transition-colors duration-150 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Optional Phone Lockscreen Clock Overlay */}
        {showLockscreen && (
          <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center text-center text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
            <p className="text-sm font-medium tracking-wide text-white/90">
              11월 18일 수요일
            </p>
            <p className="font-mono-clock mt-1 text-6xl font-medium tracking-tight text-white">
              09:41
            </p>
          </div>
        )}

        {/* Left / Right navigation buttons */}
        {hasPrev && (
          <button
            type="button"
            onClick={() => onChangeIndex(activeIndex - 1)}
            aria-label="이전 배경화면"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/15 transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={() => onChangeIndex(activeIndex + 1)}
            aria-label="다음 배경화면"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/15 transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Bottom scrim + metadata + primary thumb-zone Download & Remix actions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
        <div className="pb-safe absolute inset-x-0 bottom-0 px-4 pt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-white/70 tabular-nums">
                {activeIndex + 1} / {items.length} · 1080 × 1920
              </p>
              <h2 className="mt-0.5 truncate text-base font-semibold text-white">
                {current.blueprint.title}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/75">
                {current.blueprint.moodNote}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onDownload(current)}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-lg transition-transform duration-150 hover:bg-slate-100 active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>다운로드</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRemix(current);
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#5B7CFA] px-4 text-sm font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-[#4B6CF0] active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Shuffle className="h-4 w-4 shrink-0" />
              <span>Remix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
