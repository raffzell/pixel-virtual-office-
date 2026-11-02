import React, { useState, useEffect } from 'react';
import { Terminal, X, Play, RotateCcw, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { Agent } from '../types/office';
import { PixelAvatar } from './PixelCharacter';
import { sound } from '../utils/audio';

interface ScreenPeekModalProps {
  agent: Agent;
  onClose: () => void;
}

export const ScreenPeekModal: React.FC<ScreenPeekModalProps> = ({ agent, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTerminal = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/terminal-peek', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: agent.id, taskName: agent.currentTask }),
        });
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch {
        setLogs([
          `[Hermes-Agent-Core v2.4] Connected to agent: ${agent.name}`,
          `[Task: Active] "${agent.currentTask}"`,
          `[Workspace: /workstations/${agent.name.toLowerCase()}]`,
          `[CLI Monitor] Background worker active. CPU: 14% | RAM: 52MB`,
          `[Hermes] Live process output streaming...`,
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerminal();
  }, [agent.currentTask, agent.id, agent.name]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    sound.playClick();
    const cmd = commandInput.trim();
    setCommandInput('');

    const newLogs = [
      ...logs,
      `$ ${cmd}`,
      `[Hermes Engine] Executing "${cmd}" on behalf of ${agent.name}...`,
    ];

    if (cmd.includes('test')) {
      newLogs.push('✔ 32/32 tests passed (45ms). Coverage: 98.4%');
    } else if (cmd.includes('build')) {
      newLogs.push('✔ Vite build completed in 240ms. Output: dist/ (clean)');
    } else if (cmd.includes('status')) {
      newLogs.push(`Agent: ${agent.name} | Role: ${agent.role} | State: ${agent.status} | Efficiency: ${agent.stats.efficiency}%`);
    } else {
      newLogs.push(`[Response] ${agent.name} acknowledged instruction: "${cmd}". Pipeline updated.`);
    }

    setLogs(newLogs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-950 border-2 border-cyan-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-cyan-400 overflow-hidden flex items-center justify-center">
              <PixelAvatar cardIndex={agent.cardIndex} size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm tracking-wide text-cyan-300 font-mono">
                  Hermes Screen Peeker // {agent.name}.sh
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">{agent.role} &bull; {agent.currentTask}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
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
        </div>

        {/* System Stats Bar */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load: 12%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory: 48.2 MB</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasks Done: {agent.stats.tasksDone}</span>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-y-auto min-h-[260px] text-slate-200 space-y-1.5 select-text">
          {isLoading ? (
            <div className="text-cyan-400 animate-pulse flex items-center gap-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Menghubungkan ke terminal kerja {agent.name}...</span>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('$')
                    ? 'text-yellow-400 font-bold'
                    : log.includes('✔')
                    ? 'text-emerald-400'
                    : log.includes('[Hermes')
                    ? 'text-cyan-300'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))
          )}
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleRunCommand} className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800">
          <span className="text-cyan-400 font-mono text-sm font-bold pl-1">$</span>
          <input
            type="text"
            placeholder="Kirim perintah terminal (misal: hermes run, test, status)..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
