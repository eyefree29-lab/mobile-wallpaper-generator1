export type SceneType =
  | 'urban'
  | 'nature'
  | 'ocean'
  | 'celestial'
  | 'interior'
  | 'abstract';

export type ParticleType =
  | 'rain'
  | 'snow'
  | 'stars'
  | 'bokeh'
  | 'petals'
  | 'fireflies'
  | 'dust'
  | 'none';

export type CelestialKind = 'moon' | 'crescent' | 'sun' | 'halo' | 'none';

export type LightKind = 'window' | 'lamp' | 'bokeh' | 'star';

export interface CloudBand {
  y: number;
  height: number;
  opacity: number;
  tint: string;
  curveSeed: number;
}

export interface SilhouetteLayer {
  depth: number;
  color: string;
  opacity: number;
  svgPath: string;
}

export interface LightPoint {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  kind: LightKind;
}

export interface WallpaperBlueprint {
  id: string;
  title: string;
  moodNote: string;
  sceneType: SceneType;
  seed: number;
  palette: {
    skyStops: [string, string, string, string];
    glowColor: string;
    accentColor: string;
    silhouetteColors: [string, string, string];
    reflectionTint: string;
  };
  celestial: {
    kind: CelestialKind;
    x: number;
    y: number;
    radius: number;
    color: string;
    haloStrength: number;
  };
  atmosphere: {
    particleType: ParticleType;
    particleDensity: number;
    fogOpacity: number;
    sunbeams: boolean;
    aurora: boolean;
    waterReflection: boolean;
    reflectionY: number;
    grain: number;
    vignette: number;
  };
  clouds: CloudBand[];
  silhouettes: SilhouetteLayer[];
  lights: LightPoint[];
}

export interface GeneratedWallpaper {
  blueprint: WallpaperBlueprint;
  dataUrl: string;
}

export interface WallpaperBatch {
  id: string;
  prompt: string;
  remixOfTitle?: string;
  createdAt: number;
  items: GeneratedWallpaper[];
}
