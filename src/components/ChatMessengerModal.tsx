import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, User } from 'lucide-react';
import { Agent } from '../types/office';
import { PixelAvatar } from './PixelCharacter';
import { sound } from '../utils/audio';

interface ChatMessengerModalProps {
  agents: Agent[];
  activeAgentId?: string;
  onClose: () => void;
  officeContext?: { time: string; weather: string };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  text: string;
  timestamp: string;
}

export const ChatMessengerModal: React.FC<ChatMessengerModalProps> = ({
  agents,
  activeAgentId = '01',
  onClose,
  officeContext,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(activeAgentId);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    '01': [
      {
        id: '1',
        sender: 'agent',
        agentId: '01',
        text: 'Halo! Sebagai Office Lead RaffZell Corp, semua divisi hari ini beroperasi normal. Ada arahan baru?',
        timestamp: '09:00',
      },
    ],
    '06': [
      {
        id: '1',
        sender: 'agent',
        agentId: '06',
        text: 'Saya baru saja selesai mengaudit throughput server. Desain sistem kita sangat stabil!',
        timestamp: '09:05',
      },
    ],
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const currentMessages = messages[selectedAgentId] || [
    {
      id: 'default',
      sender: 'agent',
      agentId: selectedAgentId,
      text: `Halo! Saya ${currentAgent.name} (${currentAgent.role}). Ada yang bisa saya bantu?`,
      timestamp: 'Now',
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    sound.playClick();
    const userText = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), userMsg],
    }));

    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          userMessage: userText,
          history: (messages[selectedAgentId] || []).map((m) => ({ sender: m.sender, text: m.text })),
          officeContext,
        }),
      });
      const data = await res.json();
      sound.playTextBlip();
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: selectedAgentId,
        text: data.reply || 'Pesan diterima, saya akan segera menindaklanjuti!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), replyMsg],
      }));
    } catch {
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: selectedAgentId,
        text: `Siap! Saya (${currentAgent.name}) akan menangani tugas ini sesuai keahlian saya.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), replyMsg],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-blue-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-blue-300">
                AI Agent Direct Messenger
              </h3>
              <p className="text-[11px] text-slate-400">Komunikasi real-time dengan 15 agen virtual kantor</p>
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

        {/* Content Body: Left Agent List + Right Chat */}
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          {/* Left Agent List */}
          <div className="w-64 border-r border-slate-800 overflow-y-auto p-2 space-y-1">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedAgentId(agent.id);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-blue-950/80 border border-blue-500 text-white'
                      : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-950 overflow-hidden shrink-0 flex items-center justify-center">
                    <PixelAvatar cardIndex={agent.cardIndex} size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{agent.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">#{agent.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Chat Panel */}
          <div className="flex-1 flex flex-col bg-slate-900/50">
            {/* Agent Top Info */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 overflow-hidden flex items-center justify-center">
                  <PixelAvatar cardIndex={currentAgent.cardIndex} size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    {currentAgent.name}
                    <span className="text-[10px] text-cyan-300 font-normal">[{currentAgent.role}]</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-sm">{currentAgent.specialty}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/30">
                Online
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {currentMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {!isUser ? (
                      <div className="w-7 h-7 rounded-lg bg-indigo-950 overflow-hidden shrink-0">
                        <PixelAvatar cardIndex={currentAgent.cardIndex} size={28} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed select-text ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-60 mt-1 block text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>{currentAgent.name} sedang mengetik...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 text-[10px] shrink-0">Cepat:</span>
              <button
                onClick={() => setInputText('Apa prioritas tugasmu untuk proyek hari ini?')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                Tanya Prioritas
              </button>
              <button
                onClick={() => setInputText('Bantu review dan berikan ide optimasi terbaru.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                Minta Ide Optimasi
              </button>
              <button
                onClick={() => setInputText('Mari kita buat sesi rapat koordinasi di meeting room.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
              >
                Ajak Rapat
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Kirim pesan ke ${currentAgent.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
