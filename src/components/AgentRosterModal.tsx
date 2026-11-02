import React, { useState } from 'react';
import { Users, X, Check, Award, Cpu, Layers } from 'lucide-react';
import { Agent, AgentPose, SpriteRenderMode } from '../types/office';
import { PixelAvatar, PixelCharacter } from './PixelCharacter';
import { sound } from '../utils/audio';

interface AgentRosterModalProps {
  agents: Agent[];
  activePlayerId: string;
  spriteMode: SpriteRenderMode;
  onToggleSpriteMode: () => void;
  onSelectPlayer: (agentId: string) => void;
  onOpenAgentChat: (agentId: string) => void;
  onClose: () => void;
}

export const AgentRosterModal: React.FC<AgentRosterModalProps> = ({
  agents,
  activePlayerId,
  spriteMode,
  onToggleSpriteMode,
  onSelectPlayer,
  onOpenAgentChat,
  onClose,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(activePlayerId);
  const [previewPose, setPreviewPose] = useState<AgentPose>('walking');
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-indigo-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-indigo-300">
                Virtual Office Character Roster (15 AI Agents)
              </h3>
              <p className="text-[11px] text-slate-400">2D Top-Down Pixel Art &bull; Japanese Chibi Style</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onToggleSpriteMode();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-cyan-300 font-medium transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {spriteMode === 'spritesheet_hd'
                  ? 'Mode: Spritesheet HD'
                  : spriteMode === 'roster_transparent'
                  ? 'Mode: Roster Asli'
                  : 'Mode: Animasi 2D'}
              </span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Grid + Right Detail Card */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
          {/* 15 Agents Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-2.5 border-b md:border-b-0 md:border-r border-slate-800">
            {agents.map((agent) => {
              const isCurrent = agent.id === selectedAgentId;
              const isPlayer = agent.id === activePlayerId;
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedAgentId(agent.id);
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer relative ${
                    isCurrent
                      ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg'
                      : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isPlayer && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded-full shadow">
                      YOU
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-indigo-950/60 overflow-hidden flex items-center justify-center mb-1">
                    <PixelAvatar cardIndex={agent.cardIndex} size={44} spriteMode={spriteMode} />
                  </div>
                  <span className="font-bold text-xs text-slate-200 truncate w-full">
                    {agent.id}. {agent.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate w-full">
                    {agent.role.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Selected Agent Profile */}
          <div className="w-full md:w-80 p-5 bg-slate-900/80 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Turnaround Sprites 4 Directions + Pose Tester */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    4-Direction Preview
                  </span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'walking', label: 'Jalan' },
                        { id: 'sitting_typing', label: 'Ketik' },
                        { id: 'drinking_coffee', label: 'Kopi' },
                      ] as { id: AgentPose; label: string }[]
                    ).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          sound.playClick();
                          setPreviewPose(p.id);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded transition ${
                          previewPose === p.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 items-end justify-items-center">
                  <div className="flex flex-col items-center">
                    <PixelCharacter
                      cardIndex={selectedAgent.cardIndex}
                      direction="down"
                      pose={previewPose}
                      size={44}
                      spriteMode={spriteMode}
                    />
                    <span className="text-[8px] font-mono text-slate-400 mt-1">Front</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <PixelCharacter
                      cardIndex={selectedAgent.cardIndex}
                      direction="right"
                      pose={previewPose}
                      size={44}
                      spriteMode={spriteMode}
                    />
                    <span className="text-[8px] font-mono text-slate-400 mt-1">Right</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <PixelCharacter
                      cardIndex={selectedAgent.cardIndex}
                      direction="up"
                      pose={previewPose}
                      size={44}
                      spriteMode={spriteMode}
                    />
                    <span className="text-[8px] font-mono text-slate-400 mt-1">Back</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <PixelCharacter
                      cardIndex={selectedAgent.cardIndex}
                      direction="left"
                      pose={previewPose}
                      size={44}
                      spriteMode={spriteMode}
                    />
                    <span className="text-[8px] font-mono text-slate-400 mt-1">Left</span>
                  </div>
                </div>
              </div>

              {/* Title & Info */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    {selectedAgent.name}
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/50 text-indigo-200 border border-indigo-400">
                      #{selectedAgent.id}
                    </span>
                  </h4>
                  <span className="text-xs font-mono text-emerald-400">{selectedAgent.department}</span>
                </div>
                <p className="text-xs text-cyan-300 font-medium mt-0.5">{selectedAgent.role}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Kepribadian:</span>
                  <p className="mt-0.5 text-slate-200">{selectedAgent.personality}</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Spesialisasi:</span>
                  <p className="mt-0.5 text-slate-200">{selectedAgent.specialty}</p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="text-[9px] text-slate-400 block">Efisiensi</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedAgent.stats.efficiency}%</span>
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <span className="text-[9px] text-slate-400 block">Tugas Selesai</span>
                    <span className="font-mono text-amber-300 font-bold">{selectedAgent.stats.tasksDone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  sound.playFanfare();
                  onSelectPlayer(selectedAgent.id);
                  onClose();
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Pilih Sebagai Avatar Saya</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAgentChat(selectedAgent.id);
                  onClose();
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <span>Bicara dengan {selectedAgent.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
