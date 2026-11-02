import React from 'react';
import { Home, Building2, CheckSquare, MessageSquare, Users, Sliders } from 'lucide-react';
import { sound } from '../utils/audio';

export type ActiveTab = 'office' | 'tasks' | 'chat' | 'roster' | 'settings';

interface LeftNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadChats?: number;
  pendingTasks?: number;
}

export const LeftNav: React.FC<LeftNavProps> = ({
  activeTab,
  onTabChange,
  unreadChats = 2,
  pendingTasks = 3,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'office', label: 'Office', icon: <Building2 className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, badge: pendingTasks },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" />, badge: unreadChats },
    { id: 'roster', label: 'Agents', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-20 md:w-24 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/80 flex flex-col items-center py-3 px-2 gap-2 select-none z-20 shadow-xl">
      <div className="w-full flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onTabChange(item.id);
              }}
              className={`w-full relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition cursor-pointer font-sans ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>

              {item.badge && item.badge > 0 && !isActive && (
                <span className="absolute top-1.5 right-2 px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full border border-slate-900">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-2 border-t border-slate-800 w-full flex flex-col items-center">
        <div className="text-[10px] text-slate-300 font-mono text-center">
          HERMES
          <br />
          <span className="text-blue-300">2D RPG</span>
        </div>
      </div>
    </aside>
  );
};
