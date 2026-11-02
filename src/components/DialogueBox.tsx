import React, { useState, useEffect } from 'react';
import { Send, Terminal, Users, Coffee, Briefcase, Sparkles, X, ChevronDown } from 'lucide-react';
import { Agent } from '../types/office';
import { PixelAvatar } from './PixelCharacter';
import { sound } from '../utils/audio';

interface DialogueBoxProps {
  agent: Agent;
  initialMessage?: string;
  onClose: () => void;
  onCallMeeting: (agentId: string) => void;
  onPeekScreen: (agentId: string) => void;
  onAssignTask: (agentId: string, taskTitle: string) => void;
  onSendCoffeeBreak: (agentId: string) => void;
  officeContext?: { time: string; weather: string };
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  agent,
  initialMessage,
  onClose,
  onCallMeeting,
  onPeekScreen,
  onAssignTask,
  onSendCoffeeBreak,
  officeContext,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState(
    initialMessage || `Selamat datang di kantor! Saya ${agent.name} (${agent.role}). Ada yang bisa saya bantu untuk proyek hari ini?`
  );
  const [isTyping, setIsTyping] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [taskInputMode, setTaskInputMode] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 3 === 0) {
          sound.playTextBlip();
        }
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [fullText]);

  // When agent or initialMessage changes
  useEffect(() => {
    if (initialMessage) {
      setFullText(initialMessage);
    } else {
      setFullText(`Selamat datang di kantor! Saya ${agent.name} (${agent.role}). Ada yang bisa saya bantu untuk proyek hari ini?`);
    }
  }, [agent.id, initialMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    sound.playClick();

    setFullText(`"${userMsg}"... Memikirkan respons dari perspektif ${agent.role}...`);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          userMessage: userMsg,
          officeContext,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setFullText(data.reply);
      } else {
        setFullText(`Siap! Saya catat arahan Anda dan langsung eksekusi sekarang.`);
      }
    } catch {
      setFullText(`Siap! Tugas dan arahan telah diterima oleh ${agent.name}.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    sound.playFanfare();
    onAssignTask(agent.id, taskTitle.trim());
    setFullText(`Baik! Tugas "${taskTitle.trim()}" telah ditambahkan ke To-Do board saya. Saya akan mulai mengerjakannya sekarang!`);
    setTaskTitle('');
    setTaskInputMode(false);
  };

  return (
    <div className="fixed bottom-3 left-4 right-4 md:left-28 md:right-80 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="relative bg-[#162038]/95 backdrop-blur-md border-2 border-blue-400/80 rounded-2xl shadow-2xl p-3 md:p-4 text-white flex flex-col md:flex-row items-start md:items-center gap-3.5 min-h-[140px]">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute -top-3 -right-2 p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-300 hover:text-white transition shadow-md z-10"
          title="Tutup dialog (ESC)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Character Portrait Box */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-b from-indigo-900 to-slate-900 border-2 border-blue-400/90 rounded-2xl overflow-hidden p-1 shadow-inner flex items-center justify-center">
            <PixelAvatar cardIndex={agent.cardIndex} size={80} />
          </div>
          {/* Status Badge */}
          <span className="absolute -bottom-1 -right-1 text-xs bg-slate-900 border border-blue-400 px-1.5 py-0.5 rounded-full font-mono text-cyan-300">
            {agent.activityEmoji || '⭐'}
          </span>
        </div>

        {/* Dialogue Content */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between self-stretch">
          {/* Header pill: Speaker Name & Role */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-bold text-xs md:text-sm px-3 py-0.5 rounded-md tracking-wider shadow-sm border border-blue-400">
                {agent.name}
              </span>
              <span className="text-[11px] text-cyan-200/90 font-medium hidden sm:inline">
                [{agent.role}]
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Status:</span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                {agent.status}
              </span>
            </div>
          </div>

          {/* Typewriter Text Body */}
          <div className="min-h-[48px] py-1">
            <p className="text-xs md:text-sm text-slate-100 font-sans leading-relaxed tracking-wide select-text">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-3.5 bg-blue-400 ml-1 animate-pulse" />}
            </p>
          </div>

          {/* Quick Interactive Actions & Chat Bar */}
          <div className="mt-2 pt-2 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setChatMode(!chatMode);
                  setTaskInputMode(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                  chatMode
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ngobrol AI</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setTaskInputMode(!taskInputMode);
                  setChatMode(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                  taskInputMode
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-300" />
                <span>Beri Tugas</span>
              </button>

              <button
                onClick={() => {
                  sound.playMeetingBell();
                  onCallMeeting(agent.id);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                title="Panggil agen ini ke Ruang Rapat"
              >
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                <span>Ajak Rapat</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onPeekScreen(agent.id);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                title="Hermes Screen Peeker (Live Terminal)"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-300" />
                <span>Intip Layar</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onSendCoffeeBreak(agent.id);
                  setFullText(`Terima kasih! Saya akan rehat sejenak ke pantry untuk segelas kopi.`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
                title="Kirim ke pantry untuk coffee break"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Rehat Kopi</span>
              </button>
            </div>

            {/* Prompt Indicator Arrow (Blinking cursor) */}
            {!isTyping && !chatMode && !taskInputMode && (
              <div className="flex items-center text-blue-400 text-xs font-mono animate-bounce ml-auto">
                <ChevronDown className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Chat Mode Input Row */}
          {chatMode && (
            <form onSubmit={handleSendMessage} className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Tanya apa saja kepada ${agent.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-slate-950/90 border border-blue-500/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Memproses...' : 'Kirim'}</span>
              </button>
            </form>
          )}

          {/* Task Input Mode Row */}
          {taskInputMode && (
            <form onSubmit={handleTaskSubmit} className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Nama tugas baru untuk ${agent.name}...`}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 bg-slate-950/90 border border-indigo-500/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!taskTitle.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Tugaskan</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
