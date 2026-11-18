import { remixWallpapersFromBlueprint } from '../../server/wallpaperService.ts';
import type { WallpaperBlueprint } from '../../src/shared/wallpaperTypes.ts';

function parseBody(body: unknown): Record<string, any> {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as Record<string, any>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = parseBody(req.body);
    const baseBlueprint = body.blueprint as WallpaperBlueprint | undefined;
    const remixPrompt = typeof body.remixPrompt === 'string' ? body.remixPrompt.trim() : '';
    const originalPrompt =
      typeof body.originalPrompt === 'string' ? body.originalPrompt.trim() : '';

    if (!baseBlueprint) {
      res.status(400).json({ error: 'Remix할 기준 배경화면 정보가 없습니다.' });
      return;
    }

    const variants = await remixWallpapersFromBlueprint(baseBlueprint, remixPrompt, originalPrompt);
    res.status(200).json({ variants });
  } catch (error: any) {
    console.error('Vercel wallpaper remix error:', error);
    const message =
      error?.message || '배경화면을 Remix하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    res.status(500).json({ error: message });
  }
}
