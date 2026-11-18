import type { WallpaperBlueprint } from '../shared/wallpaperTypes.ts';

export const STARTER_PROMPT = '비 오는 서정적인 도시 풍경';

export const STARTER_BLUEPRINTS: WallpaperBlueprint[] = [
  {
    id: 'starter_rain_1',
    title: '새벽 빗속의 네온 골목',
    moodNote: '깊은 코발트 빗줄기 · 젖은 아스팔트 반영',
    sceneType: 'urban',
    seed: 48291,
    palette: {
      skyStops: ['#070B19', '#0F1A36', '#1B315E', '#3A5A8C'],
      glowColor: '#60A5FA',
      accentColor: '#F59E0B',
      silhouetteColors: ['#131F38', '#0C1324', '#060912'],
      reflectionTint: '#172554',
    },
    celestial: {
      kind: 'halo',
      x: 0.72,
      y: 0.25,
      radius: 0.14,
      color: '#93C5FD',
      haloStrength: 0.65,
    },
    atmosphere: {
      particleType: 'rain',
      particleDensity: 0.82,
      fogOpacity: 0.34,
      sunbeams: false,
      aurora: false,
      waterReflection: true,
      reflectionY: 0.69,
      grain: 0.06,
      vignette: 0.42,
    },
    clouds: [
      { y: 0.22, height: 0.09, opacity: 0.22, tint: '#64748B', curveSeed: 12 },
      { y: 0.38, height: 0.11, opacity: 0.18, tint: '#475569', curveSeed: 44 },
    ],
    silhouettes: [
      {
        depth: 0,
        color: '#131F38',
        opacity: 0.85,
        svgPath:
          'M0,1220 L0,960 L120,960 L120,860 L230,860 L230,980 L340,980 L340,780 L470,780 L470,920 L600,920 L600,820 L740,820 L740,970 L880,970 L880,840 L1010,840 L1010,930 L1080,930 L1080,1920 L0,1920 Z',
      },
      {
        depth: 1,
        color: '#090E1C',
        opacity: 0.96,
        svgPath:
          'M0,1320 L0,1040 L95,1040 L95,940 L210,940 L210,1080 L380,1080 L380,900 L510,900 L510,1110 L690,1110 L690,960 L820,960 L820,1090 L960,1090 L960,990 L1080,990 L1080,1920 L0,1920 Z',
      },
    ],
    lights: [
      { x: 0.16, y: 0.56, radius: 22, color: '#F59E0B', opacity: 0.72, kind: 'lamp' },
      { x: 0.44, y: 0.51, radius: 18, color: '#38BDF8', opacity: 0.65, kind: 'bokeh' },
      { x: 0.76, y: 0.58, radius: 28, color: '#FBBF24', opacity: 0.75, kind: 'lamp' },
      { x: 0.31, y: 0.63, radius: 14, color: '#FB7185', opacity: 0.55, kind: 'bokeh' },
      { x: 0.62, y: 0.64, radius: 24, color: '#60A5FA', opacity: 0.58, kind: 'bokeh' },
      { x: 0.87, y: 0.54, radius: 16, color: '#FDE68A', opacity: 0.64, kind: 'lamp' },
    ],
  },
  {
    id: 'starter_rain_2',
    title: '노을 끝자락 빗방울 창가',
    moodNote: '따스한 호박빛 잔광 · 흐린 유리창의 빛망울',
    sceneType: 'urban',
    seed: 91304,
    palette: {
      skyStops: ['#1A1423', '#3D2645', '#834D56', '#D98A6C'],
      glowColor: '#FDBA74',
      accentColor: '#FDE047',
      silhouetteColors: ['#312132', '#201522', '#100A12'],
      reflectionTint: '#432837',
    },
    celestial: {
      kind: 'sun',
      x: 0.34,
      y: 0.41,
      radius: 0.09,
      color: '#FDBA74',
      haloStrength: 0.85,
    },
    atmosphere: {
      particleType: 'bokeh',
      particleDensity: 0.75,
      fogOpacity: 0.38,
      sunbeams: true,
      aurora: false,
      waterReflection: true,
      reflectionY: 0.71,
      grain: 0.07,
      vignette: 0.35,
    },
    clouds: [
      { y: 0.19, height: 0.1, opacity: 0.25, tint: '#FCA5A5', curveSeed: 29 },
      { y: 0.33, height: 0.08, opacity: 0.2, tint: '#FDBA74', curveSeed: 63 },
    ],
    silhouettes: [
      {
        depth: 0,
        color: '#2D1E2E',
        opacity: 0.88,
        svgPath:
          'M0,1260 L0,1010 L160,1010 L160,910 L290,910 L290,1050 L460,1050 L460,870 L590,870 L590,1030 L780,1030 L780,930 L920,930 L920,1040 L1080,1040 L1080,1920 L0,1920 Z',
      },
      {
        depth: 1,
        color: '#170E19',
        opacity: 0.96,
        svgPath:
          'M0,1360 L0,1130 L140,1130 L140,1050 L310,1050 L310,1160 L540,1160 L540,1020 L680,1020 L680,1150 L870,1150 L870,1060 L1080,1060 L1080,1920 L0,1920 Z',
      },
    ],
    lights: [
      { x: 0.22, y: 0.59, radius: 26, color: '#FDE047', opacity: 0.65, kind: 'bokeh' },
      { x: 0.56, y: 0.55, radius: 34, color: '#FDBA74', opacity: 0.55, kind: 'bokeh' },
      { x: 0.78, y: 0.62, radius: 20, color: '#FB7185', opacity: 0.62, kind: 'lamp' },
      { x: 0.38, y: 0.66, radius: 28, color: '#FBBF24', opacity: 0.5, kind: 'bokeh' },
      { x: 0.89, y: 0.57, radius: 18, color: '#FDE68A', opacity: 0.68, kind: 'lamp' },
    ],
  },
  {
    id: 'starter_rain_3',
    title: '청록빛 안개 젖은 고가도로',
    moodNote: '차분한 민트 틸 그라데이션 · 몽환적인 새벽 정적',
    sceneType: 'urban',
    seed: 22018,
    palette: {
      skyStops: ['#081C24', '#0F3443', '#1F5F6B', '#4E9299'],
      glowColor: '#5EEAD4',
      accentColor: '#A7F3D0',
      silhouetteColors: ['#13353D', '#0B2127', '#051014'],
      reflectionTint: '#11424B',
    },
    celestial: {
      kind: 'crescent',
      x: 0.26,
      y: 0.22,
      radius: 0.055,
      color: '#CCFBF1',
      haloStrength: 0.58,
    },
    atmosphere: {
      particleType: 'rain',
      particleDensity: 0.58,
      fogOpacity: 0.52,
      sunbeams: false,
      aurora: false,
      waterReflection: true,
      reflectionY: 0.67,
      grain: 0.05,
      vignette: 0.36,
    },
    clouds: [
      { y: 0.28, height: 0.12, opacity: 0.26, tint: '#99F6E4', curveSeed: 71 },
      { y: 0.45, height: 0.14, opacity: 0.28, tint: '#5EEAD4', curveSeed: 88 },
    ],
    silhouettes: [
      {
        depth: 0,
        color: '#113038',
        opacity: 0.82,
        svgPath:
          'M0,1240 Q280,1190 560,1230 T1080,1200 L1080,1920 L0,1920 Z',
      },
      {
        depth: 1,
        color: '#07171C',
        opacity: 0.95,
        svgPath:
          'M0,1290 L0,1110 L110,1110 L110,1010 L240,1010 L240,1140 L420,1140 L420,960 L540,960 L540,1120 L740,1120 L740,1020 L890,1020 L890,1140 L1080,1140 L1080,1920 L0,1920 Z',
      },
    ],
    lights: [
      { x: 0.18, y: 0.61, radius: 18, color: '#99F6E4', opacity: 0.72, kind: 'lamp' },
      { x: 0.47, y: 0.54, radius: 22, color: '#5EEAD4', opacity: 0.6, kind: 'bokeh' },
      { x: 0.68, y: 0.6, radius: 16, color: '#FDE68A', opacity: 0.68, kind: 'lamp' },
      { x: 0.84, y: 0.58, radius: 24, color: '#A7F3D0', opacity: 0.55, kind: 'bokeh' },
    ],
  },
  {
    id: 'starter_rain_4',
    title: '자정의 은빛 빗물 정거장',
    moodNote: '모노크롬 슬레이트 대비 · 차가운 가로등 빛무리',
    sceneType: 'urban',
    seed: 67542,
    palette: {
      skyStops: ['#090A0F', '#161925', '#272C3F', '#4A5270'],
      glowColor: '#E2E8F0',
      accentColor: '#93C5FD',
      silhouetteColors: ['#1E2230', '#12151E', '#08090E'],
      reflectionTint: '#1E2433',
    },
    celestial: {
      kind: 'moon',
      x: 0.75,
      y: 0.21,
      radius: 0.06,
      color: '#F1F5F9',
      haloStrength: 0.75,
    },
    atmosphere: {
      particleType: 'rain',
      particleDensity: 0.92,
      fogOpacity: 0.4,
      sunbeams: true,
      aurora: false,
      waterReflection: true,
      reflectionY: 0.7,
      grain: 0.09,
      vignette: 0.52,
    },
    clouds: [
      { y: 0.2, height: 0.09, opacity: 0.24, tint: '#CBD5E1', curveSeed: 35 },
      { y: 0.36, height: 0.11, opacity: 0.2, tint: '#94A3B8', curveSeed: 92 },
    ],
    silhouettes: [
      {
        depth: 0,
        color: '#1C202E',
        opacity: 0.88,
        svgPath:
          'M0,1270 L0,1040 L170,1040 L170,920 L310,920 L310,1060 L480,1060 L480,860 L620,860 L620,1020 L800,1020 L800,910 L950,910 L950,1030 L1080,1030 L1080,1920 L0,1920 Z',
      },
      {
        depth: 1,
        color: '#0A0C12',
        opacity: 0.98,
        svgPath:
          'M0,1340 L0,1150 L220,1150 L220,1060 L370,1060 L370,1170 L660,1170 L660,1040 L840,1040 L840,1160 L1080,1160 L1080,1920 L0,1920 Z',
      },
    ],
    lights: [
      { x: 0.25, y: 0.58, radius: 22, color: '#E2E8F0', opacity: 0.82, kind: 'lamp' },
      { x: 0.55, y: 0.55, radius: 28, color: '#93C5FD', opacity: 0.6, kind: 'bokeh' },
      { x: 0.81, y: 0.61, radius: 20, color: '#F8FAFC', opacity: 0.78, kind: 'lamp' },
      { x: 0.39, y: 0.64, radius: 14, color: '#60A5FA', opacity: 0.5, kind: 'bokeh' },
    ],
  },
];
