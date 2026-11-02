import React, { useEffect, useRef } from 'react';
import { AgentPose, Direction, SpriteRenderMode } from '../types/office';

// Exact measured bounding boxes for all 15 characters x 4 directions (Front, Right, Back, Left)
// in /assets/aistudio/Virtual_Office_Pixel_Character_Roster_a9ebfb78.png (1536 x 1024)
interface SpriteSliceRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ROSTER_SPRITE_SLICES: SpriteSliceRect[][] = [
  // 01. RaffZell
  [
    { x: 37, y: 195, w: 78, h: 152 },
    { x: 112, y: 195, w: 70, h: 152 },
    { x: 179, y: 195, w: 72, h: 152 },
    { x: 248, y: 195, w: 56, h: 152 },
  ],
  // 02. Sora
  [
    { x: 343, y: 200, w: 77, h: 146 },
    { x: 419, y: 200, w: 61, h: 146 },
    { x: 479, y: 200, w: 65, h: 146 },
    { x: 545, y: 200, w: 65, h: 146 },
  ],
  // 03. Hana
  [
    { x: 649, y: 197, w: 80, h: 149 },
    { x: 726, y: 197, w: 62, h: 149 },
    { x: 787, y: 197, w: 72, h: 149 },
    { x: 856, y: 197, w: 56, h: 149 },
  ],
  // 04. Rina
  [
    { x: 949, y: 200, w: 81, h: 146 },
    { x: 1027, y: 200, w: 64, h: 146 },
    { x: 1094, y: 200, w: 60, h: 146 },
    { x: 1153, y: 200, w: 60, h: 146 },
  ],
  // 05. Kaito
  [
    { x: 1254, y: 196, w: 76, h: 150 },
    { x: 1327, y: 196, w: 63, h: 150 },
    { x: 1389, y: 196, w: 67, h: 150 },
    { x: 1456, y: 196, w: 61, h: 150 },
  ],
  // 06. Mei
  [
    { x: 35, y: 469, w: 78, h: 155 },
    { x: 110, y: 469, w: 69, h: 155 },
    { x: 179, y: 469, w: 70, h: 155 },
    { x: 250, y: 469, w: 54, h: 155 },
  ],
  // 07. Ren
  [
    { x: 343, y: 471, w: 78, h: 153 },
    { x: 418, y: 471, w: 66, h: 153 },
    { x: 481, y: 471, w: 68, h: 153 },
    { x: 546, y: 471, w: 64, h: 153 },
  ],
  // 08. Ayaka
  [
    { x: 645, y: 468, w: 72, h: 156 },
    { x: 714, y: 468, w: 72, h: 156 },
    { x: 787, y: 468, w: 68, h: 156 },
    { x: 857, y: 468, w: 55, h: 156 },
  ],
  // 09. Tsubasa
  [
    { x: 949, y: 470, w: 81, h: 154 },
    { x: 1027, y: 470, w: 66, h: 154 },
    { x: 1090, y: 470, w: 71, h: 154 },
    { x: 1158, y: 470, w: 56, h: 154 },
  ],
  // 10. Yui
  [
    { x: 1260, y: 475, w: 69, h: 149 },
    { x: 1329, y: 475, w: 63, h: 149 },
    { x: 1391, y: 475, w: 65, h: 149 },
    { x: 1457, y: 475, w: 60, h: 149 },
  ],
  // 11. Daichi
  [
    { x: 36, y: 751, w: 78, h: 162 },
    { x: 111, y: 751, w: 71, h: 162 },
    { x: 179, y: 751, w: 71, h: 162 },
    { x: 247, y: 751, w: 57, h: 162 },
  ],
  // 12. Miku
  [
    { x: 343, y: 759, w: 80, h: 154 },
    { x: 420, y: 759, w: 66, h: 154 },
    { x: 486, y: 759, w: 64, h: 154 },
    { x: 553, y: 759, w: 57, h: 154 },
  ],
  // 13. Natsuki
  [
    { x: 645, y: 747, w: 81, h: 171 },
    { x: 723, y: 747, w: 67, h: 171 },
    { x: 796, y: 747, w: 63, h: 171 },
    { x: 856, y: 747, w: 56, h: 171 },
  ],
  // 14. Haruto
  [
    { x: 949, y: 756, w: 81, h: 161 },
    { x: 1027, y: 756, w: 69, h: 161 },
    { x: 1093, y: 756, w: 67, h: 161 },
    { x: 1157, y: 756, w: 57, h: 161 },
  ],
  // 15. Aoi
  [
    { x: 1257, y: 763, w: 76, h: 154 },
    { x: 1332, y: 763, w: 62, h: 154 },
    { x: 1395, y: 763, w: 61, h: 154 },
    { x: 1458, y: 763, w: 59, h: 154 },
  ],
];

const DIR_INDEX_MAP: Record<Direction, number> = {
  down: 0,
  right: 1,
  up: 2,
  left: 3,
};

// Cache of individual extracted & flood-fill-cleaned sprite canvases (`cardIndex_dirIdx`)
const cleanedSliceCache = new Map<string, HTMLCanvasElement>();
let sourceRosterImg: HTMLImageElement | null = null;
let isLoaded = false;
const loadListeners = new Set<() => void>();

export function ensureRosterImageLoaded(onLoaded?: () => void): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;

  if (sourceRosterImg && isLoaded) {
    return sourceRosterImg;
  }

  if (!sourceRosterImg) {
    sourceRosterImg = new Image();
    sourceRosterImg.crossOrigin = 'anonymous';
    sourceRosterImg.src = '/assets/aistudio/Virtual_Office_Pixel_Character_Roster_a9ebfb78.png';
    sourceRosterImg.onload = () => {
      isLoaded = true;
      const pending = Array.from(loadListeners);
      loadListeners.clear();
      pending.forEach((fn) => fn());
    };
  }

  if (onLoaded && !isLoaded) {
    loadListeners.add(onLoaded);
  }

  return sourceRosterImg;
}

