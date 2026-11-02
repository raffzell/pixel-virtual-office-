import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Check,
  Sparkles,
  User,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Task, Agent } from '../types/office';
import { sound } from '../utils/audio';

interface RightToDoListProps {
  tasks: Task[];
  agents: Agent[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, assigneeId: string) => void;
  onAgentSelect?: (agentId: string) => void;
}

export const RightToDoList: React.FC<RightToDoListProps> = ({
  tasks,
  agents,
  onToggleTask,
  onAddTask,
  onAgentSelect,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('06');

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playClick();
    onAddTask(newTitle.trim(), selectedAssignee);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="relative flex items-start">
      {/* Collapsed Slide-In Trigger Tab (shown when panel is hidden) */}
      <button
        onClick={() => {
          sound.playClick();
          setIsCollapsed(false);
        }}
        className={`flex items-center gap-1.5 bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md border border-slate-600/80 text-white px-2.5 py-2 rounded-l-xl shadow-2xl transition-all duration-300 cursor-pointer ${
          isCollapsed
            ? ' opacity-100 translate-x-3 pointer-events-auto'
            : 'opacity-0 translate-x-10 pointer-events-none absolute right-0'
        }`}
        title="Buka To Do List"
      >
        <ChevronLeft className="w-4 h-4 text-blue-400" />
        <ClipboardList className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-bold tracking-wide">To Do</span>
        <span className="text-[10px] font-mono text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">
          {progressPercent}%
        </span>
      </button>

      {/* Main Slideable To-Do List Panel */}
      <div
        className={`w-72 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 text-white select-none shadow-2xl flex flex-col gap-3 transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'translate-x-[115%] opacity-0 pointer-events-none absolute right-0'
            : 'translate-x-0 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm tracking-wide text-slate-100">To Do List</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setIsAdding(!isAdding);
              }}
              className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2 py-1 rounded-lg transition text-slate-200 cursor-pointer"
              title="Tambah Tugas Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Baru</span>
            </button>

            {/* Slide Hide Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsCollapsed(true);
              }}
              className="p-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
              title="Sembunyikan To Do List (Slide Hide)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Task Quick Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-slate-800/90 border border-indigo-500/50 rounded-xl flex flex-col gap-2"
          >
            <input
              type="text"
              placeholder="Ketik tugas kantor baru..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
              autoFocus
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Tugaskan ke:</span>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[11px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="text-[11px] px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* Task List */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const assignee = agents.find((a) => a.id === task.assigneeId);
            return (
              <div
                key={task.id}
                className={`group flex items-start gap-2.5 p-2 rounded-xl border transition ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                }`}
              >
                <button
                  onClick={() => {
                    if (!task.completed) {
                      sound.playFanfare();
                    } else {
                      sound.playClick();
                    }
                    onToggleTask(task.id);
                  }}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${
                    task.completed
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-slate-500 hover:border-blue-400 bg-slate-900'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-snug cursor-pointer select-text ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                    onClick={() => onToggleTask(task.id)}
                  >
                    {task.title}
                  </p>
                  {assignee && (
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAgentSelect) onAgentSelect(assignee.id);
                        }}
                        className="hover:text-blue-300 flex items-center gap-1 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        <User className="w-2.5 h-2.5 text-blue-400" />
                        <span>{assignee.name}</span>
                      </button>
                      <span className="text-amber-400/90 font-mono">+{task.expReward} EXP</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Footer */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              Progress
              {progressPercent === 100 && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            </span>
            <span className="font-mono text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
