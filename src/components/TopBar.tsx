import React from 'react';
import { Coins, Clock, Sun, CloudRain, Sunset, Moon, Settings, Mail, Menu, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { PixelAvatar } from './PixelCharacter';
import { PlayerStats, SpriteRenderMode, WeatherType } from '../types/office';
import { sound } from '../utils/audio';

interface TopBarProps {
  player: PlayerStats;
  timeString: string;
  weather: WeatherType;
  spriteMode?: SpriteRenderMode;
  onWeatherChange: (w: WeatherType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenMail: () => void;
  onOpenRoster: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  player,
  timeString,
  weather,
  spriteMode = 'spritesheet_hd',
  onWeatherChange,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenMail,
  onOpenRoster,
}) => {
  const expPercent = Math.min(100, Math.round((player.currentExp / player.maxExp) * 100));

  const weatherIcons: Record<WeatherType, React.ReactNode> = {
    sunny: <Sun className="w-4 h-4 text-amber-400 shrink-0" />,
    rainy: <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />,
    sunset: <Sunset className="w-4 h-4 text-orange-400 shrink-0" />,
    night: <Moon className="w-4 h-4 text-indigo-300 shrink-0" />,
  };

  const weatherLabels: Record<WeatherType, string> = {
    sunny: 'Sunny',
    rainy: 'Rainy',
    sunset: 'Sunset',
    night: 'Night',
  };

  const cycleWeather = () => {
    sound.playClick();
    const cycle: WeatherType[] = ['sunny', 'rainy', 'sunset', 'night'];
    const nextIdx = (cycle.indexOf(weather) + 1) % cycle.length;
    onWeatherChange(cycle[nextIdx]);
  };

  return (
    <header className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 text-white select-none z-30 shadow-lg">
      {/* Left: Player Profile Badge */}
      <div
        onClick={() => {
          sound.playClick();
          onOpenRoster();
        }}
        className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/70 rounded-xl px-2.5 py-1.5 cursor-pointer transition shadow-md group shrink-0"
        title="Klik untuk memilih karakter player"
      >
        <div className="relative w-11 h-11 rounded-lg bg-indigo-950 border border-indigo-500/50 overflow-hidden flex items-center justify-center p-0.5 group-hover:border-indigo-400 shrink-0">
          <PixelAvatar
            cardIndex={parseInt(player.characterId, 10) - 1 || 0}
            size={42}
            spriteMode={spriteMode}
          />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[9px] px-1 font-mono rounded font-bold">
            Lv.{player.level}
          </div>
        </div>

        <div className="flex flex-col min-w-[130px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-1">
              {player.name}
              <Sparkles className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
            </span>
            <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
              Lv. {player.level} <span className="text-slate-400">{player.title}</span>
            </span>
          </div>

          {/* EXP Bar */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex-1 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${expPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-amber-300/90 whitespace-nowrap tabular-nums">
              EXP {player.currentExp}/{player.maxExp}
            </span>
          </div>
        </div>
      </div>

      {/* Center HUD Status Group: Coins, In-game Time & Weather Switcher */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold">
        {/* Coins */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
          <Coins className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span className="font-mono text-amber-300 tabular-nums">{player.coins.toLocaleString()}</span>
        </div>

        {/* In-game Time */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-mono text-slate-200 tabular-nums">{timeString}</span>
        </div>

        {/* Weather Switcher */}
        <button
          onClick={cycleWeather}
          className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition whitespace-nowrap"
          title="Klik untuk mengubah cuaca kantor"
        >
          {weatherIcons[weather]}
          <span className="text-slate-200">{weatherLabels[weather]}</span>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition ${
            soundEnabled
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              : 'bg-red-950/40 hover:bg-red-900/50 border-red-800 text-red-300'
          }`}
          title={soundEnabled ? 'Matikan Suara (Mute)' : 'Nyalakan Suara (Unmute)'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition"
          title="Pengaturan Kantor"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Mail / Inbox */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMail();
          }}
          className="relative p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition"
          title="Pesan & Log Agen"
        >
          <Mail className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
        </button>

        {/* Character Roster Menu */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenRoster();
          }}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 rounded-lg text-white transition flex items-center gap-1 text-xs font-bold"
          title="Lihat Daftar 15 AI Agent"
        >
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">Roster</span>
        </button>
      </div>
    </header>
  );
};