/**
 * Extracts a single character directional sprite from the roster image and uses
 * Border-Seeded BFS Flood-Fill so ONLY the exterior card background is made transparent.
 * All interior white shirts, lab coats, faces, and eye highlights inside the dark pixel
 * outline remain 100% solid and crisp!
 */
function getCleanedSpriteSlice(cardIndex: number, dirIdx: number): HTMLCanvasElement | null {
  const safeCard = Math.max(0, Math.min(ROSTER_SPRITE_SLICES.length - 1, cardIndex));
  const safeDir = Math.max(0, Math.min(3, dirIdx));
  const cacheKey = `${safeCard}_${safeDir}`;

  if (cleanedSliceCache.has(cacheKey)) {
    return cleanedSliceCache.get(cacheKey)!;
  }

  if (!sourceRosterImg || !isLoaded || sourceRosterImg.naturalWidth === 0) {
    return null;
  }

  const rect = ROSTER_SPRITE_SLICES[safeCard][safeDir];
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = rect.w;
  rawCanvas.height = rect.h;
  const ctx = rawCanvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sourceRosterImg, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

  const imgData = ctx.getImageData(0, 0, rect.w, rect.h);
  const data = imgData.data;
  const w = rect.w;
  const h = rect.h;

  // Card background is light lavender-white (~233, 232, 249)
  const isBgColor = (idx: number): boolean => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const lum = (r + g + b) / 3;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
    // Matches light card background or soft anti-aliased edge next to background
    return lum > 188 && sat < 0.22 && b >= r - 8;
  };

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  const enqueueIfBg = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const pIdx = y * w + x;
    if (visited[pIdx]) return;
    const rgbaIdx = pIdx * 4;
    if (isBgColor(rgbaIdx)) {
      visited[pIdx] = 1;
      queue.push(pIdx);
    }
  };

  // Seed BFS from all 4 outer borders of the slice
  for (let x = 0; x < w; x++) {
    enqueueIfBg(x, 0);
    enqueueIfBg(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueueIfBg(0, y);
    enqueueIfBg(w - 1, y);
  }

  // Also seed the small gap right between the character's shoes/legs near the bottom center
  const midX = Math.floor(w / 2);
  for (let y = Math.floor(h * 0.72); y < h; y++) {
    for (let dx = -4; dx <= 4; dx++) {
      enqueueIfBg(midX + dx, y);
    }
  }

  // Run 4-connected BFS Flood-Fill
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);
    const rgbaIdx = curr * 4;

    // Make exterior background pixel 100% transparent
    data[rgbaIdx + 3] = 0;

    enqueueIfBg(cx - 1, cy);
    enqueueIfBg(cx + 1, cy);
    enqueueIfBg(cx, cy - 1);
    enqueueIfBg(cx, cy + 1);
  }

  // Clean 1px halo fringe directly adjacent to transparent flood-filled background
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const pIdx = y * w + x;
      if (visited[pIdx]) continue;
      const rgbaIdx = pIdx * 4;
      const r = data[rgbaIdx];
      const g = data[rgbaIdx + 1];
      const b = data[rgbaIdx + 2];
      const lum = (r + g + b) / 3;
      if (lum > 175 && b > r) {
        const hasBgNeighbor =
          visited[pIdx - 1] || visited[pIdx + 1] || visited[pIdx - w] || visited[pIdx + w];
        if (hasBgNeighbor) {
          data[rgbaIdx + 3] = Math.min(data[rgbaIdx + 3], 70);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Trim transparent margins so every direction is tightly centered
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    cleanedSliceCache.set(cacheKey, rawCanvas);
    return rawCanvas;
  }

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimW;
  trimmedCanvas.height = trimH;
  const trimCtx = trimmedCanvas.getContext('2d');
  if (trimCtx) {
    trimCtx.imageSmoothingEnabled = false;
    trimCtx.drawImage(rawCanvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
  }

  cleanedSliceCache.set(cacheKey, trimmedCanvas);
  return trimmedCanvas;
}

// 15 Chibi Character Appearance Definitions (Fallback / Optional Mode B)
interface ChibiPalette {
  hair: string;
  hairShade: string;
  skin: string;
  eyes: string;
  top: string;
  topSecondary: string;
  tieOrAccent?: string;
  bottom: string;
  shoes: string;
  glasses?: boolean;
  headphones?: boolean;
  labCoat?: boolean;
  hoodie?: boolean;
  hairStyle: 'short' | 'long' | 'twintails' | 'twinbuns' | 'bob' | 'spiky' | 'ponytail';
  hairAccessory?: string;
}

const CHARACTER_PALETTES: ChibiPalette[] = [
  {
    hair: '#3b3141',
    hairShade: '#261f2b',
    skin: '#ffe4d0',
    eyes: '#3b4d71',
    top: '#f1f5f9',
    topSecondary: '#cbd5e1',
    tieOrAccent: '#1e3a8a',
    bottom: '#1e293b',
    shoes: '#0f172a',
    glasses: true,
    hairStyle: 'short',
  },
  {
    hair: '#4a3b47',
    hairShade: '#322630',
    skin: '#ffe6d4',
    eyes: '#4f46e5',
    top: '#312e81',
    topSecondary: '#f8fafc',
    tieOrAccent: '#f43f5e',
    bottom: '#1e293b',
    shoes: '#334155',
    hairStyle: 'long',
    hairAccessory: '#fb7185',
  },
  {
    hair: '#433540',
    hairShade: '#2b2129',
    skin: '#ffe6d4',
    eyes: '#3b82f6',
    top: '#1e293b',
    topSecondary: '#f8fafc',
    tieOrAccent: '#fbbf24',
    bottom: '#334155',
    shoes: '#1e293b',
    hairStyle: 'long',
    hairAccessory: '#fef08a',
  },
  {
    hair: '#7c6258',
    hairShade: '#59443c',
    skin: '#ffe5d1',
    eyes: '#6366f1',
    top: '#d6c7b8',
    topSecondary: '#334155',
    bottom: '#1e293b',
    shoes: '#27272a',
    hairStyle: 'ponytail',
  },
  {
    hair: '#332f3d',
    hairShade: '#1f1c26',
    skin: '#ffe2cc',
    eyes: '#2563eb',
    top: '#1d4ed8',
    topSecondary: '#1e293b',
    bottom: '#334155',
    shoes: '#0f172a',
    hoodie: true,
    hairStyle: 'short',
  },
  {
    hair: '#3f3444',
    hairShade: '#28202c',
    skin: '#ffe6d4',
    eyes: '#4338ca',
    top: '#f8fafc',
    topSecondary: '#312e81',
    tieOrAccent: '#38bdf8',
    bottom: '#1e293b',
    shoes: '#1e293b',
    glasses: true,
    labCoat: true,
    hairStyle: 'long',
  },
  {
    hair: '#4b3f4e',
    hairShade: '#2e2630',
    skin: '#ffe3ce',
    eyes: '#334155',
    top: '#1e293b',
    topSecondary: '#f8fafc',
    tieOrAccent: '#dc2626',
    bottom: '#0f172a',
    shoes: '#090d16',
    hairStyle: 'short',
  },
  {
    hair: '#3d3140',
    hairShade: '#251c27',
    skin: '#ffe6d5',
    eyes: '#2563eb',
    top: '#f8fafc',
    topSecondary: '#1e3a8a',
    tieOrAccent: '#38bdf8',
    bottom: '#1e3a8a',
    shoes: '#1e293b',
    hairStyle: 'twintails',
    hairAccessory: '#38bdf8',
  },
  {
    hair: '#3a343c',
    hairShade: '#231f24',
    skin: '#ffe2cc',
    eyes: '#3b82f6',
    top: '#475569',
    topSecondary: '#1e293b',
    tieOrAccent: '#2563eb',
    bottom: '#1e293b',
    shoes: '#0f172a',
    hoodie: true,
    hairStyle: 'spiky',
  },
  {
    hair: '#5a464c',
    hairShade: '#3d2e33',
    skin: '#ffe6d4',
    eyes: '#4f46e5',
    top: '#f1f5f9',
    topSecondary: '#334155',
    bottom: '#1e293b',
    shoes: '#1e293b',
    hairStyle: 'bob',
    hairAccessory: '#f472b6',
  },
  {
    hair: '#433840',
    hairShade: '#2a2228',
    skin: '#ffe1ca',
    eyes: '#1d4ed8',
    top: '#334155',
    topSecondary: '#f8fafc',
    tieOrAccent: '#475569',
    bottom: '#1e293b',
    shoes: '#0f172a',
    glasses: true,
    hairStyle: 'spiky',
  },
  {
    hair: '#3b3342',
    hairShade: '#241e29',
    skin: '#ffe6d5',
    eyes: '#06b6d4',
    top: '#1e293b',
    topSecondary: '#f8fafc',
    tieOrAccent: '#22d3ee',
    bottom: '#0f172a',
    shoes: '#1e293b',
    glasses: true,
    headphones: true,
    hairStyle: 'long',
  },
  {
    hair: '#85685a',
    hairShade: '#624b40',
    skin: '#ffe6d4',
    eyes: '#d97706',
    top: '#e7d8c5',
    topSecondary: '#f8fafc',
    tieOrAccent: '#92400e',
    bottom: '#1e293b',
    shoes: '#292524',
    hairStyle: 'twinbuns',
  },
  {
    hair: '#2d3142',
    hairShade: '#1b1e2b',
    skin: '#ffe3ce',
    eyes: '#2563eb',
    top: '#f8fafc',
    topSecondary: '#e2e8f0',
    tieOrAccent: '#2563eb',
    bottom: '#1e293b',
    shoes: '#0f172a',
    hairStyle: 'short',
  },
  {
    hair: '#2c3049',
    hairShade: '#191c2e',
    skin: '#ffe6d5',
    eyes: '#3b82f6',
    top: '#1e293b',
    topSecondary: '#f8fafc',
    tieOrAccent: '#3b82f6',
    bottom: '#0f172a',
    shoes: '#0f172a',
    hairStyle: 'long',
  },
];

function drawChibiPixelArt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cardIndex: number,
  direction: Direction,
  pose: AgentPose,
  tick: number,
  isAvatarOnly: boolean = false
) {
  const pal = CHARACTER_PALETTES[cardIndex % CHARACTER_PALETTES.length];
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;

  const gw = 24;
  const gh = isAvatarOnly ? 18 : 32;
  const px = w / gw;
  const py = h / gh;

  const rect = (x: number, y: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.floor(x * px),
      Math.floor(y * py),
      Math.ceil(rw * px),
      Math.ceil(rh * py)
    );
  };

  const isWalking = pose === 'walking';
  const isTyping = pose === 'sitting_typing';
  const isCoffee = pose === 'drinking_coffee';

  const walkCycle = isWalking ? Math.floor(tick / 6) % 4 : 0;
  const bobY = isWalking
    ? walkCycle % 2 === 1
      ? -1
      : 0
    : Math.floor(tick / 25) % 2 === 0
    ? 0
    : 0.4;

  const headY = (isAvatarOnly ? 2 : 3) + bobY;

  if (!isAvatarOnly) {
    rect(6, 29, 12, 2, 'rgba(15, 23, 42, 0.45)');
    rect(8, 30, 8, 1, 'rgba(15, 23, 42, 0.6)');
  }

  if (pal.hairStyle === 'long') {
    rect(5, headY + 6, 14, 9, pal.hairShade);
  } else if (pal.hairStyle === 'twintails' || pal.hairStyle === 'ponytail') {
    rect(3, headY + 5, 3, 9, pal.hairShade);
    rect(18, headY + 5, 3, 9, pal.hairShade);
    if (pal.hairAccessory) {
      rect(4, headY + 4, 2, 2, pal.hairAccessory);
      rect(18, headY + 4, 2, 2, pal.hairAccessory);
    }
  } else if (pal.hairStyle === 'twinbuns') {
    rect(4, headY - 2, 4, 4, pal.hair);
    rect(16, headY - 2, 4, 4, pal.hair);
  }

  if (!isAvatarOnly) {
    const bodyY = 16 + bobY;

    if (isTyping) {
      rect(8, 25, 3, 4, pal.bottom);
      rect(13, 25, 3, 4, pal.bottom);
      rect(8, 28, 3, 2, pal.shoes);
      rect(13, 28, 3, 2, pal.shoes);
    } else {
      const leftLegOffset = isWalking ? (walkCycle === 1 ? -1.5 : walkCycle === 3 ? 1 : 0) : 0;
      const rightLegOffset = isWalking ? (walkCycle === 3 ? -1.5 : walkCycle === 1 ? 1 : 0) : 0;

      rect(8, 24 + leftLegOffset, 3, 5, pal.bottom);
      rect(13, 24 + rightLegOffset, 3, 5, pal.bottom);
      rect(8, 28 + leftLegOffset, 3, 2, pal.shoes);
      rect(13, 28 + rightLegOffset, 3, 2, pal.shoes);
    }

    rect(6, bodyY, 12, 8, '#0f172a');
    rect(7, bodyY + 1, 10, 7, pal.top);

    if (direction !== 'up') {
      rect(10, bodyY + 1, 4, 5, pal.topSecondary);
      if (pal.tieOrAccent) {
        rect(11, bodyY + 2, 2, 4, pal.tieOrAccent);
      }
      if (pal.labCoat) {
        rect(7, bodyY + 1, 3, 9, '#f8fafc');
        rect(14, bodyY + 1, 3, 9, '#f8fafc');
      }
    } else {
      rect(7, bodyY + 1, 10, 7, pal.top);
      if (pal.hoodie) {
        rect(8, bodyY + 1, 8, 3, pal.hairShade);
      }
    }

    const armSwing = isWalking ? (walkCycle === 1 ? 1 : walkCycle === 3 ? -1 : 0) : 0;
    const typeLeft = isTyping ? (Math.floor(tick / 3) % 2 === 0 ? -1 : 0) : 0;
    const typeRight = isTyping ? (Math.floor(tick / 3) % 2 === 1 ? -1 : 0) : 0;

    rect(5, bodyY + 1 + armSwing + typeLeft, 2, 6, pal.top);
    rect(5, bodyY + 6 + armSwing + typeLeft, 2, 2, pal.skin);

    if (isCoffee) {
      rect(17, bodyY + 1, 2, 4, pal.top);
      rect(15, bodyY + 3, 3, 3, '#ffffff');
      rect(16, bodyY + 4, 2, 1, '#d97706');
      const steamOffset = Math.floor(tick / 8) % 3;
      rect(16, bodyY - steamOffset, 1, 1, 'rgba(255,255,255,0.85)');
      rect(17, bodyY - 1 - steamOffset, 1, 1, 'rgba(255,255,255,0.6)');
    } else {
      rect(17, bodyY + 1 - armSwing + typeRight, 2, 6, pal.top);
      rect(17, bodyY + 6 - armSwing + typeRight, 2, 2, pal.skin);
    }

    if (isTyping) {
      const bitStep = Math.floor(tick / 5) % 3;
      rect(6, bodyY + 2 - bitStep, 1.5, 1.5, '#38bdf8');
      rect(17, bodyY + 1 - ((bitStep + 1) % 3), 1.5, 1.5, '#34d399');
    }
  }

  rect(5, headY, 14, 13, '#1e1b2e');
  rect(6, headY + 1, 12, 11, pal.skin);

  rect(5, headY, 14, 5, pal.hair);
  rect(6, headY, 12, 2, pal.hairShade);

  if (direction === 'up') {
    rect(5, headY + 1, 14, 11, pal.hair);
    rect(6, headY + 8, 12, 4, pal.hairShade);
  } else {
    const shiftX = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;

    rect(5, headY + 3, 2, 8, pal.hair);
    rect(17, headY + 3, 2, 8, pal.hair);

    rect(7 + shiftX, headY + 3, 3, 3, pal.hair);
    rect(11 + shiftX, headY + 3, 3, 2, pal.hair);
    rect(15, headY + 3, 2, 3, pal.hair);

    const isBlinking = Math.floor(tick / 80) % 12 === 0;
    const eyeY = headY + 7;

    if (direction === 'down') {
      if (isBlinking) {
        rect(8, eyeY + 1, 2, 1, '#1e1b2e');
        rect(14, eyeY + 1, 2, 1, '#1e1b2e');
      } else {
        rect(8, eyeY, 2, 3, pal.eyes);
        rect(14, eyeY, 2, 3, pal.eyes);
        rect(8, eyeY, 1, 1, '#ffffff');
        rect(14, eyeY, 1, 1, '#ffffff');
      }
      rect(7, eyeY + 3, 1.5, 1, '#fda4af');
      rect(15.5, eyeY + 3, 1.5, 1, '#fda4af');
    } else if (direction === 'right') {
      if (isBlinking) {
        rect(14, eyeY + 1, 2, 1, '#1e1b2e');
      } else {
        rect(14, eyeY, 2, 3, pal.eyes);
        rect(15, eyeY, 1, 1, '#ffffff');
      }
    } else if (direction === 'left') {
      if (isBlinking) {
        rect(8, eyeY + 1, 2, 1, '#1e1b2e');
      } else {
        rect(8, eyeY, 2, 3, pal.eyes);
        rect(8, eyeY, 1, 1, '#ffffff');
      }
    }

    if (pal.glasses) {
      rect(7, eyeY - 0.5, 4, 3.5, 'rgba(30, 41, 59, 0.85)');
      rect(8, eyeY, 2, 2.5, 'rgba(186, 230, 253, 0.45)');
      rect(11, eyeY + 0.5, 2, 1, '#1e293b');
      rect(13, eyeY - 0.5, 4, 3.5, 'rgba(30, 41, 59, 0.85)');
      rect(14, eyeY, 2, 2.5, 'rgba(186, 230, 253, 0.45)');
    }
  }

  if (pal.headphones) {
    rect(4, headY + 1, 16, 1.5, '#94a3b8');
    rect(3, headY + 5, 2.5, 5, '#cbd5e1');
    rect(3.5, headY + 6, 1.5, 3, '#22d3ee');
    rect(18.5, headY + 5, 2.5, 5, '#cbd5e1');
    rect(19, headY + 6, 1.5, 3, '#22d3ee');
  }

  if (pal.hairAccessory && direction !== 'up') {
    rect(15, headY + 3, 2, 2, pal.hairAccessory);
  }
}

