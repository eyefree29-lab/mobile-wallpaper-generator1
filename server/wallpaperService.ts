import { GoogleGenAI, Type } from '@google/genai';
import type { WallpaperBlueprint } from '../src/shared/wallpaperTypes.ts';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    variants: {
      type: Type.ARRAY,
      description: 'Exactly 4 distinct 9:16 mobile wallpaper artistic blueprints.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Short poetic Korean title (2 to 5 words).',
          },
          moodNote: {
            type: Type.STRING,
            description:
              'Concise Korean mood/lighting descriptor (e.g. "새벽 빗물 반사 · 깊은 코발트와 호박색 네온").',
          },
          sceneType: {
            type: Type.STRING,
            description: 'One of: urban, nature, ocean, celestial, interior, abstract',
          },
          seed: {
            type: Type.INTEGER,
            description: 'Random integer seed between 1000 and 999999.',
          },
          palette: {
            type: Type.OBJECT,
            properties: {
              skyStops: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 4 hex color strings (#RRGGBB) from top sky to horizon.',
              },
              glowColor: { type: Type.STRING, description: 'Atmospheric glow hex color (#RRGGBB).' },
              accentColor: { type: Type.STRING, description: 'Luminous highlight hex color (#RRGGBB).' },
              silhouetteColors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 3 hex color strings (#RRGGBB) from distant ridge/building to near foreground.',
              },
              reflectionTint: {
                type: Type.STRING,
                description: 'Water or wet pavement reflection hex color (#RRGGBB).',
              },
            },
            required: ['skyStops', 'glowColor', 'accentColor', 'silhouetteColors', 'reflectionTint'],
          },
          celestial: {
            type: Type.OBJECT,
            properties: {
              kind: { type: Type.STRING, description: 'One of: moon, crescent, sun, halo, none' },
              x: { type: Type.NUMBER, description: 'Horizontal position 0.15 to 0.85' },
              y: { type: Type.NUMBER, description: 'Vertical position 0.14 to 0.48' },
              radius: { type: Type.NUMBER, description: 'Radius ratio 0.04 to 0.20' },
              color: { type: Type.STRING, description: 'Hex color (#RRGGBB)' },
              haloStrength: { type: Type.NUMBER, description: '0.2 to 1.0' },
            },
            required: ['kind', 'x', 'y', 'radius', 'color', 'haloStrength'],
          },
          atmosphere: {
            type: Type.OBJECT,
            properties: {
              particleType: {
                type: Type.STRING,
                description: 'One of: rain, snow, stars, bokeh, petals, fireflies, dust, none',
              },
              particleDensity: { type: Type.NUMBER, description: '0.15 to 1.0' },
              fogOpacity: { type: Type.NUMBER, description: '0.05 to 0.7' },
              sunbeams: { type: Type.BOOLEAN },
              aurora: { type: Type.BOOLEAN },
              waterReflection: { type: Type.BOOLEAN },
              reflectionY: { type: Type.NUMBER, description: '0.62 to 0.78' },
              grain: { type: Type.NUMBER, description: '0.03 to 0.12' },
              vignette: { type: Type.NUMBER, description: '0.22 to 0.62' },
            },
            required: [
              'particleType',
              'particleDensity',
              'fogOpacity',
              'sunbeams',
              'aurora',
              'waterReflection',
              'reflectionY',
              'grain',
              'vignette',
            ],
          },
          clouds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                y: { type: Type.NUMBER, description: '0.12 to 0.65' },
                height: { type: Type.NUMBER, description: '0.04 to 0.18' },
                opacity: { type: Type.NUMBER, description: '0.08 to 0.55' },
                tint: { type: Type.STRING, description: 'Hex color (#RRGGBB)' },
                curveSeed: { type: Type.NUMBER, description: '1 to 100' },
              },
              required: ['y', 'height', 'opacity', 'tint', 'curveSeed'],
            },
          },
          silhouettes: {
            type: Type.ARRAY,
            description:
              '2 to 3 layered vector silhouettes in 1080x1920 vertical coordinates. Every path must be closed (M ... Z) spanning x=0 to x=1080 and reaching y=1920 at bottom.',
            items: {
              type: Type.OBJECT,
              properties: {
                depth: { type: Type.INTEGER, description: '0 (far), 1 (mid), 2 (near)' },
                color: { type: Type.STRING, description: 'Hex color (#RRGGBB)' },
                opacity: { type: Type.NUMBER, description: '0.45 to 1.0' },
                svgPath: {
                  type: Type.STRING,
                  description:
                    'Valid SVG path d string in 1080x1920 coordinates, e.g. M0,1300 L180,1180 ... L1080,1920 L0,1920 Z',
                },
              },
              required: ['depth', 'color', 'opacity', 'svgPath'],
            },
          },
          lights: {
            type: Type.ARRAY,
            description: '8 to 16 atmospheric light points (windows, lamps, bokeh, or stars).',
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: '0.05 to 0.95' },
                y: { type: Type.NUMBER, description: '0.08 to 0.88' },
                radius: { type: Type.NUMBER, description: '3 to 42' },
                color: { type: Type.STRING, description: 'Hex color (#RRGGBB)' },
                opacity: { type: Type.NUMBER, description: '0.2 to 0.95' },
                kind: { type: Type.STRING, description: 'One of: window, lamp, bokeh, star' },
              },
              required: ['x', 'y', 'radius', 'color', 'opacity', 'kind'],
            },
          },
        },
        required: [
          'title',
          'moodNote',
          'sceneType',
          'seed',
          'palette',
          'celestial',
          'atmosphere',
          'clouds',
          'silhouettes',
          'lights',
        ],
      },
    },
  },
  required: ['variants'],
};

