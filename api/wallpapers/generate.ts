import { generateWallpapersFromMood } from '../../server/wallpaperService.ts';

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
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ error: '원하는 분위기를 입력해 주세요.' });
      return;
    }

    const variants = await generateWallpapersFromMood(prompt);
    res.status(200).json({ variants });
  } catch (error: any) {
    console.error('Vercel wallpaper generate error:', error);
    const message =
      error?.message || '배경화면을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    res.status(500).json({ error: message });
  }
}