/**
 * Renders the authentic extracted Roster pixel-art sprite with:
 * - Aspect-ratio preserving centering
 * - 4-frame pixel-art leg-stepping walk animation
 * - Seated typing animation + pixel sparkles
 * - Coffee mug + steam pixel animation
 */
function drawRosterSpriteWithPixelAnimation(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  sliceCanvas: HTMLCanvasElement,
  pose: AgentPose,
  tick: number
) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = false;

  const sw = sliceCanvas.width;
  const sh = sliceCanvas.height;

  // Preserve original sprite aspect ratio inside the canvas (leaving room at bottom for shadow)
  const availW = cw - 4;
  const availH = ch - 6;
  const scale = Math.min(availW / sw, availH / sh);
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);
  const dx = Math.round((cw - dw) / 2);
  const baseDy = ch - dh - 3;

  // Ground pixel shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.48)';
  const shadowW = Math.round(dw * 0.68);
  const shadowX = Math.round((cw - shadowW) / 2);
  ctx.fillRect(shadowX, ch - 4, shadowW, 3);

  if (pose === 'walking') {
    // 4-phase retro RPG leg-stepping walk cycle
    const walkPhase = Math.floor(tick / 6) % 4;
    const bodyBob = walkPhase % 2 === 1 ? -2 : 0;

    // Split at 78% height (above feet/ankles)
    const splitSrcY = Math.floor(sh * 0.78);
    const legSrcH = sh - splitSrcY;
    const splitDestH = Math.round(dh * 0.78);
    const legDestH = dh - splitDestH;

    // 1. Draw upper body + head
    ctx.drawImage(
      sliceCanvas,
      0,
      0,
      sw,
      splitSrcY,
      dx,
      baseDy + bodyBob,
      dw,
      splitDestH
    );

    // 2. Draw Left & Right Legs with alternating pixel step lift
    const leftLift = walkPhase === 1 ? -3 : walkPhase === 3 ? 1 : 0;
    const rightLift = walkPhase === 3 ? -3 : walkPhase === 1 ? 1 : 0;
    const halfSrcW = Math.floor(sw / 2);
    const halfDestW = Math.floor(dw / 2);

    // Left foot/leg
    ctx.drawImage(
      sliceCanvas,
      0,
      splitSrcY,
      halfSrcW,
      legSrcH,
      dx,
      baseDy + splitDestH + leftLift,
      halfDestW,
      legDestH
    );
    // Right foot/leg
    ctx.drawImage(
      sliceCanvas,
      halfSrcW,
      splitSrcY,
      sw - halfSrcW,
      legSrcH,
      dx + halfDestW,
      baseDy + splitDestH + rightLift,
      dw - halfDestW,
      legDestH
    );
  } else if (pose === 'sitting_typing') {
    // Seated at desk: slightly lower stance + subtle 1px typing rhythm
    const typeBob = Math.floor(tick / 5) % 2 === 0 ? 0 : 1;
    const upperSrcH = Math.floor(sh * 0.86);
    const upperDestH = Math.round(dh * 0.86);

    ctx.drawImage(
      sliceCanvas,
      0,
      0,
      sw,
      upperSrcH,
      dx,
      baseDy + 4 + typeBob,
      dw,
      upperDestH
    );

    // Floating pixel code/typing sparkles
    const bitStep = Math.floor(tick / 6) % 3;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dx + 2, baseDy + Math.round(dh * 0.48) - bitStep * 3, 3, 3);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(dx + dw - 5, baseDy + Math.round(dh * 0.44) - ((bitStep + 1) % 3) * 3, 3, 3);
  } else {
    // Standing or Drinking Coffee: crisp idle breathing (1px slow bob)
    const idleBob = Math.floor(tick / 28) % 2 === 0 ? 0 : 1;
    ctx.drawImage(sliceCanvas, 0, 0, sw, sh, dx, baseDy + idleBob, dw, dh);

    if (pose === 'drinking_coffee') {
      // Crisp pixel-art coffee mug + rising steam
      const mugX = dx + Math.round(dw * 0.65);
      const mugY = baseDy + Math.round(dh * 0.56) + idleBob;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(mugX - 1, mugY - 1, 8, 9);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(mugX, mugY, 6, 7);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(mugX, mugY + 2, 6, 3);

      const steamY = mugY - 3 - (Math.floor(tick / 8) % 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(mugX + 2, steamY, 2, 2);
      ctx.fillRect(mugX + 4, steamY - 2, 2, 2);
    }
  }
}

