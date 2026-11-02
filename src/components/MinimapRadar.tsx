import React from 'react';
import { Map, Navigation } from 'lucide-react';
import { Agent } from '../types/office';
import { sound } from '../utils/audio';

interface MinimapRadarProps {
  playerPos: { x: number; y: number };
  agents: Agent[];
  onRoomClick?: (pos: { x: number; y: number }) => void;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  playerPos,
  agents,
  onRoomClick,
}) => {
  const rooms = [
    { name: 'Workstations', x: 28, y: 44, w: 22, h: 22 },
    { name: 'Meeting Room', x: 60, y: 25, w: 20, h: 18 },
    { name: 'Executive', x: 80, y: 27, w: 16, h: 18 },
    { name: 'Lounge', x: 68, y: 50, w: 24, h: 18 },
    { name: 'Pantry', x: 22, y: 72, w: 18, h: 18 },
    { name: 'Entrance', x: 50, y: 74, w: 18, h: 16 },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 text-white select-none shadow-2xl flex flex-col gap-1.5 w-44">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Map className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-xs tracking-wide text-slate-200">Office Map</span>
        </div>
        <Navigation className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      {/* Blueprint Radar Grid */}
      <div
        className="relative w-full h-28 bg-[#101726] border border-blue-500/40 rounded-xl overflow-hidden cursor-crosshair shadow-inner"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = ((e.clientX - rect.left) / rect.width) * 100;
          const clickY = ((e.clientY - rect.top) / rect.height) * 100;
          sound.playClick();
          if (onRoomClick) {
            onRoomClick({ x: Math.round(clickX), y: Math.round(clickY) });
          }
        }}
        title="Klik ruangan pada peta untuk berjalan ke sana"
      >
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:10px_10px]" />

        {/* Room partitions */}
        {rooms.map((room) => (
          <div
            key={room.name}
            className="absolute border border-blue-400/25 bg-blue-950/20 rounded hover:bg-blue-800/30 transition flex items-center justify-center pointer-events-none"
            style={{
              left: `${room.x - room.w / 2}%`,
              top: `${room.y - room.h / 2}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
            }}
          >
            <span className="text-[7px] text-blue-300/60 font-mono scale-90 whitespace-nowrap">
              {room.name.slice(0, 5)}
            </span>
          </div>
        ))}

        {/* Agent Dots */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              agent.status === 'meeting'
                ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                : agent.status === 'working'
                ? 'bg-amber-400'
                : 'bg-indigo-400'
            }`}
            style={{ left: `${agent.currentPos.x}%`, top: `${agent.currentPos.y}%` }}
            title={`${agent.name} (${agent.role})`}
          />
        ))}

        {/* Player Dot (Glowing Cyan with pulse) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10"
          style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3.5 h-3.5 bg-cyan-400/50 rounded-full animate-ping" />
            <span className="w-2.5 h-2.5 bg-cyan-300 rounded-full border border-white shadow-md shadow-cyan-400" />
          </div>
        </div>

        {/* Radar Scanner sweep line */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent h-6 w-full animate-pulse" />
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" /> Anda
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Agen
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Rapat
        </span>
      </div>
    </div>
  );
};