const SYSTEM_INSTRUCTION = `당신은 모바일 9:16(1080×1920) 감성 배경화면 전문 아트 디렉터입니다.
사용자가 입력한 한국어 분위기 설명을 바탕으로, 서로 확실히 다른 색감·구도·시간대·조명 해석을 가진 4가지(정확히 4개)의 세로 배경화면 설계(blueprint)를 JSON으로 생성하세요.

중요한 시각 설계 원칙:
1. 상단 15%~35% 영역은 스마트폰 잠금화면 시계가 잘 보이도록 비교적 여유롭고 조화로운 하늘·여백 구도를 유지하세요.
2. 4개의 버전은 각각 다른 무드 변주여야 합니다. 예:
   - 버전 1: 정통적이고 서정적인 원색 해석 (예: 깊은 비 내리는 밤의 푸른 네온)
   - 버전 2: 따뜻한 색온도 또는 황혼/새벽빛 해석 (예: 젖은 거리에 번지는 호박색 가로등)
   - 버전 3: 몽환적·미니멀 파스텔 또는 안개 낀 감성 해석
   - 버전 4: 극적인 명암 대비, 실루엣, 빛망울(bokeh) 중심의 영화적 구도
3. 모든 색상 값은 반드시 #RRGGBB 형식(6자리 hex)으로 반환하세요.
4. silhouettes의 svgPath는 1080×1920 좌표계에서 자연스러운 도시 스카이라인, 한옥 처마, 산맥, 소나무 능선, 해안 절벽, 아치형 창문, 파도 곡선 등을 그리며 반드시 "M0,... ... L1080,1920 L0,1920 Z" 형태로 닫힌 경로여야 합니다.
5. title과 moodNote는 세련되고 시적인 한국어로 작성하세요.`;

function sanitizeHex(hex: string | undefined, fallback: string): string {
  if (typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex.trim())) {
    return hex.trim();
  }
  return fallback;
}