// ============================================================================
// 15 CHARACTER HD SPRITESHEET ATLAS ENGINE (Virtual_Office_Spritesheets)
// Frame cell: 96x184 px, 6 columns x 16 rows, foot anchor at x=48, y=179
// ============================================================================
const SPRITESHEET_FILES: string[] = [
  '/assets/Virtual_Office_Spritesheets/spritesheets/01_RaffZell_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/02_Sora_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/03_Hana_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/04_Rina_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/05_Kaito_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/06_Mei_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/07_Ren_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/08_Ayaka_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/09_Tsubasa_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/10_Yui_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/11_Daichi_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/12_Miku_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/13_Natsuki_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/14_Haruto_spritesheet.png',
  '/assets/Virtual_Office_Spritesheets/spritesheets/15_Aoi_spritesheet.png',
];

const ATLAS_DIR_OFFSET: Record<Direction, number> = {
  down: 0,  // *_front
  up: 1,    // *_back
  right: 2, // *_right
  left: 3,  // *_left
};

const sheetImages = new Map<number, HTMLImageElement>();
const sheetLoaded = new Map<number, boolean>();
const sheetListeners = new Map<number, Set<() => void>>();
const cleanedAtlasFrameCache = new Map<string, HTMLCanvasElement>();

export function ensureCharacterSpritesheetLoaded(
  cardIndex: number,
  onLoaded?: () => void
): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  const safeCard = Math.max(0, Math.min(SPRITESHEET_FILES.length - 1, cardIndex));

  if (sheetImages.has(safeCard) && sheetLoaded.get(safeCard)) {
    return sheetImages.get(safeCard)!;
  }

  if (!sheetImages.has(safeCard)) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SPRITESHEET_FILES[safeCard];
    sheetImages.set(safeCard, img);
    sheetLoaded.set(safeCard, false);

    img.onload = () => {
      sheetLoaded.set(safeCard, true);
      const listeners = sheetListeners.get(safeCard);
      if (listeners) {
        const pending = Array.from(listeners);
        listeners.clear();
        pending.forEach((fn) => fn());
      }
    };
  }

  if (onLoaded && !sheetLoaded.get(safeCard)) {
    if (!sheetListeners.has(safeCard)) {
      sheetListeners.set(safeCard, new Set());
    }
    sheetListeners.get(safeCard)!.add(onLoaded);
  }

  return sheetImages.get(safeCard) || null;
}

