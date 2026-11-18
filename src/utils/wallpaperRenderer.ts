import type { WallpaperBlueprint } from '../shared/wallpaperTypes.ts';

const W = 1080;
const H = 1920;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

let cachedGrainCanvas: HTMLCanvasElement | null = null;
function getGrainPatternCanvas(): HTMLCanvasElement {
  if (cachedGrainCanvas) return cachedGrainCanvas;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const rand = mulberry32(847291);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rand() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 28;
    }
    ctx.putImageData(img, 0, 0);
  }
  cachedGrainCanvas = c;
  return c;
}

function drawFallbackMountains(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  amp: number,
  color: string,
  opacity: number,
  rand: () => number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, baseY);
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const px = (W / steps) * i;
    const py = baseY - (rand() - 0.35) * amp;
    const cx = px - W / (steps * 2);
    const cy = baseY - (rand() - 0.4) * amp * 1.1;
    ctx.quadraticCurveTo(cx, cy, px, py);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawUrbanWindows(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  accentColor: string,
  glowColor: string,
  rand: () => number
) {
  ctx.save();
  ctx.clip(path);
  const cols = 38;
  const rows = 44;
  const startY = H * 0.43;
  const cellW = W / cols;
  const cellH = (H * 0.34) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > 0.87) {
        const wx = c * cellW + 5;
        const wy = startY + r * cellH + 4;
        const warm = rand() > 0.35;
        ctx.fillStyle = hexToRgba(warm ? accentColor : glowColor, 0.28 + rand() * 0.55);
        ctx.fillRect(wx, wy, Math.max(4, cellW * 0.38), Math.max(5, cellH * 0.45));
      }
    }
  }
  ctx.restore();
}

