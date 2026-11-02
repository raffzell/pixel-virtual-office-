import { Point } from '../types/office';

const GRID_W = 100;
const GRID_H = 68;

export interface ObstacleRect {
  id: string;
  label: string;
  x1: number; // percentage 0..100
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Exact architectural walls, glass partitions, and solid furniture cores mapped 1:1
 * against `Pixel-Art_Office_Management_Sim_662085ab.png_db9e11ea.jpg` (1264x843).
 *
 * Walkable doorways & chair seats are carefully preserved:
 * - Main Central Corridor: x = 43.5..55.0, y = 28.0..76.0
 * - Meeting Room Doorway (Bottom-Left Glass Gap): x = 50.0..53.2, y = 31.0..38.0
 * - Executive Room Doorway (via Hallway): x = 68.8..73.5, y = 27.5..33.5
 * - Pantry Doorway (Bottom-Left Room Right Entry): x = 34.5..43.8, y = 69.2..74.8
 * - Reception Doorway (Bottom-Right Room Left Entry): x = 54.5..62.5, y = 69.2..74.8
 */
export const OFFICE_OBSTACLES: ObstacleRect[] = [
  // ================= OUTER BUILDING WALLS =================
  { id: 'wall-top-main', label: 'Top Exterior Wall', x1: 0, y1: 0, x2: 100, y2: 20.5 },
  { id: 'wall-top-alcove', label: 'Top Bookshelf & Vending Wall', x1: 12.0, y1: 18.0, x2: 48.2, y2: 26.8 },
  { id: 'wall-left-upper', label: 'Upper Left Exterior Wall', x1: 0, y1: 0, x2: 13.8, y2: 57.5 },
  { id: 'wall-left-pantry', label: 'Lower Left Pantry Exterior Wall', x1: 0, y1: 56.0, x2: 7.5, y2: 100 },
  { id: 'wall-right-upper', label: 'Upper Right Exterior Wall', x1: 83.8, y1: 0, x2: 100, y2: 57.5 },
  { id: 'wall-right-reception', label: 'Lower Right Reception Exterior Wall', x1: 87.2, y1: 56.0, x2: 100, y2: 100 },
  { id: 'wall-bottom-left', label: 'Bottom Left Window Wall', x1: 0, y1: 76.8, x2: 43.2, y2: 100 },
  { id: 'wall-bottom-right', label: 'Bottom Right Window Wall', x1: 55.8, y1: 76.8, x2: 100, y2: 100 },
  { id: 'wall-bottom-entrance', label: 'Main Entrance Glass Doors', x1: 43.0, y1: 78.5, x2: 56.0, y2: 100 },

  // ================= MEETING ROOM WALLS & TABLE =================
  // Left glass wall of meeting room
  { id: 'meeting-glass-left', label: 'Meeting Glass Left', x1: 47.8, y1: 18.0, x2: 50.2, y2: 36.8 },
  // Bottom glass wall of meeting room (leaves doorway open at x = 50.2..53.4)
  { id: 'meeting-glass-bottom', label: 'Meeting Glass Bottom', x1: 53.4, y1: 33.4, x2: 68.6, y2: 37.2 },
  // Right wall of meeting room (separating meeting room from executive corridor)
  { id: 'meeting-wall-right', label: 'Meeting Right Wall', x1: 66.8, y1: 18.0, x2: 68.8, y2: 37.2 },
  // Conference table solid core (leaves top chairs at y=21.8 & bottom chairs at y=30.8 walkable)
  { id: 'meeting-table-core', label: 'Conference Table', x1: 52.6, y1: 23.0, x2: 65.8, y2: 28.8 },

  // ================= EXECUTIVE MANAGER ROOM WALLS & DESK =================
  // Left wall of executive office: upper segment (leaves doorway gap at y = 27.2..33.8)
  { id: 'exec-wall-left-top', label: 'Executive Left Wall Upper', x1: 71.2, y1: 18.0, x2: 73.2, y2: 27.2 },
  // Bottom wall of executive office + bookshelf
  { id: 'exec-wall-bottom', label: 'Executive Bottom Wall', x1: 71.5, y1: 36.2, x2: 85.0, y2: 40.5 },
  // Executive top bookshelf
  { id: 'exec-bookshelf', label: 'Executive Bookshelf', x1: 77.5, y1: 18.0, x2: 83.8, y2: 25.8 },
  // Executive manager desk front (leaves chair seat at x=78.0, y=28.0 walkable)
  { id: 'exec-desk-core', label: 'Executive Desk', x1: 74.2, y1: 29.2, x2: 82.4, y2: 35.2 },

  // ================= OPEN-OFFICE 4 WORKSTATION PODS =================
  // Pod 1 (Top-Left): leaves back chair (21.6, 34.8) & front chair (22.3, 41.2) walkable
  { id: 'desk-pod-tl', label: 'Workstation Pod 1', x1: 16.5, y1: 35.6, x2: 27.5, y2: 39.2 },
  // Pod 2 (Top-Right): leaves back chair (34.5, 34.8) & front chair (36.3, 41.2) walkable
  { id: 'desk-pod-tr', label: 'Workstation Pod 2', x1: 30.8, y1: 35.6, x2: 41.6, y2: 39.2 },
  // Pod 3 (Bottom-Left): leaves back chair (23.8, 48.2) & front chair (22.0, 54.8) walkable
  { id: 'desk-pod-bl', label: 'Workstation Pod 3', x1: 16.2, y1: 49.0, x2: 27.5, y2: 52.8 },
  // Pod 4 (Bottom-Right): leaves back chair (33.8, 48.2) & front chair (36.2, 54.8) walkable
  { id: 'desk-pod-br', label: 'Workstation Pod 4', x1: 30.8, y1: 49.0, x2: 41.8, y2: 52.8 },

  // ================= STAFF LOUNGE OBSTACLES =================
  // Left sofa backrest (leaves seat at x=59.4, y=47.6 walkable)
  { id: 'lounge-sofa-l-back', label: 'Lounge Sofa Left Back', x1: 56.2, y1: 43.5, x2: 62.5, y2: 46.2 },
  // Right sofa backrest (leaves seat at x=68.1, y=47.4 walkable)
  { id: 'lounge-sofa-r-back', label: 'Lounge Sofa Right Back', x1: 65.0, y1: 43.3, x2: 71.3, y2: 46.0 },
  // Lounge coffee table & right armchair
  { id: 'lounge-coffee-table', label: 'Lounge Coffee Table', x1: 58.5, y1: 51.5, x2: 71.8, y2: 56.2 },
  // Lounge right bookshelf & water dispenser
  { id: 'lounge-bookshelf', label: 'Lounge Bookshelf', x1: 75.0, y1: 40.5, x2: 83.8, y2: 50.5 },

  // ================= PANTRY / CAFE ROOM (BOTTOM LEFT) =================
  // Solid Top Wall + Kitchen Counters + Fridge + Coffee Machines (NO walking through this wall!)
  { id: 'pantry-top-wall-and-counters', label: 'Pantry Top Wall & Kitchen', x1: 6.5, y1: 56.8, x2: 37.2, y2: 67.8 },
  // Pantry Entrance Right Partition & Glass (above doorway gap y = 69.0..74.8)
  { id: 'pantry-right-wall-upper', label: 'Pantry Right Partition', x1: 35.5, y1: 56.8, x2: 43.2, y2: 68.8 },
  // Pantry Entrance Lower Pillar (below doorway gap y = 69.0..74.8)
  { id: 'pantry-right-wall-lower', label: 'Pantry Lower Pillar', x1: 35.5, y1: 75.0, x2: 43.2, y2: 80.0 },
  // Pantry Cafe Round Table solid center (leaves Sora's chair at x=20.1, y=73.2 walkable)
  { id: 'pantry-cafe-table', label: 'Pantry Round Table', x1: 12.2, y1: 71.5, x2: 17.5, y2: 76.2 },

  // ================= RECEPTION / GALLERY ROOM (BOTTOM RIGHT) =================
  // Solid Top Wall + Cabinets + Water Dispenser (NO walking through this wall!)
  { id: 'reception-top-wall', label: 'Reception Top Wall & Cabinets', x1: 60.2, y1: 56.8, x2: 88.5, y2: 68.5 },
  // Reception Left Partition & Glass (above doorway gap y = 69.0..74.8)
  { id: 'reception-left-wall-upper', label: 'Reception Left Partition', x1: 54.8, y1: 56.8, x2: 61.5, y2: 68.8 },
  // Reception Lower Pillar (below doorway gap y = 69.0..74.8)
  { id: 'reception-left-wall-lower', label: 'Reception Lower Pillar', x1: 54.8, y1: 75.0, x2: 61.5, y2: 80.0 },
];

export function isPointWalkable(xPercent: number, yPercent: number): boolean {
  if (xPercent < 7.8 || xPercent > 87.0 || yPercent < 20.6 || yPercent > 78.2) {
    return false;
  }
  for (let i = 0; i < OFFICE_OBSTACLES.length; i++) {
    const obs = OFFICE_OBSTACLES[i];
    if (xPercent >= obs.x1 && xPercent <= obs.x2 && yPercent >= obs.y1 && yPercent <= obs.y2) {
      return false;
    }
  }
  return true;
}

/**
 * Continuous raycast check along the straight line segment from `p1` to `p2`.
 * Ensures neither path smoothing nor per-frame movement ever clips across a wall corner.
 */
export function isSegmentWalkable(p1: Point, p2: Point): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.01) return isPointWalkable(p2.x, p2.y);

  const steps = Math.max(2, Math.ceil(dist / 0.35));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = p1.x + dx * t;
    const y = p1.y + dy * t;
    if (!isPointWalkable(x, y)) {
      return false;
    }
  }
  return true;
}

