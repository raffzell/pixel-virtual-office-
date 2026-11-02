import React, { useState } from 'react';
import { Users, X, Play, Sparkles, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Agent, MeetingTurn } from '../types/office';
import { PixelAvatar } from './PixelCharacter';
import { sound } from '../utils/audio';

interface MeetingRoomModalProps {
  agents: Agent[];
  onClose: () => void;
  onCompleteMeeting?: () => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  agents,
  onClose,
  onCompleteMeeting,
}) => {
  const [topic, setTopic] = useState('Optimasi Performa & Rilis Fitur Hermes 2D RPG');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['01', '06', '02', '05']);
  const [turns, setTurns] = useState<MeetingTurn[]>([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [isMeetingRunning, setIsMeetingRunning] = useState(false);
  const [userChimeIn, setUserChimeIn] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const toggleParticipant = (id: string) => {
    sound.playClick();
    if (selectedAgentIds.includes(id)) {
      if (selectedAgentIds.length > 2) {
        setSelectedAgentIds(selectedAgentIds.filter((a) => a !== id));
      }
    } else {
      setSelectedAgentIds([...selectedAgentIds, id]);
    }
  };

  const startMeeting = async () => {
    sound.playMeetingBell();
    setIsMeetingRunning(true);
    setIsComplete(false);
    setTurns([]);
    setCurrentTurnIdx(0);

    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          participants: selectedAgentIds,
        }),
      });
      const data = await res.json();
      if (data.turns && data.turns.length > 0) {
        setTurns(data.turns);
        // Animate turns
        let idx = 0;
        const interval = setInterval(() => {
          idx++;
          if (idx <= data.turns.length) {
            setCurrentTurnIdx(idx);
            sound.playTextBlip();
          } else {
            clearInterval(interval);
            setIsComplete(true);
            sound.playFanfare();
            if (onCompleteMeeting) onCompleteMeeting();
          }
        }, 2200);
      }
    } catch {
      // Fallback turns
      const fallback = [
        { speaker: 'RaffZell', id: '01', dialogue: `Selamat pagi tim. Mari kita bahas roadmap "${topic}".` },
        { speaker: 'Mei', id: '06', dialogue: 'Dari evaluasi teknis, kita perlu optimasi pipeline rendering canvas agar frame time konsisten di 60fps.' },
        { speaker: 'Sora', id: '02', dialogue: 'Untuk UX, saya sudah rancang dialog box dengan typewriter audio retro yang sangat imersif.' },
        { speaker: 'Kaito', id: '05', dialogue: 'Server API sudah stabil dan siap menangani multi-agent event loop tanpa spike latency.' },
        { speaker: 'RaffZell', id: '01', dialogue: 'Bagus sekali! Konsensus tercapai. Action items langsung dimasukkan ke sprint board.' },
      ];
      setTurns(fallback);
      setCurrentTurnIdx(fallback.length);
      setIsComplete(true);
      sound.playFanfare();
      if (onCompleteMeeting) onCompleteMeeting();
    }
  };

  const handleChimeIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChimeIn.trim()) return;
    sound.playClick();
    const newTurn: MeetingTurn = {
      speaker: 'Anda (Manager)',
      id: '01',
      dialogue: userChimeIn.trim(),
    };
    setTurns((prev) => [...prev, newTurn]);
    setCurrentTurnIdx((prev) => prev + 1);
    setUserChimeIn('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-emerald-300">
                Ruang Rapat Konferensi (A2A Multi-Agent Meeting)
              </h3>
              <p className="text-[11px] text-slate-400">Kolaborasi otonom antar-agen AI dengan sintesis konsensus</p>
            </div>
          </div>

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

        {/* Meeting Setup Area */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Agenda:</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isMeetingRunning && !isComplete}
              placeholder="Masukkan topik pembahasan rapat..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={startMeeting}
              disabled={isMeetingRunning && !isComplete}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isMeetingRunning ? 'Mulai Ulang' : 'Mulai Rapat'}</span>
            </button>
          </div>

          {/* Participant Selector */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Peserta:</span>
            {agents.slice(0, 10).map((agent) => {
              const isSelected = selectedAgentIds.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleParticipant(agent.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-4 h-4 rounded overflow-hidden">
                    <PixelAvatar cardIndex={agent.cardIndex} size={16} />
                  </div>
                  <span>{agent.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting Discussion Turns Body */}
        <div className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-3 min-h-[260px] text-sm">
          {turns.length === 0 && !isMeetingRunning && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <Users className="w-12 h-12 text-slate-600 mb-2 stroke-1" />
              <p className="font-semibold text-slate-300">Ruang Rapat Siap Digunakan</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Pilih topik dan peserta agen, lalu klik &quot;Mulai Rapat&quot; untuk memulai diskusi otonom berbasis Gemini AI.
              </p>
            </div>
          )}

          {turns.slice(0, currentTurnIdx).map((turn, idx) => {
            const isUser = turn.speaker.includes('Anda');
            const agent = agents.find((a) => a.id === turn.id);
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border animate-in fade-in duration-200 ${
                  isUser
                    ? 'bg-blue-950/40 border-blue-600/60'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <PixelAvatar cardIndex={agent?.cardIndex ?? 0} size={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-emerald-300">{turn.speaker}</span>
                    {agent && (
                      <span className="text-[10px] text-slate-400">[{agent.role}]</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans select-text">
                    {turn.dialogue}
                  </p>
                </div>
              </div>
            );
          })}

          {isComplete && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Konsensus Rapat Tercapai:</strong> Semua actionable items telah disepakati dan siap disinkronkan ke To-Do list tim!
              </span>
            </div>
          )}
        </div>

        {/* Chime-in bar for player */}
        <form onSubmit={handleChimeIn} className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800">
          <input
            type="text"
            placeholder="Sampaikan tanggapan atau instruksi Anda dalam rapat..."
            value={userChimeIn}
            onChange={(e) => setUserChimeIn(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!userChimeIn.trim()}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Tanggapan</span>
          </button>
        </form>
      </div>
    </div>
  );
};
