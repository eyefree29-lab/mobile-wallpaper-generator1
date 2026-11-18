import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, Check, History, Loader2, Wand2 } from 'lucide-react';
import { FullscreenViewer } from './components/FullscreenViewer.tsx';
import { RemixSheet } from './components/RemixSheet.tsx';
import { WallpaperCard } from './components/WallpaperCard.tsx';
import { STARTER_BLUEPRINTS, STARTER_PROMPT } from './data/starterWallpapers.ts';
import type {
  GeneratedWallpaper,
  WallpaperBatch,
  WallpaperBlueprint,
} from './shared/wallpaperTypes.ts';
import { downloadWallpaperPng, renderWallpaperToDataUrl } from './utils/wallpaperRenderer.ts';

const MOOD_SUGGESTIONS = [
  '비 오는 서정적인 도시 풍경',
  '새벽 안개 낀 고요한 소나무 숲',
  '노을 지는 바다 위 잔잔한 파도',
  '은하수가 흐르는 보랏빛 밤하늘',
  '따스한 햇살이 스미는 미니멀 창가',
];

function renderBatchItems(blueprints: WallpaperBlueprint[]): GeneratedWallpaper[] {
  return blueprints.map((bp) => ({
    blueprint: bp,
    dataUrl: renderWallpaperToDataUrl(bp),
  }));
}

