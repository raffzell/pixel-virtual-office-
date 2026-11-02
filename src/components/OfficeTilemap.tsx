import React from 'react';

/**
 * Clean 32-Bit HD Modular Office Shell (using 01_ruangan_kantor_utama.png + exterior assets)
 * Renders the separated architectural shell so all furniture, computers, cafe tables, and
 * characters are layered independently in 2.5D Y-sorted space without merging into the background.
 */
export const OfficeTilemap: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden bg-[#2b3040]">
      {/* Exterior Dark Stone Courtyard Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(22, 25, 37, 0.45) 2px, transparent 2px), linear-gradient(to bottom, rgba(22, 25, 37, 0.45) 2px, transparent 2px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Courtyard Trees (03_sepasang_pohon_kanan.png) */}
      <img
        src="/assets/office_props/03_sepasang_pohon_kanan.png"
        alt="Pohon Taman Atas"
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none drop-shadow-md"
        style={{
          left: '26.8%',
          top: '4.5%',
          width: '9.5%',
          imageRendering: 'pixelated',
        }}
      />

      {/* Entrance Sidewalk Path */}
      <div className="absolute left-[43%] top-[85%] w-[12%] h-[15%] bg-[#9ca3af]/30 border-x-2 border-[#475569]/50" />

      {/* 01_ruangan_kantor_utama.png: High-Resolution 32-Bit Cutout Architectural Shell */}
      <img
        src="/assets/office_props/01_ruangan_kantor_utama.png"
        alt="Ruangan Kantor Utama 32-Bit Shell"
        className="absolute left-1/2 top-[48.8%] -translate-x-1/2 -translate-y-1/2 w-[90.2%] h-auto pointer-events-none select-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)]"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* 02_karpet_biru_ikon.png: Entrance Corporate Rug Layer */}
      <img
        src="/assets/office_props/02_karpet_biru_ikon.png"
        alt="Karpet Entrance RaffZell"
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-95"
        style={{
          left: '49.0%',
          top: '74.8%',
          width: '6.8%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