function clamp(n: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeBlueprint(raw: any, index: number): WallpaperBlueprint {
  const allowedScenes = ['urban', 'nature', 'ocean', 'celestial', 'interior', 'abstract'] as const;
  const allowedParticles = [
    'rain',
    'snow',
    'stars',
    'bokeh',
    'petals',
    'fireflies',
    'dust',
    'none',
  ] as const;
  const allowedCelestial = ['moon', 'crescent', 'sun', 'halo', 'none'] as const;
  const allowedLights = ['window', 'lamp', 'bokeh', 'star'] as const;

  const sceneType = allowedScenes.includes(raw?.sceneType) ? raw.sceneType : 'urban';
  const particleType = allowedParticles.includes(raw?.atmosphere?.particleType)
    ? raw.atmosphere.particleType
    : 'none';
  const celestialKind = allowedCelestial.includes(raw?.celestial?.kind)
    ? raw.celestial.kind
    : 'moon';

  const skyRaw = Array.isArray(raw?.palette?.skyStops) ? raw.palette.skyStops : [];
  const skyStops: [string, string, string, string] = [
    sanitizeHex(skyRaw[0], '#0D1321'),
    sanitizeHex(skyRaw[1], '#1D2D44'),
    sanitizeHex(skyRaw[2], '#3E5C76'),
    sanitizeHex(skyRaw[3], '#748CAB'),
  ];

  const silRaw = Array.isArray(raw?.palette?.silhouetteColors) ? raw.palette.silhouetteColors : [];
  const silhouetteColors: [string, string, string] = [
    sanitizeHex(silRaw[0], '#1B263B'),
    sanitizeHex(silRaw[1], '#111827'),
    sanitizeHex(silRaw[2], '#070A12'),
  ];

  const clouds = Array.isArray(raw?.clouds)
    ? raw.clouds.slice(0, 5).map((c: any) => ({
        y: clamp(c?.y, 0.1, 0.72, 0.3),
        height: clamp(c?.height, 0.03, 0.22, 0.08),
        opacity: clamp(c?.opacity, 0.05, 0.65, 0.25),
        tint: sanitizeHex(c?.tint, '#8FA8C8'),
        curveSeed: clamp(c?.curveSeed, 1, 999, 17),
      }))
    : [];

  const silhouettes = Array.isArray(raw?.silhouettes)
    ? raw.silhouettes.slice(0, 4).map((s: any, idx: number) => ({
        depth: clamp(s?.depth, 0, 3, idx),
        color: sanitizeHex(s?.color, silhouetteColors[Math.min(idx, 2)]),
        opacity: clamp(s?.opacity, 0.35, 1, 0.92),
        svgPath: typeof s?.svgPath === 'string' && s.svgPath.trim().startsWith('M') ? s.svgPath.trim() : '',
      }))
    : [];

  const lights = Array.isArray(raw?.lights)
    ? raw.lights.slice(0, 20).map((l: any) => ({
        x: clamp(l?.x, 0.03, 0.97, 0.5),
        y: clamp(l?.y, 0.06, 0.92, 0.5),
        radius: clamp(l?.radius, 2, 48, 12),
        color: sanitizeHex(l?.color, '#FFD166'),
        opacity: clamp(l?.opacity, 0.15, 0.95, 0.6),
        kind: allowedLights.includes(l?.kind) ? l.kind : 'bokeh',
      }))
    : [];

  return {
    id: `wp_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    title: typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : `감성 장면 ${index + 1}`,
    moodNote:
      typeof raw?.moodNote === 'string' && raw.moodNote.trim()
        ? raw.moodNote.trim()
        : '9:16 세로 무드 컴포지션',
    sceneType,
    seed: Math.floor(clamp(raw?.seed, 1000, 999999, 10000 + index * 3137)),
    palette: {
      skyStops,
      glowColor: sanitizeHex(raw?.palette?.glowColor, '#93C5FD'),
      accentColor: sanitizeHex(raw?.palette?.accentColor, '#FBBF24'),
      silhouetteColors,
      reflectionTint: sanitizeHex(raw?.palette?.reflectionTint, '#1E293B'),
    },
    celestial: {
      kind: celestialKind,
      x: clamp(raw?.celestial?.x, 0.12, 0.88, 0.65),
      y: clamp(raw?.celestial?.y, 0.12, 0.52, 0.28),
      radius: clamp(raw?.celestial?.radius, 0.03, 0.24, 0.08),
      color: sanitizeHex(raw?.celestial?.color, '#FDE68A'),
      haloStrength: clamp(raw?.celestial?.haloStrength, 0.1, 1.0, 0.6),
    },
    atmosphere: {
      particleType,
      particleDensity: clamp(raw?.atmosphere?.particleDensity, 0.1, 1.0, 0.6),
      fogOpacity: clamp(raw?.atmosphere?.fogOpacity, 0, 0.75, 0.28),
      sunbeams: Boolean(raw?.atmosphere?.sunbeams),
      aurora: Boolean(raw?.atmosphere?.aurora),
      waterReflection: Boolean(raw?.atmosphere?.waterReflection),
      reflectionY: clamp(raw?.atmosphere?.reflectionY, 0.58, 0.82, 0.7),
      grain: clamp(raw?.atmosphere?.grain, 0.02, 0.15, 0.06),
      vignette: clamp(raw?.atmosphere?.vignette, 0.15, 0.7, 0.38),
    },
    clouds,
    silhouettes,
    lights,
  };
}

async function generateWithRetry(promptText: string): Promise<WallpaperBlueprint[]> {
  const ai = getAiClient();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: blueprintSchema,
        },
      });
      const text = (response.text ?? '').trim();
      if (!text) {
        throw new Error('모델로부터 빈 응답을 받았습니다.');
      }
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed?.variants) ? parsed.variants : [];
      if (list.length === 0) {
        throw new Error('생성된 배경화면 데이터가 비어 있습니다.');
      }
      const normalized = list.slice(0, 4).map((item: any, idx: number) => normalizeBlueprint(item, idx));
      while (normalized.length < 4) {
        const clone = normalizeBlueprint(list[normalized.length % list.length], normalized.length);
        clone.seed += normalized.length * 911;
        normalized.push(clone);
      }
      return normalized;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function generateWallpapersFromMood(prompt: string): Promise<WallpaperBlueprint[]> {
  const userPrompt = `사용자가 원하는 휴대폰 배경화면 분위기: "${prompt}"
이 분위기에 어울리는 서로 다른 4가지 9:16 세로 배경화면 구성을 만들어 주세요.`;
  return generateWithRetry(userPrompt);
}

export async function remixWallpapersFromBlueprint(
  baseBlueprint: WallpaperBlueprint,
  remixPrompt: string,
  originalPrompt: string
): Promise<WallpaperBlueprint[]> {
  const userPrompt = `기준 배경화면 정보:
- 원래 분위기: "${originalPrompt || baseBlueprint.title}"
- 선택된 장면 제목: "${baseBlueprint.title}" (${baseBlueprint.moodNote})
- 장면 유형: ${baseBlueprint.sceneType}
- 기존 하늘 색감: ${baseBlueprint.palette.skyStops.join(', ')}
- 기존 강조 색감: ${baseBlueprint.palette.accentColor}
- 날씨/입자: ${baseBlueprint.atmosphere.particleType}, 물 반사: ${baseBlueprint.atmosphere.waterReflection}

사용자의 Remix 요청: "${remixPrompt || '기존 감성과 핵심 구도를 유지하면서 색감, 빛, 시간대, 디테일을 새롭게 변주해 주세요.'}"

위 기준 배경화면의 DNA를 계승하되, 요청된 방향으로 신선하게 진화시킨 4가지 9:16 변형 버전을 생성해 주세요.`;
  return generateWithRetry(userPrompt);
}
