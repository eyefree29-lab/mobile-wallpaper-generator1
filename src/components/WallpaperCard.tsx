import { Download, Expand, Shuffle } from 'lucide-react';
import type { GeneratedWallpaper } from '../shared/wallpaperTypes.ts';

interface WallpaperCardProps {
  item: GeneratedWallpaper;
  index: number;
  onOpenFullscreen: (index: number) => void;
  onDownload: (item: GeneratedWallpaper) => void;
  onRemix: (item: GeneratedWallpaper) => void;
}

export function WallpaperCard({
  item,
  index,
  onOpenFullscreen,
  onDownload,
  onRemix,
}: WallpaperCardProps) {
  const { blueprint, dataUrl } = item;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-[#14161D] border border-white/10 shadow-lg shadow-black/40">
        <button
          type="button"
          onClick={() => onOpenFullscreen(index)}
          aria-label={`${blueprint.title} 전체 화면으로 보기`}
          className="relative block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7CFA]"
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`${blueprint.title} — ${blueprint.moodNote}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-slate-400"
              style={{
                background: `linear-gradient(180deg, ${blueprint.palette.skyStops[0]}, ${blueprint.palette.skyStops[3]})`,
              }}
            >
              <span>{blueprint.title}</span>
            </div>
          )}

          {/* Bottom contrast scrim for clean title legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Subtle expand affordance icon */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white/80 backdrop-blur-md transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Expand className="h-3.5 w-3.5" />
          </span>

          {/* Unboxed typographic metadata over bottom scrim */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
            <p className="text-[11px] font-medium tracking-tight text-white/70 tabular-nums">
              0{index + 1} · 9:16
            </p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-white">
              {blueprint.title}
            </h3>
          </div>
        </button>
      </div>

      {/* Touch-friendly 44px+ action bar */}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onDownload(item)}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#161922] px-2.5 text-xs font-medium text-slate-200 border border-white/10 transition-colors duration-150 hover:bg-[#1E2230] hover:text-white active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7CFA]"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>다운로드</span>
        </button>
        <button
          type="button"
          onClick={() => onRemix(item)}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#161922] px-2.5 text-xs font-medium text-slate-200 border border-white/10 transition-colors duration-150 hover:bg-[#1E2230] hover:text-white active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7CFA]"
        >
          <Shuffle className="h-3.5 w-3.5 shrink-0" />
          <span>Remix</span>
        </button>
      </div>
    </article>
  );
}