function toGrid(pt: Point): { gx: number; gy: number } {
  const gx = Math.max(0, Math.min(GRID_W - 1, Math.round((pt.x / 100) * GRID_W)));
  const gy = Math.max(0, Math.min(GRID_H - 1, Math.round((pt.y / 100) * GRID_H)));
  return { gx, gy };
}

function toPercent(gx: number, gy: number): Point {
  return {
    x: Number(((gx / GRID_W) * 100).toFixed(2)),
    y: Number(((gy / GRID_H) * 100).toFixed(2)),
  };
}

// Find nearest walkable grid cell if start or target is inside a wall/table
function findNearestWalkableCell(gx: number, gy: number): { gx: number; gy: number } {
  const p = toPercent(gx, gy);
  if (isPointWalkable(p.x, p.y)) return { gx, gy };

  let bestCell = { gx, gy };
  let bestDist = Infinity;

  for (let radius = 1; radius <= 18; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          const np = toPercent(nx, ny);
          if (isPointWalkable(np.x, np.y)) {
            const d = Math.hypot(dx, dy);
            if (d < bestDist) {
              bestDist = d;
              bestCell = { gx: nx, gy: ny };
            }
          }
        }
      }
    }
    if (bestDist < Infinity) return bestCell;
  }
  return bestCell;
}