export default function App() {
  const [prompt, setPrompt] = useState(STARTER_PROMPT);
  const [batches, setBatches] = useState<WallpaperBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [remixTarget, setRemixTarget] = useState<GeneratedWallpaper | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const initialItems = renderBatchItems(STARTER_BLUEPRINTS);
    const starterBatch: WallpaperBatch = {
      id: 'starter_batch',
      prompt: STARTER_PROMPT,
      createdAt: Date.now(),
      items: initialItems,
    };
    setBatches([starterBatch]);
    setActiveBatchId(starterBatch.id);
  }, []);

  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId) ?? batches[0] ?? null;
  }, [batches, activeBatchId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleGenerate = async (targetPrompt?: string) => {
    const cleanPrompt = (targetPrompt ?? prompt).trim();
    if (!cleanPrompt || isGenerating) {
      inputRef.current?.focus();
      return;
    }

    setPrompt(cleanPrompt);
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/wallpapers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || '배경화면을 생성하지 못했습니다.');
      }

      const blueprints = Array.isArray(data?.variants) ? (data.variants as WallpaperBlueprint[]) : [];
      if (blueprints.length === 0) {
        throw new Error('생성된 배경화면이 없습니다. 다시 시도해 주세요.');
      }

      const rendered = renderBatchItems(blueprints);
      const newBatch: WallpaperBatch = {
        id: `batch_${Date.now()}`,
        prompt: cleanPrompt,
        createdAt: Date.now(),
        items: rendered,
      };
      setBatches((prev) => [newBatch, ...prev].slice(0, 8));
      setActiveBatchId(newBatch.id);
    } catch (err: any) {
      setErrorMessage(
        err?.message || '서버와 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemixSubmit = async (target: GeneratedWallpaper, remixNote: string) => {
    if (isRemixing) return;
    setErrorMessage(null);
    setIsRemixing(true);

    try {
      const response = await fetch('/api/wallpapers/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint: target.blueprint,
          remixPrompt: remixNote,
          originalPrompt: activeBatch?.prompt || target.blueprint.title,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Remix 생성에 실패했습니다.');
      }

      const blueprints = Array.isArray(data?.variants) ? (data.variants as WallpaperBlueprint[]) : [];
      if (blueprints.length === 0) {
        throw new Error('Remix 결과가 비어 있습니다.');
      }

      const rendered = renderBatchItems(blueprints);
      const newBatch: WallpaperBatch = {
        id: `remix_${Date.now()}`,
        prompt: remixNote || `${target.blueprint.title} 변형`,
        remixOfTitle: target.blueprint.title,
        createdAt: Date.now(),
        items: rendered,
      };
      setBatches((prev) => [newBatch, ...prev].slice(0, 8));
      setActiveBatchId(newBatch.id);
      setRemixTarget(null);
      showToast('4가지 Remix 배경화면이 완성되었습니다');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Remix 중 오류가 발생했습니다.');
    } finally {
      setIsRemixing(false);
    }
  };

  const handleDownload = (item: GeneratedWallpaper) => {
    if (!item.dataUrl) return;
    downloadWallpaperPng(item.dataUrl, item.blueprint.title);
    showToast(`"${item.blueprint.title}" 저장됨`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  return (
    <div className="min-h-dvh bg-[#0B0C10] text-[#F4F4F6]">
      {/* Compact Sticky Top Bar (52px height, under 15% mobile sticky cap) */}
      <header className="sticky top-0 z-30 h-13 border-b border-white/10 bg-[#0B0C10]/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#top"
            className="font-serif-kr text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            무드월
          </a>

          <div className="flex items-center gap-2 shrink-0">
            {batches.length > 1 && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
              >
                <History className="h-3.5 w-3.5 shrink-0" />
                <span>기록 ({batches.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                inputRef.current?.focus();
              }}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/15 whitespace-nowrap"
            >
              <ArrowUp className="h-3.5 w-3.5 shrink-0" />
              <span>새 분위기</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 pt-5 pb-16 sm:px-6 sm:pt-8">
        {/* Mood Composer Section */}
        <section aria-label="배경화면 분위기 입력" className="mx-auto max-w-3xl">
          <div className="mb-4">
            <h1 className="font-serif-kr text-2xl font-semibold tracking-tight text-white sm:text-3xl [text-wrap:balance]">
              오늘 휴대폰에 담고 싶은 분위기
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              원하는 장면을 설명하면 9:16 세로 비율의 배경화면 4가지를 바로 만들어 드립니다.
            </p>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="rounded-3xl bg-[#14161D] p-3.5 sm:p-4 border border-white/10"
          >
            <label htmlFor="mood-prompt" className="sr-only">
              원하는 배경화면 분위기 설명
            </label>
            <textarea
              ref={inputRef}
              id="mood-prompt"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='예: "비 오는 서정적인 도시 풍경"'
              className="w-full resize-none bg-transparent px-1.5 py-1 text-base text-white placeholder:text-slate-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-3">
              {/* Quick Mood Suggestions */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
                {MOOD_SUGGESTIONS.map((suggestion) => {
                  const isActive = prompt.trim() === suggestion;
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setPrompt(suggestion);
                        handleGenerate(suggestion);
                      }}
                      disabled={isGenerating}
                      className={`min-h-[36px] shrink-0 rounded-xl px-2.5 text-xs font-medium transition-colors border whitespace-nowrap ${
                        isActive
                          ? 'bg-[#5B7CFA]/20 border-[#5B7CFA]/70 text-white'
                          : 'bg-[#1C1F28] border-white/10 text-slate-300 hover:bg-[#242834] hover:text-white'
                      }`}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#5B7CFA] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5B7CFA]/20 transition-colors hover:bg-[#4B6CF0] active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>4종 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>4가지 버전 생성</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Optional History Switcher Drawer */}
          {showHistory && batches.length > 1 && (
            <div className="mt-3 rounded-2xl bg-[#14161D] p-3 border border-white/10">
              <p className="mb-2 text-xs font-medium text-slate-400">최근 생성 기록</p>
              <div className="flex flex-wrap gap-2">
                {batches.map((batch) => (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => {
                      setActiveBatchId(batch.id);
                      setShowHistory(false);
                    }}
                    className={`min-h-[38px] max-w-[240px] truncate rounded-xl px-3 text-xs font-medium border transition-colors ${
                      batch.id === activeBatch?.id
                        ? 'bg-white text-slate-950 border-white'
                        : 'bg-[#1C1F28] text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    {batch.remixOfTitle ? `Remix · ${batch.prompt}` : batch.prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-2xl bg-red-950/50 px-4 py-3 text-sm text-red-200 border border-red-500/30"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div className="flex-1">
                <p>{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-xs font-medium text-red-300 underline underline-offset-2 shrink-0"
              >
                닫기
              </button>
            </div>
          )}
        </section>

        {/* 4-Variant 9:16 Wallpaper Showcase Grid */}
        <section aria-label="생성된 9:16 배경화면 4종" className="mt-7 sm:mt-10">
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                {activeBatch?.remixOfTitle
                  ? `"${activeBatch.remixOfTitle}" Remix 결과`
                  : `"${activeBatch?.prompt || prompt}"`}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                9:16 세로 비율 · 4가지 버전 · 이미지를 탭하면 전체 화면으로 볼 수 있습니다
              </p>
            </div>
          </div>

          {isGenerating ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {[0, 1, 2, 3].map((slot) => (
                <div key={slot} className="flex flex-col">
                  <div className="aspect-[9/16] w-full animate-pulse rounded-2xl bg-[#161922] border border-white/10 flex flex-col items-center justify-center p-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5B7CFA]" />
                    <p className="mt-2.5 text-xs font-medium text-slate-400 tabular-nums">
                      버전 0{slot + 1} 구상 중
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <div className="h-[44px] animate-pulse rounded-xl bg-[#161922]" />
                    <div className="h-[44px] animate-pulse rounded-xl bg-[#161922]" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeBatch ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {activeBatch.items.map((item, idx) => (
                <WallpaperCard
                  key={item.blueprint.id}
                  item={item}
                  index={idx}
                  onOpenFullscreen={(index) => setFullscreenIndex(index)}
                  onDownload={handleDownload}
                  onRemix={(selected) => setRemixTarget(selected)}
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>

      {/* Fullscreen 9:16 Viewer Modal */}
      <FullscreenViewer
        items={activeBatch?.items ?? []}
        activeIndex={fullscreenIndex}
        onClose={() => setFullscreenIndex(null)}
        onChangeIndex={(next) => setFullscreenIndex(next)}
        onDownload={handleDownload}
        onRemix={(selected) => setRemixTarget(selected)}
      />

      {/* Remix Bottom Sheet */}
      <RemixSheet
        target={remixTarget}
        isLoading={isRemixing}
        onClose={() => {
          if (!isRemixing) setRemixTarget(null);
        }}
        onSubmit={handleRemixSubmit}
      />

      {/* Subtle Bottom Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xl"
        >
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="whitespace-nowrap">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