export function renderWallpaperToDataUrl(blueprint: WallpaperBlueprint): string {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = mulberry32(blueprint.seed || 4219);
  const { palette, celestial, atmosphere } = blueprint;

  // 1. Multi-stop Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  const stops = palette.skyStops;
  skyGrad.addColorStop(0, stops[0]);
  skyGrad.addColorStop(0.32, stops[1]);
  skyGrad.addColorStop(0.62, stops[2]);
  skyGrad.addColorStop(1, stops[3]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Atmospheric Radial Bloom
  const bloomX = celestial.kind !== 'none' ? celestial.x * W : W * 0.52;
  const bloomY = celestial.kind !== 'none' ? celestial.y * H : H * 0.48;
  const bloom = ctx.createRadialGradient(bloomX, bloomY, 20, bloomX, bloomY, W * 0.95);
  bloom.addColorStop(0, hexToRgba(palette.glowColor, 0.38));
  bloom.addColorStop(0.45, hexToRgba(palette.accentColor, 0.14));
  bloom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // 3. Stars for night / celestial / starry scenes
  if (atmosphere.particleType === 'stars' || blueprint.sceneType === 'celestial') {
    const starCount = Math.floor(80 + atmosphere.particleDensity * 140);
    for (let i = 0; i < starCount; i++) {
      const sx = rand() * W;
      const sy = rand() * (H * 0.62);
      const sr = 0.7 + rand() * 2.1;
      const sa = 0.25 + rand() * 0.75;
      ctx.fillStyle = `rgba(255, 255, 255, ${sa})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Optional Aurora Ribbons
  if (atmosphere.aurora) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let band = 0; band < 3; band++) {
      const baseY = H * (0.18 + band * 0.08);
      const grad = ctx.createLinearGradient(0, baseY - 180, 0, baseY + 180);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, hexToRgba(band % 2 === 0 ? palette.glowColor : palette.accentColor, 0.28));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= W; x += 60) {
        const wave = Math.sin(x * 0.005 + band * 1.6 + rand() * 0.2) * 75;
        ctx.lineTo(x, baseY + wave);
      }
      ctx.lineTo(W, baseY + 220);
      ctx.lineTo(0, baseY + 220);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. Celestial Body (Sun / Moon / Crescent / Halo)
  if (celestial.kind !== 'none') {
    const cx = celestial.x * W;
    const cy = celestial.y * H;
    const cr = celestial.radius * W;

    const haloGrad = ctx.createRadialGradient(cx, cy, cr * 0.4, cx, cy, cr * 4.5);
    haloGrad.addColorStop(0, hexToRgba(celestial.color, 0.42 * celestial.haloStrength));
    haloGrad.addColorStop(0.4, hexToRgba(palette.glowColor, 0.18 * celestial.haloStrength));
    haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (celestial.kind === 'moon' || celestial.kind === 'sun') {
      const discGrad = ctx.createRadialGradient(cx - cr * 0.25, cy - cr * 0.25, cr * 0.1, cx, cy, cr);
      discGrad.addColorStop(0, '#FFFFFF');
      discGrad.addColorStop(0.55, celestial.color);
      discGrad.addColorStop(1, hexToRgba(celestial.color, 0.72));
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    } else if (celestial.kind === 'crescent') {
      const off = document.createElement('canvas');
      const d = Math.ceil(cr * 3);
      off.width = d;
      off.height = d;
      const octx = off.getContext('2d');
      if (octx) {
        octx.fillStyle = celestial.color;
        octx.beginPath();
        octx.arc(d / 2, d / 2, cr, 0, Math.PI * 2);
        octx.fill();
        octx.globalCompositeOperation = 'destination-out';
        octx.beginPath();
        octx.arc(d / 2 + cr * 0.42, d / 2 - cr * 0.2, cr * 0.88, 0, Math.PI * 2);
        octx.fill();
        ctx.drawImage(off, cx - d / 2, cy - d / 2);
      }
    }
  }

  // 6. Volumetric Sunbeams / Light Shafts
  if (atmosphere.sunbeams) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const originX = celestial.kind !== 'none' ? celestial.x * W : W * 0.3;
    const originY = celestial.kind !== 'none' ? celestial.y * H : H * 0.15;
    for (let i = 0; i < 6; i++) {
      const targetX = W * (0.1 + i * 0.18 + (rand() - 0.5) * 0.08);
      const beamWidth = 90 + rand() * 130;
      const beamGrad = ctx.createLinearGradient(originX, originY, targetX, H * 0.82);
      beamGrad.addColorStop(0, hexToRgba(palette.glowColor, 0.16));
      beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(originX - 24, originY);
      ctx.lineTo(originX + 24, originY);
      ctx.lineTo(targetX + beamWidth, H * 0.84);
      ctx.lineTo(targetX - beamWidth, H * 0.84);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 7. Clouds / Mist Ribbons
  for (const cloud of blueprint.clouds) {
    const cy = cloud.y * H;
    const ch = cloud.height * H;
    const cGrad = ctx.createLinearGradient(0, cy - ch, 0, cy + ch);
    cGrad.addColorStop(0, 'rgba(0,0,0,0)');
    cGrad.addColorStop(0.5, hexToRgba(cloud.tint, cloud.opacity));
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    for (let x = 0; x <= W; x += 90) {
      const offset = Math.sin(x * 0.006 + cloud.curveSeed) * (ch * 0.45);
      ctx.lineTo(x, cy + offset);
    }
    ctx.lineTo(W, cy + ch * 1.4);
    ctx.lineTo(0, cy + ch * 1.4);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Layered Vector Silhouettes
  const sortedSilhouettes = [...blueprint.silhouettes].sort((a, b) => a.depth - b.depth);
  let drewAnySilhouette = false;

  for (let i = 0; i < sortedSilhouettes.length; i++) {
    const layer = sortedSilhouettes[i];
    if (layer.svgPath && layer.svgPath.length > 10) {
      try {
        const p = new Path2D(layer.svgPath);
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = layer.color;
        ctx.fill(p);

        // Subtle atmospheric rim highlight along top edge of distant layer
        if (i === 0) {
          ctx.strokeStyle = hexToRgba(palette.glowColor, 0.22);
          ctx.lineWidth = 2;
          ctx.stroke(p);
        }
        ctx.restore();

        // Add subtle lit windows on urban buildings
        if (blueprint.sceneType === 'urban' && i <= 1) {
          drawUrbanWindows(ctx, p, palette.accentColor, palette.glowColor, rand);
        }
        drewAnySilhouette = true;
      } catch {
        // Fallback below if malformed path
      }
    }

    // Add soft mist band between depth layers
    if (atmosphere.fogOpacity > 0.08 && i < sortedSilhouettes.length - 1) {
      const mistY = H * (0.56 + i * 0.08);
      const mistGrad = ctx.createLinearGradient(0, mistY - 140, 0, mistY + 140);
      mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
      mistGrad.addColorStop(0.5, hexToRgba(palette.glowColor, atmosphere.fogOpacity * 0.42));
      mistGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, mistY - 140, W, 280);
    }
  }

  if (!drewAnySilhouette) {
    drawFallbackMountains(ctx, H * 0.62, 160, palette.silhouetteColors[0], 0.85, rand);
    drawFallbackMountains(ctx, H * 0.71, 140, palette.silhouetteColors[1], 0.95, rand);
  }

  // 9. Atmospheric Light Points (lamps, bokeh, windows, stars)
  for (const pt of blueprint.lights) {
    const lx = pt.x * W;
    const ly = pt.y * H;
    const r = pt.radius * 1.9;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (pt.kind === 'lamp') {
      const lampGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, r * 3.4);
      lampGrad.addColorStop(0, hexToRgba('#FFFFFF', pt.opacity));
      lampGrad.addColorStop(0.2, hexToRgba(pt.color, pt.opacity * 0.8));
      lampGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 3.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (pt.kind === 'bokeh') {
      const bGrad = ctx.createRadialGradient(lx, ly, r * 0.1, lx, ly, r * 1.45);
      bGrad.addColorStop(0, hexToRgba(pt.color, pt.opacity * 0.35));
      bGrad.addColorStop(0.8, hexToRgba(pt.color, pt.opacity * 0.65));
      bGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 1.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (pt.kind === 'window') {
      ctx.fillStyle = hexToRgba(pt.color, pt.opacity);
      ctx.fillRect(lx - r * 0.25, ly - r * 0.35, r * 0.5, r * 0.7);
    } else {
      ctx.fillStyle = hexToRgba(pt.color, pt.opacity);
      ctx.beginPath();
      ctx.arc(lx, ly, Math.max(2, r * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 10. Water / Wet Street Reflection Pass
  if (atmosphere.waterReflection) {
    const reflY = Math.floor(atmosphere.reflectionY * H);
    const reflH = H - reflY;
    if (reflH > 80) {
      const snap = document.createElement('canvas');
      snap.width = W;
      snap.height = reflY;
      const sctx = snap.getContext('2d');
      if (sctx) {
        sctx.drawImage(canvas, 0, 0, W, reflY, 0, 0, W, reflY);

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, reflY, W, reflH);
        ctx.clip();

        // Flipped mirror
        ctx.translate(0, reflY * 2);
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.58;
        ctx.drawImage(snap, 0, 0);
        ctx.restore();

        // Wet surface darkening gradient
        const wetGrad = ctx.createLinearGradient(0, reflY, 0, H);
        wetGrad.addColorStop(0, hexToRgba(palette.reflectionTint, 0.35));
        wetGrad.addColorStop(0.5, hexToRgba(palette.reflectionTint, 0.62));
        wetGrad.addColorStop(1, hexToRgba('#04060B', 0.86));
        ctx.fillStyle = wetGrad;
        ctx.fillRect(0, reflY, W, reflH);

        // Shimmering vertical light columns in water/wet asphalt
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (const pt of blueprint.lights) {
          if (pt.y < atmosphere.reflectionY) {
            const lx = pt.x * W;
            const colGrad = ctx.createLinearGradient(lx, reflY, lx, H);
            colGrad.addColorStop(0, hexToRgba(pt.color, pt.opacity * 0.45));
            colGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = colGrad;
            for (let sy = reflY + 6; sy < H - 30; sy += 14) {
              const wobble = (rand() - 0.5) * 18;
              const segW = pt.radius * (0.7 + ((sy - reflY) / reflH) * 1.4);
              ctx.fillRect(lx - segW / 2 + wobble, sy, segW, 4);
            }
          }
        }

        // Subtle horizon ripple lines
        for (let i = 0; i < 42; i++) {
          const ry = reflY + rand() * reflH;
          const rx = rand() * W;
          const rw = 40 + rand() * 190;
          ctx.fillStyle = hexToRgba(palette.glowColor, 0.05 + rand() * 0.09);
          ctx.fillRect(rx, ry, rw, 1.5);
        }
        ctx.restore();
      }
    }
  }

  // 11. Weather & Atmospheric Particles
  const density = atmosphere.particleDensity;
  if (atmosphere.particleType === 'rain') {
    ctx.save();
    const count = Math.floor(140 + density * 240);
    for (let i = 0; i < count; i++) {
      const rx = rand() * (W + 120) - 60;
      const ry = rand() * H;
      const len = 34 + rand() * 88;
      const alpha = 0.08 + rand() * 0.24;
      ctx.strokeStyle = hexToRgba('#E2E8F0', alpha);
      ctx.lineWidth = 1 + rand() * 1.3;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - len * 0.14, ry + len);
      ctx.stroke();
    }
    // Puddle ripple ellipses at bottom
    if (atmosphere.waterReflection) {
      const ripples = Math.floor(10 + density * 16);
      for (let i = 0; i < ripples; i++) {
        const px = rand() * W;
        const py = H * (atmosphere.reflectionY + 0.05) + rand() * (H * (0.95 - atmosphere.reflectionY));
        const pr = 12 + rand() * 34;
        ctx.strokeStyle = hexToRgba(palette.glowColor, 0.12 + rand() * 0.14);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  } else if (atmosphere.particleType === 'bokeh') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const count = Math.floor(14 + density * 24);
    for (let i = 0; i < count; i++) {
      const bx = rand() * W;
      const by = H * 0.25 + rand() * (H * 0.72);
      const br = 14 + rand() * 52;
      const col = rand() > 0.5 ? palette.accentColor : palette.glowColor;
      const bGrad = ctx.createRadialGradient(bx, by, 2, bx, by, br);
      bGrad.addColorStop(0, hexToRgba(col, 0.08));
      bGrad.addColorStop(0.82, hexToRgba(col, 0.22));
      bGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (
    atmosphere.particleType === 'snow' ||
    atmosphere.particleType === 'dust' ||
    atmosphere.particleType === 'fireflies' ||
    atmosphere.particleType === 'petals'
  ) {
    ctx.save();
    const count = Math.floor(45 + density * 110);
    for (let i = 0; i < count; i++) {
      const px = rand() * W;
      const py = rand() * H;
      const pr = 1.5 + rand() * 4.8;
      if (atmosphere.particleType === 'fireflies') {
        ctx.fillStyle = hexToRgba(palette.accentColor, 0.45 + rand() * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, pr * 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (atmosphere.particleType === 'petals') {
        ctx.fillStyle = hexToRgba(palette.accentColor, 0.45 + rand() * 0.4);
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 2.2, pr * 1.1, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + rand() * 0.55})`;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 12. Optical Vignette (keeps smartphone lockscreen clock readable)
  if (atmosphere.vignette > 0) {
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.45, W * 0.28, W * 0.5, H * 0.5, H * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(4, 6, 12, ${atmosphere.vignette})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  // 13. Subtle Photographic Film Grain
  if (atmosphere.grain > 0) {
    const grainCanvas = getGrainPatternCanvas();
    const pattern = ctx.createPattern(grainCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalAlpha = atmosphere.grain * 2.1;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  return canvas.toDataURL('image/png');
}

export function downloadWallpaperPng(dataUrl: string, title: string) {
  const safeName = title
    .replace(/[^\w가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${safeName || 'moodwall'}_9x16.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
