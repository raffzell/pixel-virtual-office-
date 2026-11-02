import React from 'react';
import {
  Sliders,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Keyboard,
  Building,
  Layers,
  Map,
} from 'lucide-react';
import { MapRenderMode, SpriteRenderMode } from '../types/office';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  spriteMode: SpriteRenderMode;
  onChangeSpriteMode: (mode: SpriteRenderMode) => void;
  mapMode: MapRenderMode;
  onChangeMapMode: (mode: MapRenderMode) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  onToggleSound,
  spriteMode,
  onChangeSpriteMode,
  mapMode,
  onChangeMapMode,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-slate-100">
                Pengaturan Kantor & Visual Karakter
              </h3>
              <p className="text-[11px] text-slate-400">Hermes 2D RPG Virtual Office Configuration</p>
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

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-xs text-slate-200 overflow-y-auto">
          {/* Character Sprite Mode Selector */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Gaya Render Karakter Chibi (Sprite Mode)
            </span>
            <p className="text-[11px] text-slate-400">
              Pilih antara 15 Spritesheet HD baru (16 baris animasi + pembersih piksel liar & postur duduk), potongan gambar roster asli, atau animasi prosedural 2D.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeSpriteMode('spritesheet_hd');
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  spriteMode === 'spritesheet_hd'
                    ? 'bg-blue-950/80 border-cyan-400 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-cyan-300 font-bold">Spritesheet HD (Baru)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  15 sheet (96×184), bersih tanpa piksel liar, duduk sinkron & napas idle
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onChangeSpriteMode('roster_transparent');
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  spriteMode === 'roster_transparent'
                    ? 'bg-blue-950/80 border-blue-400 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-indigo-300 font-bold">Potongan Roster Asli</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sprite dari kartu referensi dengan flood-fill transparan
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onChangeSpriteMode('animated');
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  spriteMode === 'animated'
                    ? 'bg-blue-950/80 border-blue-400 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-sky-300 font-bold">Animasi 2D Klasik</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sprite pixel-art kanvas prosedural ringan
                </div>
              </button>
            </div>
          </div>

          {/* Office Map Mode Selector */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-emerald-400" />
              Tampilan Peta Lantai Kantor (Tilemap Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeMapMode('clean_tilemap');
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  mapMode === 'clean_tilemap'
                    ? 'bg-emerald-950/80 border-emerald-400 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-emerald-300 font-bold">Tilemap Kantor Bersih</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Render ulang arsitektur kantor interaktif tanpa tumpukan UI gambar
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onChangeMapMode('reference_image');
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  mapMode === 'reference_image'
                    ? 'bg-emerald-950/80 border-emerald-400 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-amber-300 font-bold">Gambar Referensi Asli</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tampilkan gambar screenshot referensi asli sebagai latar belakang
                </div>
              </button>
            </div>
          </div>

          {/* Audio Engine */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Efek Suara Retro (8-bit Web Audio)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bip mesin tik dialog JRPG, klik menu, suara kucing tidur, dan lagu kemenangan
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Aktif' : 'Mute'}</span>
            </button>
          </div>

          {/* Controls Guide */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-blue-400" />
              Kontrol Navigasi & Kamera
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block mb-0.5">W, A, S, D / Panah:</span>
                Berjalan menghindari meja
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block mb-0.5">Klik Lantai Kantor:</span>
                Jalan otomatis (A* Pathfinding)
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block mb-0.5">Scroll Mouse / + -:</span>
                Zoom In & Zoom Out kamera
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-bold block mb-0.5">Klik Agen / Kucing:</span>
                Dialog JRPG & bonus EXP
              </div>
            </div>
          </div>

          {/* AI Model Status */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Mesin Neural AI Agen
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                gemini-3.8-flash Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Setiap agen memiliki persona mandiri untuk dialog otonom, obrolan berpapasan, dan rapat multi-agen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
