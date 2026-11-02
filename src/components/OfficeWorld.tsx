import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Agent,
  Direction,
  MapRenderMode,
  OfficeHotspot,
  Point,
  SpriteRenderMode,
  WeatherType,
} from '../types/office';
import { PixelCharacter } from './PixelCharacter';
import { OfficeTilemap } from './OfficeTilemap';
import {
  ALL_48_HD_ASSETS,
  OFFICE_25D_SURFACE_OCCLUDERS,
  OFFICE_32BIT_PROPS,
  OfficePropItem,
} from '../data/officePropsData';
import { findPath, isPointWalkable, isSegmentWalkable } from '../utils/pathfinding';
import { sound } from '../utils/audio';
import {
  Heart,
  Sparkles,
  Coffee,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LocateFixed,
  Layers,
  Box,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface OfficeWorldProps {
  playerPos: Point;
  playerFacing: Direction;
  playerIsMoving: boolean;
  playerCharacterId: string;
  agents: Agent[];
  hotspots: OfficeHotspot[];
  weather: WeatherType;
  spriteMode: SpriteRenderMode;
  mapMode: MapRenderMode;
  onToggleSpriteMode: () => void;
  onMovePlayer: (pos: Point, facing: Direction, isMoving: boolean) => void;
  onSelectAgent: (agentId: string) => void;
  onInteractHotspot: (hotspot: OfficeHotspot) => void;
  activeDialogueAgentId?: string | null;
}

export const OfficeWorld: React.FC<OfficeWorldProps> = ({
  playerPos,
  playerFacing,
  playerIsMoving,
  playerCharacterId,
  agents,
  hotspots,
  weather,
  spriteMode,
  mapMode,
  onToggleSpriteMode,
  onMovePlayer,
  onSelectAgent,
  onInteractHotspot,
  activeDialogueAgentId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const playerPathRef = useRef<Point[]>([]);
  const [waypoints, setWaypoints] = useState<Point[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hoveredHotspot, setHoveredHotspot] = useState<OfficeHotspot | null>(null);
  const [hoveredProp, setHoveredProp] = useState<OfficePropItem | null>(null);

  // 2.5D 32-Bit HD Prop Layering State
  const [enable32BitProps, setEnable32BitProps] = useState<boolean>(true);
  const [showAssetCatalog, setShowAssetCatalog] = useState<boolean>(false);
  const [customProps, setCustomProps] = useState<OfficePropItem[]>([]);
  const [placingAsset, setPlacingAsset] = useState<(typeof ALL_48_HD_ASSETS)[number] | null>(null);

  // Camera Zoom & Follow State
  const [zoom, setZoom] = useState<number>(1);
  const [followPlayer, setFollowPlayer] = useState<boolean>(false);

  const activeProps = useMemo(
    () => (enable32BitProps ? [...OFFICE_32BIT_PROPS, ...customProps] : []),
    [enable32BitProps, customProps]
  );

  // Keyboard navigation (WASD & Arrow keys) + A* Waypoint Queue Runner
  useEffect(() => {
    let animId: number;
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressed[key] = true;
        playerPathRef.current = [];
        setWaypoints([]);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keysPressed[key]) {
        delete keysPressed[key];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const stepLoop = () => {
      const activeKeys = Object.keys(keysPressed);
      if (activeKeys.length > 0) {
        let dx = 0;
        let dy = 0;
        let facing: Direction = playerFacing;

        if (keysPressed['w'] || keysPressed['arrowup']) {
          dy -= 0.42;
          facing = 'up';
        }
        if (keysPressed['s'] || keysPressed['arrowdown']) {
          dy += 0.42;
          facing = 'down';
        }
        if (keysPressed['a'] || keysPressed['arrowleft']) {
          dx -= 0.42;
          facing = 'left';
        }
        if (keysPressed['d'] || keysPressed['arrowright']) {
          dx += 0.42;
          facing = 'right';
        }

        if (dx !== 0 || dy !== 0) {
          const candidateX = Math.max(8, Math.min(87, playerPos.x + dx));
          const candidateY = Math.max(21, Math.min(78, playerPos.y + dy));
          const fullCandidate = { x: candidateX, y: candidateY };
          const xOnlyCandidate = { x: candidateX, y: playerPos.y };
          const yOnlyCandidate = { x: playerPos.x, y: candidateY };

          if (
            isPointWalkable(candidateX, candidateY) &&
            isSegmentWalkable(playerPos, fullCandidate)
          ) {
            onMovePlayer(fullCandidate, facing, true);
          } else if (
            dx !== 0 &&
            isPointWalkable(candidateX, playerPos.y) &&
            isSegmentWalkable(playerPos, xOnlyCandidate)
          ) {
            onMovePlayer(xOnlyCandidate, facing, true);
          } else if (
            dy !== 0 &&
            isPointWalkable(playerPos.x, candidateY) &&
            isSegmentWalkable(playerPos, yOnlyCandidate)
          ) {
            onMovePlayer(yOnlyCandidate, facing, true);
          } else {
            onMovePlayer(playerPos, facing, false);
          }
        }
      } else if (playerPathRef.current.length > 0) {
        const nextNode = playerPathRef.current[0];
        const dx = nextNode.x - playerPos.x;
        const dy = nextNode.y - playerPos.y;
        const dist = Math.hypot(dx, dy);

        let facing: Direction = playerFacing;
        if (Math.abs(dx) > Math.abs(dy)) {
          facing = dx > 0 ? 'right' : 'left';
        } else {
          facing = dy > 0 ? 'down' : 'up';
        }

        const speed = 0.52;
        if (dist <= speed) {
          if (isPointWalkable(nextNode.x, nextNode.y)) {
            playerPathRef.current.shift();
            setWaypoints([...playerPathRef.current]);
            const stillMoving = playerPathRef.current.length > 0;
            onMovePlayer({ x: nextNode.x, y: nextNode.y }, facing, stillMoving);
          } else {
            playerPathRef.current = [];
            setWaypoints([]);
            onMovePlayer(playerPos, facing, false);
          }
        } else {
          const stepPt = {
            x: Number((playerPos.x + (dx / dist) * speed).toFixed(2)),
            y: Number((playerPos.y + (dy / dist) * speed).toFixed(2)),
          };
          if (isPointWalkable(stepPt.x, stepPt.y) && isSegmentWalkable(playerPos, stepPt)) {
            onMovePlayer(stepPt, facing, true);
          } else {
            // Re-route around obstacle if blocked
            const finalGoal = playerPathRef.current[playerPathRef.current.length - 1];
            const newPath = findPath(playerPos, finalGoal);
            if (newPath.length > 0 && isSegmentWalkable(playerPos, newPath[0])) {
              playerPathRef.current = newPath;
              setWaypoints(newPath);
            } else {
              playerPathRef.current = [];
              setWaypoints([]);
              onMovePlayer(playerPos, facing, false);
            }
          }
        }
      } else if (playerIsMoving) {
        onMovePlayer(playerPos, playerFacing, false);
      }

      animId = requestAnimationFrame(stepLoop);
    };

    animId = requestAnimationFrame(stepLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, [playerPos, playerFacing, playerIsMoving, onMovePlayer]);

  // Mouse Wheel Zoom Handler
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => Number(Math.max(0.75, Math.min(2.0, prev + delta)).toFixed(2)));
  }, []);

  // Click-to-Move with A* Pathfinding (or Place Custom 32-Bit Asset)
  const handleClickWorld = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      // 0. If user is placing a 32-bit asset from the catalog, drop it centered at clickX, clickY!
      if (placingAsset) {
        sound.playClick();
        const widthPct = Number(((placingAsset.width * 0.16) / 12.64).toFixed(2));
        const heightPct = Number(((placingAsset.height * 0.16) / 8.43).toFixed(2));
        const newProp: OfficePropItem = {
          id: `custom-prop-${Date.now()}`,
          fileName: placingAsset.fileName,
          src: `/assets/office_props/${placingAsset.fileName}`,
          name: placingAsset.name,
          category: placingAsset.category,
          left: Number((clickX - widthPct / 2).toFixed(2)),
          top: Number((clickY - heightPct * 0.85).toFixed(2)),
          width: widthPct,
          height: heightPct,
          sortY: Number(clickY.toFixed(2)),
        };
        setCustomProps((prev) => [...prev, newProp]);
        setPlacingAsset(null);
        return;
      }

      // 1. Check if clicked near an AI Agent
      for (const agent of agents) {
        const dist = Math.hypot(agent.currentPos.x - clickX, agent.currentPos.y - clickY);
        if (dist < 4.5) {
          sound.playClick();
          onSelectAgent(agent.id);
          return;
        }
      }

      // 2. Check if clicked near a Hotspot
      for (const spot of hotspots) {
        const dist = Math.hypot(spot.x - clickX, spot.y - clickY);
        if (dist <= spot.radius) {
          sound.playClick();
          if (spot.category === 'cat') {
            sound.playPurr();
            const id = Date.now();
            setFloatingHearts((prev) => [...prev, { id, x: spot.x, y: spot.y - 4 }]);
            setTimeout(() => {
              setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
            }, 1300);
          }
          onInteractHotspot(spot);
          return;
        }
      }

      // 3. Calculate A* Path around walls and desks
      sound.playStep();
      const path = findPath(playerPos, { x: clickX, y: clickY });
      playerPathRef.current = path;
      setWaypoints(path);
    },
    [agents, hotspots, onInteractHotspot, onSelectAgent, placingAsset, playerPos]
  );

  const cameraTranslateX = followPlayer && zoom > 1 ? (50 - playerPos.x) * (zoom - 1) : 0;
  const cameraTranslateY = followPlayer && zoom > 1 ? (50 - playerPos.y) * (zoom - 1) : 0;

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-[#161925] flex items-center justify-center"
    >
      {/* Floating Camera, Sprite & 32-Bit HD Asset Layer Toolbar (Top-Left of Viewport) */}
      <div className="absolute top-3 left-3 z-40 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 shadow-xl">
        <button
          onClick={() => {
            sound.playClick();
            setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))));
          }}
          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono text-[11px] text-cyan-300 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => {
            sound.playClick();
            setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))));
          }}
          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setZoom(1);
            setFollowPlayer(false);
          }}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          title="Reset Kamera (100%)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        <button
          onClick={() => {
            sound.playClick();
            setFollowPlayer(!followPlayer);
            if (!followPlayer && zoom < 1.25) setZoom(1.3);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition ${
            followPlayer
              ? 'bg-blue-600/80 border-blue-400 text-white font-semibold'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Kamera mengikuti pergerakan pemain"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Follow</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onToggleSpriteMode();
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-200 text-[11px] font-medium transition whitespace-nowrap"
          title="Ganti gaya render karakter (Spritesheet HD vs Roster Asli vs Animasi 2D)"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {spriteMode === 'spritesheet_hd'
              ? 'Sprite: Spritesheet HD'
              : spriteMode === 'roster_transparent'
              ? 'Sprite: Roster Asli'
              : 'Sprite: Animasi 2D'}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setEnable32BitProps((prev) => !prev);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
            enable32BitProps
              ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/70 text-emerald-200'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-400'
          }`}
          title="Aktifkan/Nonaktifkan Layer Objek 32-Bit HD Terpisah (2.5D Depth Sorting)"
        >
          <Box className="w-3.5 h-3.5 text-emerald-400" />
          <span>Objek 32-Bit: {enable32BitProps ? 'ON (2.5D)' : 'OFF'}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setShowAssetCatalog((prev) => !prev);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
            showAssetCatalog
              ? 'bg-amber-600/90 border-amber-300 text-slate-950 font-bold'
              : 'bg-slate-800/90 hover:bg-slate-700 border-amber-500/50 text-amber-200'
          }`}
          title="Buka Katalog 48 Aset 32-Bit HD untuk menambah/melihat objek kantor"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>48 Aset HD</span>
        </button>
      </div>

      {/* Active Placement Mode Banner */}
      {placingAsset && (
        <div className="absolute top-14 left-3 z-40 flex items-center gap-2 bg-amber-500/95 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-amber-200 animate-pulse">
          <img
            src={`/assets/office_props/${placingAsset.fileName}`}
            alt={placingAsset.name}
            className="w-6 h-6 object-contain bg-slate-900/30 rounded p-0.5"
            style={{ imageRendering: 'pixelated' }}
          />
          <span>Klik di lantai kantor untuk menaruh: {placingAsset.name}</span>
          <button
            onClick={() => setPlacingAsset(null)}
            className="ml-1 p-0.5 bg-slate-900/20 hover:bg-slate-900/40 rounded text-slate-950"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 48 HD 32-Bit Assets Drawer / Inspector */}
      {showAssetCatalog && (
        <div className="absolute top-14 left-3 z-40 w-80 max-h-[72vh] bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/60 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                <span>Katalog 48 Aset HD 32-Bit (Transparan)</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Klik aset untuk menaruh objek 2.5D baru di kantor
              </p>
            </div>
            <button
              onClick={() => setShowAssetCatalog(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {customProps.length > 0 && (
            <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-emerald-300">{customProps.length} aset tambahan dipasang</span>
              <button
                onClick={() => setCustomProps([])}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset Tambahan</span>
              </button>
            </div>
          )}

          <div className="p-2.5 overflow-y-auto grid grid-cols-3 gap-2">
            {ALL_48_HD_ASSETS.filter((a) => a.category !== 'shell').map((asset) => (
              <button
                key={asset.fileName}
                onClick={() => {
                  sound.playClick();
                  setPlacingAsset(asset);
                  setShowAssetCatalog(false);
                }}
                className="flex flex-col items-center justify-between p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-400 transition group text-center"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-slate-950/50 rounded p-1 mb-1">
                  <img
                    src={`/assets/office_props/${asset.fileName}`}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <span className="text-[10px] text-slate-200 font-medium line-clamp-2 leading-tight">
                  {asset.name}
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono mt-0.5">
                  {asset.width}×{asset.height}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aspect Ratio Stage with Zoom & Pan Transform */}
      <div
        ref={mapContainerRef}
        onClick={handleClickWorld}
        className="relative w-full h-full max-w-[1536px] max-h-[1024px] aspect-[1.5/1] mx-auto shadow-2xl overflow-hidden rounded-xl cursor-pointer transition-transform duration-150 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${cameraTranslateX}%, ${cameraTranslateY}%)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Base Map Layer: Clean Pixel-Art Background OR 32-Bit HD Cutout Shell (01_ruangan_kantor_utama.png) */}
        {mapMode === 'reference_image' ? (
          <img
            src="/assets/aistudio/Pixel-Art_Office_Management_Sim_662085ab.png_db9e11ea.jpg"
            alt="Virtual Office Map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <OfficeTilemap />
        )}

        {/* ================= 2.5D Y-SORTED 32-BIT HD PROPS LAYER (1:1 OVERLAY / TIMPA) =================
            Each prop from 01_aset_hd_32bit_tanpa_pecah_6953a66a.zip is rendered at its exact
            pixel-matched bounding box (left%, top%, width%, height%) on top of the background
            with zIndex = 100 + Math.round(prop.sortY * 10).
            - Seats/Sofas/Chair-backs have sortY behind the sitting character so the character sits ON TOP OF (`di atas`) the seat!
            - Desks/Monitors/Tabletops/Trees have sortY in front of characters behind them so lower bodies are naturally occluded! */}
        {activeProps.map((prop) => {
          const zIdx = prop.isFloorMat ? 105 : 100 + Math.round(prop.sortY * 10);
          const isInteractive = Boolean(prop.hotspotCategory);

          return (
            <div
              key={prop.id}
              onMouseEnter={() => isInteractive && setHoveredProp(prop)}
              onMouseLeave={() => isInteractive && setHoveredProp(null)}
              onClick={(e) => {
                if (!prop.hotspotCategory) return;
                e.stopPropagation();
                sound.playClick();
                const centerX = prop.left + prop.width / 2;
                const centerY = prop.top + prop.height / 2;
                const matchingSpot =
                  hotspots.find((h) => h.category === prop.hotspotCategory) || {
                    id: prop.id,
                    name: prop.name,
                    x: centerX,
                    y: centerY,
                    radius: 6,
                    prompt: `Interaksi dengan ${prop.name}`,
                    category: prop.hotspotCategory,
                  };
                onInteractHotspot(matchingSpot);
              }}
              className={`absolute select-none ${
                isInteractive
                  ? 'cursor-pointer pointer-events-auto group'
                  : 'pointer-events-none'
              }`}
              style={{
                left: `${prop.left}%`,
                top: `${prop.top}%`,
                width: `${prop.width}%`,
                height: `${prop.height}%`,
                zIndex: zIdx,
                clipPath: prop.clipPath,
              }}
            >
              <img
                src={prop.src}
                alt={prop.name}
                className={`w-full h-full object-fill transition-transform duration-150 ${
                  isInteractive
                    ? 'group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.75)]'
                    : ''
                }`}
                style={{ imageRendering: 'pixelated' }}
              />

              {hoveredProp?.id === prop.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900/95 border border-emerald-400/80 px-2 py-0.5 rounded-md text-[10px] text-emerald-200 whitespace-nowrap shadow-xl z-50 pointer-events-none">
                  {prop.name}
                </div>
              )}
            </div>
          );
        })}

        {/* ================= 2.5D TABLETOP & GLASS PARTITION OCCLUDERS =================
            Covers ONLY the wooden tabletops & meeting glass wall (stopping above front-row chairs!)
            so characters sitting on back chairs have their lower body occluded by the table,
            while characters sitting on front chairs sit ON TOP OF (`di atas`) their chairs! */}
        {enable32BitProps &&
          mapMode === 'reference_image' &&
          OFFICE_25D_SURFACE_OCCLUDERS.map((occ) => {
            const topInset = occ.top;
            const rightInset = Number((100 - (occ.left + occ.width)).toFixed(2));
            const bottomInset = Number((100 - (occ.top + occ.height)).toFixed(2));
            const leftInset = occ.left;

            return (
              <img
                key={occ.id}
                src="/assets/aistudio/Pixel-Art_Office_Management_Sim_662085ab.png_db9e11ea.jpg"
                alt={occ.name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                style={{
                  imageRendering: 'pixelated',
                  clipPath: `inset(${topInset}% ${rightInset}% ${bottomInset}% ${leftInset}%)`,
                  zIndex: 100 + Math.round(occ.sortY * 10),
                }}
              />
            );
          })}

        {/* Cute Animated Pixel-Art Sleeping Cat on the Pet Bed (80.8%, 54.2%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
          style={{ left: '80.8%', top: '54.2%', zIndex: 100 + Math.round(54.2 * 10) }}
        >
          <div className="relative flex items-center justify-center animate-pulse">
            <div className="w-6 h-4 bg-[#fef3c7] border-2 border-[#78350f] rounded-full shadow-sm flex items-center justify-between px-1">
              <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full" />
              <div className="w-1.5 h-0.5 bg-[#78350f] rounded-full" />
            </div>
            <div className="absolute -top-1 left-1 w-1.5 h-1.5 bg-[#fef3c7] border-t border-l border-[#78350f] rotate-45" />
            <div className="absolute -top-1 left-3 w-1.5 h-1.5 bg-[#f59e0b] border-t border-r border-[#78350f] rotate-45" />
            <span className="absolute -top-3.5 -right-2 text-[9px] font-mono font-bold text-amber-200 drop-shadow">
              Zzz
            </span>
          </div>
        </div>

        {/* A* Pathfinding Breadcrumb Waypoints */}
        {waypoints.map((wp, idx) => (
          <div
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${wp.x}%`, top: `${wp.y}%`, zIndex: 115 }}
          >
            <div
              className={`rounded-full ${
                idx === waypoints.length - 1
                  ? 'w-3 h-3 bg-cyan-400/80 ring-4 ring-cyan-400/30 animate-ping'
                  : 'w-1.5 h-1.5 bg-cyan-300/60'
              }`}
            />
          </div>
        ))}

        {/* Interactive Hotspot Indicators */}
        {hotspots.map((spot) => (
          <div
            key={spot.id}
            onMouseEnter={() => setHoveredHotspot(spot)}
            onMouseLeave={() => setHoveredHotspot(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              zIndex: 100 + Math.round(spot.y * 10) + 5,
            }}
          >
            <div
              className={`rounded-full border transition-all duration-300 ${
                spot.category === 'cat'
                  ? 'border-pink-400/40 hover:border-pink-400 bg-pink-500/5 hover:bg-pink-500/25 w-11 h-11'
                  : spot.category === 'coffee'
                  ? 'border-amber-400/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/30 w-11 h-11'
                  : 'border-blue-400/30 hover:border-blue-400 bg-blue-500/5 hover:bg-blue-500/25 w-12 h-12'
              } flex items-center justify-center`}
            >
              {spot.category === 'cat' && (
                <span className="text-[11px] opacity-0 group-hover:opacity-100 group-hover:scale-125 transition">
                  🐾
                </span>
              )}
              {spot.category === 'coffee' && (
                <Coffee className="w-3.5 h-3.5 text-amber-300 opacity-70 group-hover:opacity-100 group-hover:scale-125 transition" />
              )}
              {spot.category === 'meeting' && (
                <Sparkles className="w-3.5 h-3.5 text-blue-300 opacity-70 group-hover:opacity-100 group-hover:scale-125 transition" />
              )}
            </div>

            {hoveredHotspot?.id === spot.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 border border-blue-400/80 px-2.5 py-1 rounded-lg text-[11px] text-white whitespace-nowrap shadow-xl z-50 pointer-events-none">
                <p className="font-bold text-cyan-300">{spot.name}</p>
                <p className="text-[10px] text-slate-300">{spot.prompt}</p>
              </div>
            )}
          </div>
        ))}

        {/* 15 AI Agents Sprite Layer (Y-sorted against 32-Bit HD Props & Tabletops via zIndex = 100 + Math.round(y * 10)) */}
        {agents.map((agent) => {
          const isSelected = activeDialogueAgentId === agent.id;
          const isWalking = Boolean(agent.path && agent.path.length > 0);
          const effectivePose = isWalking
            ? 'walking'
            : agent.pose || (agent.status === 'working' ? 'sitting_typing' : 'standing');
          const agentZIndex = 100 + Math.round(agent.currentPos.y * 10);

          return (
            <div
              key={agent.id}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onSelectAgent(agent.id);
              }}
              className="absolute -translate-x-1/2 -translate-y-[84%] cursor-pointer group"
              style={{
                left: `${agent.currentPos.x}%`,
                top: `${agent.currentPos.y}%`,
                zIndex: agentZIndex,
              }}
            >
              <div
                className={`transition-transform ${
                  isSelected
                    ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]'
                    : 'group-hover:scale-105'
                }`}
              >
                <PixelCharacter
                  cardIndex={agent.cardIndex}
                  direction={agent.facing}
                  pose={effectivePose}
                  size={50}
                  isMoving={isWalking}
                  spriteMode={spriteMode}
                />
              </div>
            </div>
          );
        })}

        {/* Player Avatar Sprite (Y-sorted against 32-Bit HD Props & Agents via zIndex = 100 + Math.round(y * 10)) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-[84%] pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            zIndex: 100 + Math.round(playerPos.y * 10) + 1,
          }}
        >
          <div className="drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]">
            <PixelCharacter
              cardIndex={parseInt(playerCharacterId, 10) - 1 || 0}
              direction={playerFacing}
              pose={playerIsMoving ? 'walking' : 'standing'}
              size={54}
              isMoving={playerIsMoving}
              spriteMode={spriteMode}
            />
          </div>
        </div>

        {/* Unoccluded Floating Name Tags & Speech Bubbles Layer (Always crisp above monitors/desks/trees) */}
        {agents.map((agent) => (
          <div
            key={`label-${agent.id}`}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onSelectAgent(agent.id);
            }}
            className="absolute -translate-x-1/2 cursor-pointer"
            style={{
              left: `${agent.currentPos.x}%`,
              top: `calc(${agent.currentPos.y}% - 58px)`,
              zIndex: 1120 + Math.round(agent.currentPos.y),
            }}
          >
            {agent.speechBubble ? (
              <div className="bg-slate-900/95 border border-cyan-400 px-2.5 py-1 rounded-xl text-[10px] text-white whitespace-nowrap shadow-xl animate-bounce">
                <span className="font-bold text-cyan-300 mr-1">{agent.name}:</span>
                <span>{agent.speechBubble}</span>
              </div>
            ) : (
              <div className="bg-slate-900/85 border border-slate-600/80 hover:border-cyan-400 px-1.5 py-0.5 rounded-md text-[9px] text-slate-200 flex items-center gap-1 whitespace-nowrap shadow-sm transition">
                <span>{agent.activityEmoji || '⭐'}</span>
                <span className="font-medium text-[9px]">{agent.name}</span>
              </div>
            )}
          </div>
        ))}

        {/* Player Floating Crown Label */}
        <div
          className="absolute -translate-x-1/2 pointer-events-none"
          style={{
            left: `${playerPos.x}%`,
            top: `calc(${playerPos.y}% - 64px)`,
            zIndex: 1180,
          }}
        >
          <div className="bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 whitespace-nowrap">
            <span>👑</span>
            <span>Anda</span>
          </div>
        </div>

        {/* Floating Heart Particles (when cat is petted) */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute -translate-x-1/2 pointer-events-none animate-bounce"
            style={{ left: `${heart.x}%`, top: `${heart.y}%`, zIndex: 1200 }}
          >
            <div className="flex items-center gap-1 bg-pink-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-pink-300">
              <Heart className="w-3 h-3 fill-pink-300 text-pink-300" />
              <span>+50 EXP Purr!</span>
            </div>
          </div>
        ))}

        {/* Weather FX Overlays (Above all 2.5D sorted layers) */}
        {weather === 'rainy' && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden bg-blue-950/20"
            style={{ zIndex: 1300 }}
          >
            <div className="rain-layer absolute inset-0 opacity-40 bg-[linear-gradient(135deg,rgba(147,197,253,0.5)_1px,transparent_1px)] bg-[size:16px_32px] animate-pulse" />
          </div>
        )}
        {weather === 'sunset' && (
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-orange-600/15 via-amber-500/10 to-indigo-900/15 mix-blend-color-burn"
            style={{ zIndex: 1300 }}
          >
            <div />
          </div>
        )}
        {weather === 'night' && (
          <div
            className="absolute inset-0 pointer-events-none bg-slate-950/45 mix-blend-multiply"
            style={{ zIndex: 1300 }}
          >
            <div className="absolute top-[35%] left-[25%] w-72 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-[20%] left-[60%] w-72 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};
