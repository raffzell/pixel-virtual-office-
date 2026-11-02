import React, { useState } from 'react';
import { ClipboardList, Plus, X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Task, Agent } from '../types/office';
import { PixelAvatar } from './PixelCharacter';
import { sound } from '../utils/audio';

interface KanbanModalProps {
  tasks: Task[];
  agents: Agent[];
  onClose: () => void;
  onAddTask: (title: string, assigneeId: string, priority?: 'low' | 'medium' | 'high') => void;
  onMoveTask: (taskId: string, targetCol: 'todo' | 'in_progress' | 'review' | 'done') => void;
}

export const KanbanModal: React.FC<KanbanModalProps> = ({
  tasks,
  agents,
  onClose,
  onAddTask,
  onMoveTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('06');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  const columns: { id: 'todo' | 'in_progress' | 'review' | 'done'; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'border-slate-600 text-slate-300' },
    { id: 'in_progress', label: 'In Progress', color: 'border-blue-500 text-blue-300' },
    { id: 'review', label: 'Review / QA', color: 'border-amber-500 text-amber-300' },
    { id: 'done', label: 'Completed', color: 'border-emerald-500 text-emerald-300' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.playClick();
    onAddTask(newTitle.trim(), assigneeId, priority);
    setNewTitle('');
    setIsAdding(false);
  };

  const getNextCol = (curr: 'todo' | 'in_progress' | 'review' | 'done') => {
    const order: ('todo' | 'in_progress' | 'review' | 'done')[] = ['todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(curr);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevCol = (curr: 'todo' | 'in_progress' | 'review' | 'done') => {
    const order: ('todo' | 'in_progress' | 'review' | 'done')[] = ['todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(curr);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-blue-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-blue-300">
                Hermes Kanban Board // Task Manager
              </h3>
              <p className="text-[11px] text-slate-400">Sinkronisasi status pengerjaan tugas seluruh agen virtual</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tugas Baru</span>
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

        {/* Add Task Sub-panel */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Deskripsi tugas baru..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
              autoFocus
            />
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role.split(' ')[0]})
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="low">Prioritas: Rendah</option>
              <option value="medium">Prioritas: Sedang</option>
              <option value="high">Prioritas: Tinggi</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
            >
              Simpan Tugas
            </button>
          </form>
        )}

        {/* 4 Kanban Columns */}
        <div className="flex-1 p-4 bg-slate-950 overflow-x-auto grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => (t.column || (t.completed ? 'done' : 'todo')) === col.id);
            return (
              <div key={col.id} className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex flex-col gap-2.5 min-h-[300px]">
                <div className={`flex items-center justify-between pb-2 border-b ${col.color}`}>
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 font-mono text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {colTasks.map((task) => {
                    const assignee = agents.find((a) => a.id === task.assigneeId);
                    const nextCol = getNextCol(col.id);
                    const prevCol = getPrevCol(col.id);

                    return (
                      <div
                        key={task.id}
                        className="p-2.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl shadow-sm transition flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                task.priority === 'high'
                                  ? 'bg-red-950/60 text-red-400 border border-red-800'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[9px] font-mono text-amber-300/80">+{task.expReward} EXP</span>
                          </div>
                          <p className="text-xs text-slate-100 font-medium leading-snug">{task.title}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                          {assignee && (
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <div className="w-4 h-4 rounded overflow-hidden">
                                <PixelAvatar cardIndex={assignee.cardIndex} size={16} />
                              </div>
                              <span className="truncate max-w-[80px]">{assignee.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            {prevCol && (
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  onMoveTask(task.id, prevCol);
                                }}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                title="Pindah ke kolom sebelumnya"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextCol && (
                              <button
                                onClick={() => {
                                  if (nextCol === 'done') {
                                    sound.playFanfare();
                                  } else {
                                    sound.playClick();
                                  }
                                  onMoveTask(task.id, nextCol);
                                }}
                                className="p-1 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-600/40 rounded text-blue-300 hover:text-white"
                                title="Pindah ke kolom berikutnya"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
