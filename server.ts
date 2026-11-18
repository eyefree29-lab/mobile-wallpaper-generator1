import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateWallpapersFromMood,
  remixWallpapersFromBlueprint,
} from './server/wallpaperService.ts';
import type { WallpaperBlueprint } from './src/shared/wallpaperTypes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '4mb' }));

const PORT = Number(process.env.PORT) || 3000;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/wallpapers/generate', async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ error: '원하는 분위기를 입력해 주세요.' });
      return;
    }

    const variants = await generateWallpapersFromMood(prompt);
    res.json({ variants });
  } catch (error: any) {
    console.error('Wallpaper generate error:', error);
    const message =
      error?.message || '배경화면을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/wallpapers/remix', async (req, res) => {
  try {
    const baseBlueprint = req.body?.blueprint as WallpaperBlueprint | undefined;
    const remixPrompt = typeof req.body?.remixPrompt === 'string' ? req.body.remixPrompt.trim() : '';
    const originalPrompt =
      typeof req.body?.originalPrompt === 'string' ? req.body.originalPrompt.trim() : '';

    if (!baseBlueprint) {
      res.status(400).json({ error: 'Remix할 기준 배경화면 정보가 없습니다.' });
      return;
    }

    const variants = await remixWallpapersFromBlueprint(baseBlueprint, remixPrompt, originalPrompt);
    res.json({ variants });
  } catch (error: any) {
    console.error('Wallpaper remix error:', error);
    const message =
      error?.message || '배경화면을 Remix하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoodWall server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