interface AStarNode {
  gx: number;
  gy: number;
  g: number;
  h: number;
  f: number;
  parent?: AStarNode;
}

export function findPath(start: Point, goal: Point): Point[] {
  // If goal is directly reachable in a straight line with zero obstacles, still use intermediate waypoints if far
  const rawStart = toGrid(start);
  const rawGoal = toGrid(goal);
  const startCell = findNearestWalkableCell(rawStart.gx, rawStart.gy);
  const goalCell = findNearestWalkableCell(rawGoal.gx, rawGoal.gy);

  const exactGoalPt = isPointWalkable(goal.x, goal.y)
    ? { x: Number(goal.x.toFixed(2)), y: Number(goal.y.toFixed(2)) }
    : toPercent(goalCell.gx, goalCell.gy);

  if (startCell.gx === goalCell.gx && startCell.gy === goalCell.gy) {
    return isSegmentWalkable(start, exactGoalPt) ? [exactGoalPt] : [];
  }

  const openList: AStarNode[] = [];
  const closedSet = new Uint8Array(GRID_W * GRID_H);
  const gScoreMap = new Float32Array(GRID_W * GRID_H);
  gScoreMap.fill(Infinity);

  const startIdx = startCell.gy * GRID_W + startCell.gx;
  gScoreMap[startIdx] = 0;

  const startNode: AStarNode = {
    gx: startCell.gx,
    gy: startCell.gy,
    g: 0,
    h: Math.hypot(goalCell.gx - startCell.gx, goalCell.gy - startCell.gy),
    f: 0,
  };
  startNode.f = startNode.g + startNode.h;
  openList.push(startNode);

  const dirs = [
    { dx: 0, dy: -1, cost: 1 },
    { dx: 1, dy: 0, cost: 1 },
    { dx: 0, dy: 1, cost: 1 },
    { dx: -1, dy: 0, cost: 1 },
    { dx: 1, dy: -1, cost: 1.414 },
    { dx: 1, dy: 1, cost: 1.414 },
    { dx: -1, dy: 1, cost: 1.414 },
    { dx: -1, dy: -1, cost: 1.414 },
  ];

  let iterations = 0;
  let reachedNode: AStarNode | null = null;
  let closestNode: AStarNode = startNode;

  while (openList.length > 0 && iterations < 8000) {
    iterations++;
    // Pop node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }
    const current = openList[bestIdx];
    openList[bestIdx] = openList[openList.length - 1];
    openList.pop();

    const cIdx = current.gy * GRID_W + current.gx;
    if (closedSet[cIdx]) continue;
    closedSet[cIdx] = 1;

    if (current.h < closestNode.h) {
      closestNode = current;
    }

    if (current.gx === goalCell.gx && current.gy === goalCell.gy) {
      reachedNode = current;
      break;
    }

    const currentPt = toPercent(current.gx, current.gy);

    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i];
      const nx = current.gx + d.dx;
      const ny = current.gy + d.dy;
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;

      const nIdx = ny * GRID_W + nx;
      if (closedSet[nIdx]) continue;

      const pct = toPercent(nx, ny);
      if (!isPointWalkable(pct.x, pct.y)) continue;

      // Prevent cutting diagonal corners or jumping across thin walls
      if (!isSegmentWalkable(currentPt, pct)) continue;

      const tentativeG = current.g + d.cost;
      if (tentativeG < gScoreMap[nIdx]) {
        gScoreMap[nIdx] = tentativeG;
        const hScore = Math.hypot(goalCell.gx - nx, goalCell.gy - ny);
        openList.push({
          gx: nx,
          gy: ny,
          g: tentativeG,
          h: hScore,
          f: tentativeG + hScore,
          parent: current,
        });
      }
    }
  }

  const targetNode = reachedNode || closestNode;
  const rawPath: Point[] = [];
  let curr: AStarNode | undefined = targetNode;
  while (curr) {
    rawPath.unshift(toPercent(curr.gx, curr.gy));
    curr = curr.parent;
  }

  if (rawPath.length > 1) {
    rawPath.shift();
  }

  if (reachedNode && rawPath.length > 0) {
    rawPath[rawPath.length - 1] = exactGoalPt;
  }

  // Smooth path via line-of-sight string-pulling while keeping intermediate waypoints (~3.5% apart)
  // so characters walk naturally around corners without ever clipping through walls
  if (rawPath.length <= 2) {
    return rawPath;
  }

  const smoothed: Point[] = [];
  let anchor = isPointWalkable(start.x, start.y) ? start : rawPath[0];
  let idx = 0;

  while (idx < rawPath.length) {
    let furthest = idx;
    for (let probe = idx + 1; probe < rawPath.length; probe++) {
      const dist = Math.hypot(rawPath[probe].x - anchor.x, rawPath[probe].y - anchor.y);
      if (dist <= 4.5 && isSegmentWalkable(anchor, rawPath[probe])) {
        furthest = probe;
      } else if (!isSegmentWalkable(anchor, rawPath[probe])) {
        break;
      }
    }
    smoothed.push(rawPath[furthest]);
    anchor = rawPath[furthest];
    idx = furthest + 1;
  }

  return smoothed;
}