/**
 * Extracts a single 96x184 frame from the character's 16-row spritesheet and performs:
 * 1. Border bleed removal (clears stray slice lines near cell borders x<5 or x>=91).
 * 2. 8-Connected Component Flood-Fill from the character's core torso/head so ANY stray
 *    disconnected pixel specks (like floating dots above Ren's hair or near Mei/Sora's arms)
 *    are 100% eliminated.
 * 3. Exterior halo de-fringing so outlines remain crisp against dark or wood office floors.
 * 4. Standardized tight bounding box crop (80x154 centered on x=48, foot at y=152) so
 *    multi-frame animations never jitter!
 */
function getCleanedSpritesheetFrame(
  cardIndex: number,
  rowIdx: number,
  colIdx: number
): HTMLCanvasElement | null {
  const safeCard = Math.max(0, Math.min(SPRITESHEET_FILES.length - 1, cardIndex));
  const safeRow = Math.max(0, Math.min(15, rowIdx));
  const safeCol = Math.max(0, Math.min(5, colIdx));
  const cacheKey = `${safeCard}_${safeRow}_${safeCol}`;

  if (cleanedAtlasFrameCache.has(cacheKey)) {
    return cleanedAtlasFrameCache.get(cacheKey)!;
  }

  const sheetImg = sheetImages.get(safeCard);
  if (!sheetImg || !sheetLoaded.get(safeCard) || sheetImg.naturalWidth === 0) {
    return null;
  }

  const fw = 96;
  const fh = 184;
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = fw;
  rawCanvas.height = fh;
  const ctx = rawCanvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheetImg, safeCol * fw, safeRow * fh, fw, fh, 0, 0, fw, fh);

  const imgData = ctx.getImageData(0, 0, fw, fh);
  const data = imgData.data;

  // 1. Clear outer frame cell border bleed (removes vertical slice artifacts on Mei, etc.)
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      if (x < 5 || x >= 91 || y < 16 || y >= 182) {
        data[(y * fw + x) * 4 + 3] = 0;
      }
    }
  }

  // 2. Keep ONLY the main 8-connected character silhouette (seeded from torso/head center)
  // This removes all isolated floating specks/dots anywhere in the 96x184 cell!
  const keepMask = new Uint8Array(fw * fh);
  const queue: number[] = [];

  for (let sy = 50; sy <= 165; sy += 3) {
    for (let sx = 40; sx <= 56; sx += 2) {
      const pIdx = sy * fw + sx;
      if (!keepMask[pIdx] && data[pIdx * 4 + 3] > 25) {
        keepMask[pIdx] = 1;
        queue.push(pIdx);
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % fw;
    const cy = Math.floor(curr / fw);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 5 && nx < 91 && ny >= 16 && ny < 182) {
          const nIdx = ny * fw + nx;
          if (!keepMask[nIdx] && data[nIdx * 4 + 3] > 20) {
            keepMask[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }
    }
  }

  // Erase any pixel not belonging to the main connected character component
  for (let i = 0; i < fw * fh; i++) {
    if (!keepMask[i]) {
      data[i * 4 + 3] = 0;
    }
  }

  // 3. Soften any residual light lavender card-background fringe on the outer 1px edge
  for (let y = 16; y < 181; y++) {
    for (let x = 5; x < 91; x++) {
      const pIdx = y * fw + x;
      if (!keepMask[pIdx]) continue;
      const rgbaIdx = pIdx * 4;
      const r = data[rgbaIdx];
      const g = data[rgbaIdx + 1];
      const b = data[rgbaIdx + 2];
      const lum = (r + g + b) / 3;
      if (lum > 182 && b >= r - 4) {
        const touchesEmpty =
          !keepMask[pIdx - 1] ||
          !keepMask[pIdx + 1] ||
          !keepMask[pIdx - fw] ||
          !keepMask[pIdx + fw];
        if (touchesEmpty) {
          data[rgbaIdx + 3] = Math.min(data[rgbaIdx + 3], 60);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 4. Standardized crop box (x: 8..88 -> 80px wide, y: 27..181 -> 154px tall)
  // Preserves exact horizontal center (x=48 -> 40) and foot baseline (y=179 -> 152)
  const cropX = 8;
  const cropY = 27;
  const cropW = 80;
  const cropH = 154;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  if (outCtx) {
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(rawCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  }

  cleanedAtlasFrameCache.set(cacheKey, outCanvas);
  return outCanvas;
}

/**
 * Renders the 15-character HD spritesheet frame with:
 * - Multi-frame atlas playback (walk: 4 frames @ 8fps, typing: 4 frames @ 6fps, coffee: 6 frames @ 5fps)
 * - Seated knee-tuck posture transformation for `sitting_typing` so characters genuinely sit on chairs/sofas
 * - Subtle 1px rhythmic upper-body breathing on static `idle` frames
 * - Rising pixel steam particles when drinking coffee
 */
function drawAtlasSpritesheetCharacter(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  cardIndex: number,
  direction: Direction,
  pose: AgentPose,
  tick: number
): boolean {
  const dirOffset = ATLAS_DIR_OFFSET[direction];
  let rowIdx = 0 + dirOffset;
  let colIdx = 0;

  if (pose === 'walking') {
    rowIdx = 4 + dirOffset;
    colIdx = Math.floor(tick / 7) % 4;
  } else if (pose === 'sitting_typing') {
    rowIdx = 8 + dirOffset;
    colIdx = Math.floor(tick / 9) % 4;
  } else if (pose === 'drinking_coffee') {
    rowIdx = 12 + dirOffset;
    colIdx = Math.floor(tick / 11) % 6;
  } else {
    rowIdx = 0 + dirOffset;
    colIdx = 0;
  }

  const frameCanvas = getCleanedSpritesheetFrame(cardIndex, rowIdx, colIdx);
  if (!frameCanvas) return false;

  ctx.clearRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = false;

  const sw = frameCanvas.width;  // 80
  const sh = frameCanvas.height; // 154

  const availW = cw - 2;
  const availH = ch - 5;
  const scale = Math.min(availW / sw, availH / sh);
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);
  const dx = Math.round((cw - dw) / 2);
  const baseDy = ch - dh - 3;

  // Ground / seat pixel shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  const shadowW = Math.round(dw * 0.62);
  const shadowX = Math.round((cw - shadowW) / 2);
  ctx.fillRect(shadowX, ch - 4, shadowW, 3);

  if (pose === 'sitting_typing') {
    // SEATED POSTURE SYNTHESIS:
    // Raw typing rows have straight standing legs. We lower the upper torso onto the chair seat,
    // foreshorten the thighs into a bent seated lap, and tuck the shoes underneath!
    const typeBob = Math.floor(tick / 6) % 2 === 0 ? 0 : 1;
    const seatDrop = Math.round(dh * 0.09);

    const hipSrcY = Math.floor(sh * 0.74);
    const kneeSrcY = Math.floor(sh * 0.89);
    const thighSrcH = kneeSrcY - hipSrcY;
    const footSrcH = sh - kneeSrcY;

    const upperDestH = Math.round(dh * 0.74);
    const bentThighDestH = Math.max(3, Math.round(dh * 0.07));
    const footDestH = Math.max(4, Math.round(dh * 0.09));

    const kneeShiftX = direction === 'right' ? 2 : direction === 'left' ? -2 : 0;

    // 1. Upper body, head & animated typing hands lowered onto the chair cushion
    ctx.drawImage(
      frameCanvas,
      0,
      0,
      sw,
      hipSrcY,
      dx,
      baseDy + seatDrop + typeBob,
      dw,
      upperDestH
    );

    // 2. Bent thighs/knees on the seat cushion
    ctx.drawImage(
      frameCanvas,
      0,
      hipSrcY,
      sw,
      thighSrcH,
      dx + kneeShiftX,
      baseDy + seatDrop + upperDestH,
      dw,
      bentThighDestH
    );

    // 3. Tucked shoes/feet resting at the base of the chair
    ctx.drawImage(
      frameCanvas,
      0,
      kneeSrcY,
      sw,
      footSrcH,
      dx + Math.round(kneeShiftX * 0.5),
      baseDy + seatDrop + upperDestH + bentThighDestH - 1,
      dw,
      footDestH
    );

    // Subtle floating pixel typing sparkles
    const bitStep = Math.floor(tick / 7) % 3;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dx + 4, baseDy + seatDrop + Math.round(dh * 0.48) - bitStep * 3, 2, 2);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(dx + dw - 6, baseDy + seatDrop + Math.round(dh * 0.44) - ((bitStep + 1) % 3) * 3, 2, 2);
  } else if (pose === 'standing') {
    // IDLE BREATHING: 1px gentle upper-torso breathing while shoes stay planted
    const idleBob = Math.floor(tick / 28) % 2 === 0 ? 0 : 1;
    const splitSrcY = Math.floor(sh * 0.78);
    const splitDestH = Math.round(dh * 0.78);

    // Planted legs & shoes
    ctx.drawImage(
      frameCanvas,
      0,
      splitSrcY,
      sw,
      sh - splitSrcY,
      dx,
      baseDy + splitDestH,
      dw,
      dh - splitDestH
    );
    // Breathing upper torso & head
    ctx.drawImage(
      frameCanvas,
      0,
      0,
      sw,
      splitSrcY,
      dx,
      baseDy + idleBob,
      dw,
      splitDestH
    );
  } else {
    // Walking (4 frames) or Drinking Coffee (6 frames) directly from cleaned atlas frame
    ctx.drawImage(frameCanvas, 0, 0, sw, sh, dx, baseDy, dw, dh);

    if (pose === 'drinking_coffee' && colIdx >= 1 && colIdx <= 4) {
      // Rising pixel coffee steam above the cup
      const steamBaseX =
        direction === 'left'
          ? dx + Math.round(dw * 0.28)
          : direction === 'right'
          ? dx + Math.round(dw * 0.68)
          : dx + Math.round(dw * 0.52);
      const steamBaseY = baseDy + Math.round(dh * 0.42) - (Math.floor(tick / 8) % 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(steamBaseX, steamBaseY, 2, 2);
      ctx.fillRect(steamBaseX + 2, steamBaseY - 3, 2, 2);
    }
  }

  return true;
}

interface PixelCharacterProps {
  cardIndex: number; // 0 to 14
  direction?: Direction;
  pose?: AgentPose;
  size?: number;
  isMoving?: boolean;
  spriteMode?: SpriteRenderMode;
  className?: string;
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  cardIndex,
  direction = 'down',
  pose = 'standing',
  size = 56,
  isMoving = false,
  spriteMode = 'spritesheet_hd',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    let tick = Math.floor(Math.random() * 40);
    let isCancelled = false;

    const effectivePose: AgentPose = isMoving ? 'walking' : pose;

    const handleLoaded = () => {
      if (!isCancelled) {
        render();
      }
    };

    const render = () => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      tick++;

      if (spriteMode === 'spritesheet_hd') {
        ensureCharacterSpritesheetLoaded(cardIndex, handleLoaded);
        const drawn = drawAtlasSpritesheetCharacter(
          ctx,
          canvas.width,
          canvas.height,
          cardIndex,
          direction,
          effectivePose,
          tick
        );
        if (!drawn) {
          // Fallback while spritesheet PNG loads
          ensureRosterImageLoaded(handleLoaded);
          const dirIdx = DIR_INDEX_MAP[direction];
          const sliceCanvas = getCleanedSpriteSlice(cardIndex, dirIdx);
          if (sliceCanvas) {
            drawRosterSpriteWithPixelAnimation(
              ctx,
              canvas.width,
              canvas.height,
              sliceCanvas,
              effectivePose,
              tick
            );
          } else {
            drawChibiPixelArt(
              ctx,
              canvas.width,
              canvas.height,
              cardIndex,
              direction,
              effectivePose,
              tick,
              false
            );
          }
        }
      } else if (spriteMode === 'roster_transparent') {
        ensureRosterImageLoaded(handleLoaded);
        const dirIdx = DIR_INDEX_MAP[direction];
        const sliceCanvas = getCleanedSpriteSlice(cardIndex, dirIdx);

        if (sliceCanvas) {
          drawRosterSpriteWithPixelAnimation(
            ctx,
            canvas.width,
            canvas.height,
            sliceCanvas,
            effectivePose,
            tick
          );
        } else {
          drawChibiPixelArt(
            ctx,
            canvas.width,
            canvas.height,
            cardIndex,
            direction,
            effectivePose,
            tick,
            false
          );
        }
      } else {
        drawChibiPixelArt(
          ctx,
          canvas.width,
          canvas.height,
          cardIndex,
          direction,
          effectivePose,
          tick,
          false
        );
      }

      if (!isCancelled) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      isCancelled = true;
      loadListeners.delete(handleLoaded);
      const safeCard = Math.max(0, Math.min(SPRITESHEET_FILES.length - 1, cardIndex));
      sheetListeners.get(safeCard)?.delete(handleLoaded);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cardIndex, direction, pose, isMoving, size, spriteMode]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 1.45)}
      className={`pixelated ${className}`}
      style={{
        imageRendering: 'pixelated',
        width: `${size}px`,
        height: `${Math.round(size * 1.45)}px`,
      }}
    />
  );
};

interface PixelAvatarProps {
  cardIndex: number;
  size?: number;
  spriteMode?: SpriteRenderMode;
  className?: string;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  cardIndex,
  size = 48,
  spriteMode = 'spritesheet_hd',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const handleLoaded = () => {
      if (!isCancelled) {
        render();
      }
    };

    const render = () => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (spriteMode === 'spritesheet_hd') {
        ensureCharacterSpritesheetLoaded(cardIndex, handleLoaded);
        const frameCanvas = getCleanedSpritesheetFrame(cardIndex, 0, 0);
        if (frameCanvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;
          const sw = frameCanvas.width;
          const sh = Math.round(frameCanvas.height * 0.62);
          const scale = Math.min(canvas.width / sw, canvas.height / sh);
          const dw = Math.round(sw * scale);
          const dh = Math.round(sh * scale);
          const dx = Math.round((canvas.width - dw) / 2);
          const dy = Math.round((canvas.height - dh) / 2) + 2;
          ctx.drawImage(frameCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
          return;
        }
      }

      if (spriteMode === 'roster_transparent' || spriteMode === 'spritesheet_hd') {
        ensureRosterImageLoaded(handleLoaded);
        const sliceCanvas = getCleanedSpriteSlice(cardIndex, 0);
        if (!sliceCanvas) {
          drawChibiPixelArt(ctx, canvas.width, canvas.height, cardIndex, 'down', 'standing', 10, true);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        const sw = sliceCanvas.width;
        const sh = Math.round(sliceCanvas.height * 0.62);
        const scale = Math.min(canvas.width / sw, canvas.height / sh);
        const dw = Math.round(sw * scale);
        const dh = Math.round(sh * scale);
        const dx = Math.round((canvas.width - dw) / 2);
        const dy = Math.round((canvas.height - dh) / 2) + 2;

        ctx.drawImage(sliceCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
      } else {
        drawChibiPixelArt(ctx, canvas.width, canvas.height, cardIndex, 'down', 'standing', 10, true);
      }
    };

    render();

    return () => {
      isCancelled = true;
      loadListeners.delete(handleLoaded);
      const safeCard = Math.max(0, Math.min(SPRITESHEET_FILES.length - 1, cardIndex));
      sheetListeners.get(safeCard)?.delete(handleLoaded);
    };
  }, [cardIndex, size, spriteMode]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pixelated ${className}`}
      style={{
        imageRendering: 'pixelated',
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

