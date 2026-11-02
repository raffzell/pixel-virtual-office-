import { OfficeHotspot } from '../types/office';

export type HotspotCategory = OfficeHotspot['category'];

export interface OfficePropItem {
  id: string;
  fileName: string;
  src: string;
  name: string;
  category: 'shell' | 'furniture' | 'tech' | 'appliance' | 'plant' | 'decor';
  /** Exact left bounding box coordinate (0 - 100%) on the 1264x843 background */
  left: number;
  /** Exact top bounding box coordinate (0 - 100%) on the 1264x843 background */
  top: number;
  /** Exact width (0 - 100%) on the 1264x843 background */
  width: number;
  /** Exact height (0 - 100%) on the 1264x843 background */
  height: number;
  /** Y coordinate used for 2.5D painter's algorithm depth sorting against characters (0 - 100) */
  sortY: number;
  /** Optional CSS clip-path to split composite chair+desk sprites into seat-back vs desk-front layers */
  clipPath?: string;
  /** Optional interactive hotspot action when clicked */
  hotspotCategory?: HotspotCategory;
  /** Whether this prop lies flat on the floor (always rendered below characters) */
  isFloorMat?: boolean;
}

/**
 * Complete catalog of all 48 extracted 32-bit HD transparent PNG assets
 * from 01_aset_hd_32bit_tanpa_pecah_6953a66a.zip
 */
export const ALL_48_HD_ASSETS: {
  fileName: string;
  name: string;
  width: number;
  height: number;
  category: OfficePropItem['category'];
}[] = [
  { fileName: '01_ruangan_kantor_utama.png', name: 'Ruangan Kantor Utama (Shell 32-Bit)', width: 3476, height: 1772, category: 'shell' },
  { fileName: '02_karpet_biru_ikon.png', name: 'Karpet Ikon Korporat', width: 624, height: 408, category: 'decor' },
  { fileName: '03_sepasang_pohon_kanan.png', name: 'Sepasang Pohon Taman', width: 664, height: 584, category: 'plant' },
  { fileName: '03a_pohon_kanan_1.png', name: 'Pohon Taman Kanan 1', width: 352, height: 584, category: 'plant' },
  { fileName: '03b_pohon_kanan_2.png', name: 'Pohon Taman Kanan 2', width: 328, height: 584, category: 'plant' },
  { fileName: '04_rak_buku_besar.png', name: 'Rak Buku Besar', width: 432, height: 664, category: 'furniture' },
  { fileName: '05_tanaman_pot_sedang_kanan.png', name: 'Tanaman Pot Sedang', width: 192, height: 328, category: 'plant' },
  { fileName: '06_pot_tanaman_panjang.png', name: 'Pot Tanaman Panjang', width: 360, height: 176, category: 'plant' },
  { fileName: '07_lampu_meja_kecil.png', name: 'Lampu Meja Kecil', width: 168, height: 248, category: 'decor' },
  { fileName: '08_meja_kerja_manajer.png', name: 'Meja Kerja Manajer Eksekutif', width: 584, height: 632, category: 'furniture' },
  { fileName: '09_sofa_abu_dua_dudukan.png', name: 'Sofa Abu Dua Dudukan', width: 560, height: 360, category: 'furniture' },
  { fileName: '10_meja_kafe_bundar_dan_kursi_kiri.png', name: 'Meja Kafe Bundar & Kursi Kiri', width: 600, height: 440, category: 'furniture' },
  { fileName: '11_kursi_kafe_kanan.png', name: 'Kursi Kafe Kanan', width: 424, height: 488, category: 'furniture' },
  { fileName: '12_papan_nama_biru_raffzell.png', name: 'Papan Nama Biru RaffZell', width: 584, height: 328, category: 'decor' },
  { fileName: '13_papan_nama_abu_sign.png', name: 'Papan Nama Abu Sign', width: 552, height: 328, category: 'decor' },
  { fileName: '14_bingkai_foto_lebar.png', name: 'Bingkai Foto Lebar', width: 264, height: 248, category: 'decor' },
  { fileName: '15_bingkai_foto_vertikal.png', name: 'Bingkai Foto Vertikal', width: 160, height: 216, category: 'decor' },
  { fileName: '16_bingkai_lukisan_besar.png', name: 'Bingkai Lukisan Besar', width: 336, height: 352, category: 'decor' },
  { fileName: '17_rak_buku_kecil.png', name: 'Rak Buku Kecil', width: 288, height: 480, category: 'furniture' },
  { fileName: '18_monitor_dan_keyboard.png', name: 'Monitor & Keyboard', width: 264, height: 288, category: 'tech' },
  { fileName: '19_cpu_komputer_tower.png', name: 'CPU Komputer Tower', width: 112, height: 296, category: 'tech' },
  { fileName: '20_monitor_layar_lebar.png', name: 'Monitor Layar Lebar', width: 328, height: 280, category: 'tech' },
  { fileName: '21_perangkat_kecil_dan_mouse.png', name: 'Perangkat Kecil & Mouse', width: 112, height: 176, category: 'tech' },
  { fileName: '22_monitor_dan_perangkat_kerja.png', name: 'Monitor & Perangkat Kerja', width: 280, height: 304, category: 'tech' },
  { fileName: '23_mesin_penghancur_kertas.png', name: 'Mesin Penghancur Kertas', width: 168, height: 208, category: 'appliance' },
  { fileName: '24_mesin_kopi_kantor.png', name: 'Mesin Kopi Kantor Espresso', width: 216, height: 312, category: 'appliance' },
  { fileName: '25_monitor_belakang.png', name: 'Monitor Belakang', width: 304, height: 288, category: 'tech' },
  { fileName: '26_printer_putih.png', name: 'Printer Putih Kantor', width: 272, height: 288, category: 'tech' },
  { fileName: '27_microwave_dapur.png', name: 'Microwave Dapur', width: 304, height: 256, category: 'appliance' },
  { fileName: '28_rak_dokumen_sempit.png', name: 'Rak Dokumen Sempit', width: 120, height: 264, category: 'furniture' },
  { fileName: '29_dispenser_air_kecil.png', name: 'Dispenser Air Kecil', width: 208, height: 288, category: 'appliance' },
  { fileName: '30_pembuat_kopi_hitam.png', name: 'Pembuat Kopi Hitam', width: 168, height: 288, category: 'appliance' },
  { fileName: '31_kulkas_mini_abu.png', name: 'Kulkas Mini Abu', width: 248, height: 496, category: 'appliance' },
  { fileName: '32_dispenser_galon_air.png', name: 'Dispenser Galon Air', width: 224, height: 576, category: 'appliance' },
  { fileName: '33_vending_machine_biru.png', name: 'Vending Machine Biru', width: 304, height: 584, category: 'appliance' },
  { fileName: '34_vending_machine_merah.png', name: 'Vending Machine Merah', width: 344, height: 624, category: 'appliance' },
  { fileName: '35_layar_tv_dinding.png', name: 'Layar TV Dinding', width: 480, height: 336, category: 'tech' },
  { fileName: '36_pohon_pot_besar_kiri.png', name: 'Pohon Pot Besar Kiri', width: 344, height: 608, category: 'plant' },
  { fileName: '37_pohon_pot_besar_kanan.png', name: 'Pohon Pot Besar Kanan', width: 336, height: 608, category: 'plant' },
  { fileName: '38_tanaman_meja_rimbun.png', name: 'Tanaman Meja Rimbun', width: 224, height: 208, category: 'plant' },
  { fileName: '39_tanaman_pot_sedang_bawah.png', name: 'Tanaman Pot Sedang Bawah', width: 232, height: 416, category: 'plant' },
  { fileName: '40_meja_kabinet_kecil.png', name: 'Meja Kabinet Kecil', width: 336, height: 296, category: 'furniture' },
  { fileName: '41_rak_pajangan_meja.png', name: 'Rak Pajangan Meja', width: 336, height: 200, category: 'furniture' },
  { fileName: '42_lampu_berdiri_lantai.png', name: 'Lampu Berdiri Lantai', width: 192, height: 368, category: 'decor' },
  { fileName: '43_alat_tulis_kiri.png', name: 'Alat Tulis Kiri', width: 96, height: 184, category: 'decor' },
  { fileName: '44_alat_tulis_kanan.png', name: 'Alat Tulis Kanan', width: 120, height: 144, category: 'decor' },
  { fileName: '45_papan_pengumuman_hijau.png', name: 'Papan Pengumuman Hijau', width: 432, height: 320, category: 'decor' },
  { fileName: '46_gantungan_ungu.png', name: 'Gantungan Ungu', width: 104, height: 176, category: 'decor' },
  { fileName: '47_botol_kecil.png', name: 'Botol Kecil', width: 80, height: 104, category: 'decor' },
  { fileName: '48_apar_pemadam_api.png', name: 'APAR Pemadam Api', width: 120, height: 256, category: 'appliance' },
];

/**
 * 1:1 Pixel-Matched 32-Bit HD Overlay Props (Timpa Pas di Atas Background 1264x843).
 * Every prop's `left`, `top`, `width`, and `height` percentage was computed via pixel template
 * matching against `Pixel-Art_Office_Management_Sim_662085ab.png_db9e11ea.jpg`.
 *
 * Synchronized 2.5D Depth Sorting (`sortY` & `clipPath`):
 * - Seats/Sofas/Chairs have `sortY` at their backrest so sitting characters render ON TOP OF (`di atas`) the seat!
 * - Desks/Tables/Monitors/Trees have `sortY` at their front edge so characters sitting or walking BEHIND them
 *   have their lower body naturally occluded (`tertutup secara alami`) while their upper body & head remain visible!
 */
export const OFFICE_32BIT_PROPS: OfficePropItem[] = [
  // ================= TOP WALL & CORRIDOR PROPS =================
  {
    id: 'prop-raffzell-sign',
    fileName: '12_papan_nama_biru_raffzell.png',
    src: '/assets/office_props/12_papan_nama_biru_raffzell.png',
    name: 'Papan Nama Biru RaffZell Corporation',
    category: 'decor',
    left: 30.06,
    top: 14.35,
    width: 9.34,
    height: 7.83,
    sortY: 22.18,
    hotspotCategory: 'bulletin',
  },
  {
    id: 'prop-top-bookshelf',
    fileName: '04_rak_buku_besar.png',
    src: '/assets/office_props/04_rak_buku_besar.png',
    name: 'Rak Buku Besar Open Office',
    category: 'furniture',
    left: 20.33,
    top: 13.88,
    width: 5.54,
    height: 12.69,
    sortY: 26.57,
  },
  {
    id: 'prop-top-water-dispenser',
    fileName: '32_dispenser_galon_air.png',
    src: '/assets/office_props/32_dispenser_galon_air.png',
    name: 'Dispenser Galon Air',
    category: 'appliance',
    left: 41.14,
    top: 17.08,
    width: 2.61,
    height: 10.08,
    sortY: 27.16,
    hotspotCategory: 'coffee',
  },
  {
    id: 'prop-top-vending-red',
    fileName: '34_vending_machine_merah.png',
    src: '/assets/office_props/34_vending_machine_merah.png',
    name: 'Vending Machine Minuman Dingin',
    category: 'appliance',
    left: 43.91,
    top: 16.13,
    width: 4.27,
    height: 11.74,
    sortY: 27.88,
    hotspotCategory: 'vending',
  },
  {
    id: 'prop-exec-frame',
    fileName: '14_bingkai_foto_lebar.png',
    src: '/assets/office_props/14_bingkai_foto_lebar.png',
    name: 'Lukisan Gunung Ruang Eksekutif',
    category: 'decor',
    left: 73.50,
    top: 14.35,
    width: 3.72,
    height: 5.22,
    sortY: 19.57,
  },
  {
    id: 'prop-exec-bookshelf',
    fileName: '17_rak_buku_kecil.png',
    src: '/assets/office_props/17_rak_buku_kecil.png',
    name: 'Rak Koleksi Buku Eksekutif',
    category: 'furniture',
    left: 78.01,
    top: 18.27,
    width: 3.40,
    height: 8.54,
    sortY: 25.50,
  },

  // ================= EXECUTIVE MANAGER CHAIR & DESK (2-Layer Sandwich for 07. Ren at y=28.0%) =================
  // Layer 1: Black Executive Chair Back (sortY = 24.0 -> renders BEHIND Ren so Ren sits ON TOP OF the chair!)
  {
    id: 'prop-manager-chair-back',
    fileName: '08_meja_kerja_manajer.png',
    src: '/assets/office_props/08_meja_kerja_manajer.png',
    name: 'Kursi Eksekutif Manajer',
    category: 'furniture',
    left: 74.05,
    top: 22.78,
    width: 8.39,
    height: 13.64,
    sortY: 24.00,
    clipPath: 'inset(0% 0% 63% 0%)',
  },
  // Layer 2: Wooden Executive Desk + Monitor (sortY = 35.5 -> renders IN FRONT OF Ren's lower body!)
  {
    id: 'prop-manager-desk',
    fileName: '08_meja_kerja_manajer.png',
    src: '/assets/office_props/08_meja_kerja_manajer.png',
    name: 'Meja Kerja Manajer Eksekutif',
    category: 'furniture',
    left: 74.05,
    top: 22.78,
    width: 8.39,
    height: 13.64,
    sortY: 35.50,
    clipPath: 'inset(35% 0% 0% 0%)',
    hotspotCategory: 'executive',
  },

  // ================= WORKSTATION PODS (OPEN OFFICE MONITORS & PROPS) =================
  {
    id: 'prop-pod-tl-cpu',
    fileName: '19_cpu_komputer_tower.png',
    src: '/assets/office_props/19_cpu_komputer_tower.png',
    name: 'Workstation CPU Tower #1',
    category: 'tech',
    left: 20.02,
    top: 33.21,
    width: 1.27,
    height: 5.10,
    sortY: 38.20,
  },
  {
    id: 'prop-pod-tl-monitor',
    fileName: '20_monitor_layar_lebar.png',
    src: '/assets/office_props/20_monitor_layar_lebar.png',
    name: 'Monitor Layar Lebar Dev #1',
    category: 'tech',
    left: 22.23,
    top: 32.98,
    width: 3.80,
    height: 4.86,
    sortY: 38.40,
  },
  {
    id: 'prop-pod-tl-plant',
    fileName: '38_tanaman_meja_rimbun.png',
    src: '/assets/office_props/38_tanaman_meja_rimbun.png',
    name: 'Tanaman Partisi Meja Atas',
    category: 'plant',
    left: 27.85,
    top: 31.91,
    width: 2.61,
    height: 3.68,
    sortY: 35.59,
  },
  {
    id: 'prop-pod-tr-monitor',
    fileName: '18_monitor_dan_keyboard.png',
    src: '/assets/office_props/18_monitor_dan_keyboard.png',
    name: 'Monitor & Keyboard Dev #2',
    category: 'tech',
    left: 32.52,
    top: 32.74,
    width: 3.56,
    height: 5.81,
    sortY: 38.40,
  },
  {
    id: 'prop-pod-tr-printer',
    fileName: '26_printer_putih.png',
    src: '/assets/office_props/26_printer_putih.png',
    name: 'Printer Laser Putih',
    category: 'tech',
    left: 39.08,
    top: 30.49,
    width: 3.40,
    height: 5.34,
    sortY: 36.50,
  },
  {
    id: 'prop-pod-bl-monitor',
    fileName: '22_monitor_dan_perangkat_kerja.png',
    src: '/assets/office_props/22_monitor_dan_perangkat_kerja.png',
    name: 'Monitor & Workstation #3',
    category: 'tech',
    left: 20.09,
    top: 46.38,
    width: 3.40,
    height: 5.58,
    sortY: 52.00,
  },
  {
    id: 'prop-pod-bl-plant',
    fileName: '38_tanaman_meja_rimbun.png',
    src: '/assets/office_props/38_tanaman_meja_rimbun.png',
    name: 'Tanaman Partisi Meja Bawah',
    category: 'plant',
    left: 27.69,
    top: 45.67,
    width: 2.53,
    height: 3.56,
    sortY: 49.23,
  },
  {
    id: 'prop-pod-br-monitor',
    fileName: '25_monitor_belakang.png',
    src: '/assets/office_props/25_monitor_belakang.png',
    name: 'Monitor Workstation #4',
    category: 'tech',
    left: 34.65,
    top: 47.09,
    width: 3.48,
    height: 4.98,
    sortY: 52.00,
  },

  // ================= STAFF LOUNGE & RELAX ZONE =================
  // Sofa sortY is set at the top backrest (45.2 & 45.0) so Yui (y=47.6) & Miku (y=47.4)
  // sit ON TOP OF (`di atas`) the sofa seat cushions while characters walking behind (y < 45.0) are occluded!
  {
    id: 'prop-lounge-sofa-left',
    fileName: '09_sofa_abu_dua_dudukan.png',
    src: '/assets/office_props/09_sofa_abu_dua_dudukan.png',
    name: 'Sofa Lounge Kiri',
    category: 'furniture',
    left: 56.17,
    top: 43.53,
    width: 6.41,
    height: 6.17,
    sortY: 45.20,
  },
  {
    id: 'prop-lounge-sofa-right',
    fileName: '09_sofa_abu_dua_dudukan.png',
    src: '/assets/office_props/09_sofa_abu_dua_dudukan.png',
    name: 'Sofa Lounge Kanan',
    category: 'furniture',
    left: 64.95,
    top: 43.30,
    width: 6.41,
    height: 6.17,
    sortY: 45.00,
  },
  {
    id: 'prop-lounge-water',
    fileName: '32_dispenser_galon_air.png',
    src: '/assets/office_props/32_dispenser_galon_air.png',
    name: 'Dispenser Air Lounge',
    category: 'appliance',
    left: 75.08,
    top: 41.87,
    width: 2.69,
    height: 10.32,
    sortY: 52.19,
    hotspotCategory: 'coffee',
  },
  {
    id: 'prop-lounge-long-planter',
    fileName: '06_pot_tanaman_panjang.png',
    src: '/assets/office_props/06_pot_tanaman_panjang.png',
    name: 'Pot Tanaman Panjang',
    category: 'plant',
    left: 78.40,
    top: 37.84,
    width: 4.11,
    height: 3.08,
    sortY: 40.93,
  },

  // ================= PANTRY / KITCHENETTE & CAFE TABLE (2.5D Occlusion Sandwich) =================
  {
    id: 'prop-pantry-microwave',
    fileName: '27_microwave_dapur.png',
    src: '/assets/office_props/27_microwave_dapur.png',
    name: 'Microwave Dapur',
    category: 'appliance',
    left: 11.31,
    top: 62.28,
    width: 3.72,
    height: 4.63,
    sortY: 66.90,
  },
  {
    id: 'prop-pantry-espresso',
    fileName: '24_mesin_kopi_kantor.png',
    src: '/assets/office_props/24_mesin_kopi_kantor.png',
    name: 'Mesin Kopi Espresso Kantor',
    category: 'appliance',
    left: 27.45,
    top: 59.67,
    width: 3.01,
    height: 6.52,
    sortY: 66.19,
    hotspotCategory: 'coffee',
  },
  {
    id: 'prop-pantry-fridge',
    fileName: '31_kulkas_mini_abu.png',
    src: '/assets/office_props/31_kulkas_mini_abu.png',
    name: 'Kulkas Pantry',
    category: 'appliance',
    left: 30.46,
    top: 59.91,
    width: 3.09,
    height: 9.25,
    sortY: 69.16,
    hotspotCategory: 'coffee',
  },
  {
    id: 'prop-pantry-coffeemaker',
    fileName: '30_pembuat_kopi_hitam.png',
    src: '/assets/office_props/30_pembuat_kopi_hitam.png',
    name: 'Pembuat Kopi Hitam',
    category: 'appliance',
    left: 33.62,
    top: 62.04,
    width: 2.14,
    height: 5.46,
    sortY: 67.50,
    hotspotCategory: 'coffee',
  },
  // Left cafe chair (sortY = 71.2 -> characters sitting on left chair render ON TOP OF the chair)
  {
    id: 'prop-cafe-chair-left',
    fileName: '10_meja_kafe_bundar_dan_kursi_kiri.png',
    src: '/assets/office_props/10_meja_kafe_bundar_dan_kursi_kiri.png',
    name: 'Kursi Kafe Kiri',
    category: 'furniture',
    left: 9.81,
    top: 69.28,
    width: 7.67,
    height: 8.42,
    sortY: 71.20,
    clipPath: 'inset(0% 58% 0% 0%)',
  },
  // Round cafe tabletop (sortY = 75.2 -> occludes legs tucked under the round table)
  {
    id: 'prop-cafe-table-left',
    fileName: '10_meja_kafe_bundar_dan_kursi_kiri.png',
    src: '/assets/office_props/10_meja_kafe_bundar_dan_kursi_kiri.png',
    name: 'Meja Kafe Bundar Pantry',
    category: 'furniture',
    left: 9.81,
    top: 69.28,
    width: 7.67,
    height: 8.42,
    sortY: 75.20,
    clipPath: 'inset(12% 0% 0% 34%)',
    hotspotCategory: 'coffee',
  },
  // Back-right cafe chair (sortY = 71.2 -> renders BEHIND Sora at y=73.2 so Sora sits ON TOP OF the chair!)
  {
    id: 'prop-cafe-chair-right-back',
    fileName: '11_kursi_kafe_kanan.png',
    src: '/assets/office_props/11_kursi_kafe_kanan.png',
    name: 'Kursi Kafe Kanan Atas',
    category: 'furniture',
    left: 16.77,
    top: 69.28,
    width: 5.22,
    height: 9.02,
    sortY: 71.20,
    clipPath: 'inset(0% 0% 38% 28%)',
    hotspotCategory: 'coffee',
  },
  // Front-bottom cafe chair (sortY = 78.2 -> renders IN FRONT OF characters behind the front chair)
  {
    id: 'prop-cafe-chair-right',
    fileName: '11_kursi_kafe_kanan.png',
    src: '/assets/office_props/11_kursi_kafe_kanan.png',
    name: 'Kursi Kafe Depan',
    category: 'furniture',
    left: 16.77,
    top: 69.28,
    width: 5.22,
    height: 9.02,
    sortY: 78.20,
    clipPath: 'inset(46% 24% 0% 0%)',
    hotspotCategory: 'coffee',
  },

  // ================= ENTRANCE & RECEPTION ROOM (BOTTOM RIGHT) =================
  {
    id: 'prop-entrance-mat',
    fileName: '02_karpet_biru_ikon.png',
    src: '/assets/office_props/02_karpet_biru_ikon.png',
    name: 'Karpet Ikon Korporat',
    category: 'decor',
    left: 45.49,
    top: 71.53,
    width: 7.28,
    height: 7.12,
    sortY: 71.53,
    isFloorMat: true,
  },
  {
    id: 'prop-entrance-plant-left',
    fileName: '39_tanaman_pot_sedang_bawah.png',
    src: '/assets/office_props/39_tanaman_pot_sedang_bawah.png',
    name: 'Tanaman Pot Gerbang Kiri',
    category: 'plant',
    left: 37.82,
    top: 68.09,
    width: 2.77,
    height: 7.47,
    sortY: 75.56,
  },
  {
    id: 'prop-entrance-plant-right',
    fileName: '39_tanaman_pot_sedang_bawah.png',
    src: '/assets/office_props/39_tanaman_pot_sedang_bawah.png',
    name: 'Tanaman Pot Gerbang Kanan',
    category: 'plant',
    left: 56.88,
    top: 67.38,
    width: 3.01,
    height: 8.07,
    sortY: 75.44,
  },
  {
    id: 'prop-reception-painting',
    fileName: '16_bingkai_lukisan_besar.png',
    src: '/assets/office_props/16_bingkai_lukisan_besar.png',
    name: 'Lukisan Galeri Resepsionis',
    category: 'decor',
    left: 62.26,
    top: 60.85,
    width: 4.03,
    height: 6.29,
    sortY: 67.14,
  },
  {
    id: 'prop-reception-bulletin',
    fileName: '45_papan_pengumuman_hijau.png',
    src: '/assets/office_props/45_papan_pengumuman_hijau.png',
    name: 'Papan Pengumuman Hijau',
    category: 'decor',
    left: 81.01,
    top: 61.68,
    width: 5.78,
    height: 6.41,
    sortY: 68.09,
    hotspotCategory: 'bulletin',
  },
  {
    id: 'prop-reception-apar',
    fileName: '48_apar_pemadam_api.png',
    src: '/assets/office_props/48_apar_pemadam_api.png',
    name: 'APAR Pemadam Api',
    category: 'appliance',
    left: 86.08,
    top: 69.40,
    width: 1.50,
    height: 4.86,
    sortY: 74.26,
  },

  // ================= EXTERIOR FOREGROUND COURTYARD TREES =================
  {
    id: 'prop-tree-front-left',
    fileName: '36_pohon_pot_besar_kiri.png',
    src: '/assets/office_props/36_pohon_pot_besar_kiri.png',
    name: 'Pohon Pot Besar Kiri',
    category: 'plant',
    left: 33.78,
    top: 83.63,
    width: 4.51,
    height: 11.98,
    sortY: 95.61,
  },
  {
    id: 'prop-tree-front-right',
    fileName: '37_pohon_pot_besar_kanan.png',
    src: '/assets/office_props/37_pohon_pot_besar_kanan.png',
    name: 'Pohon Pot Besar Kanan',
    category: 'plant',
    left: 58.47,
    top: 79.60,
    width: 4.19,
    height: 11.27,
    sortY: 90.87,
  },
];

export interface SurfaceOccluderSlice {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  sortY: number;
}

/**
 * Exact 2.5D tabletop & glass partition slices on the 1264x843 background.
 * These cover ONLY the wooden tabletops / glass walls (stopping above front-row chairs!)
 * so characters sitting on back chairs have their lower body occluded by the table,
 * while characters sitting on front chairs sit ON TOP OF (`di atas`) their chairs!
 */
export const OFFICE_25D_SURFACE_OCCLUDERS: SurfaceOccluderSlice[] = [
  // Open-Office 4 Wooden Desk Tabletops (excludes back chair backrests & front swivel chairs)
  { id: 'occ-desk-tl', name: 'Meja Kerja Pod Kiri Atas', left: 16.5, top: 35.8, width: 10.8, height: 3.4, sortY: 38.0 },
  { id: 'occ-desk-tr', name: 'Meja Kerja Pod Kanan Atas', left: 30.8, top: 35.8, width: 10.6, height: 3.4, sortY: 38.0 },
  { id: 'occ-desk-bl', name: 'Meja Kerja Pod Kiri Bawah', left: 16.2, top: 49.2, width: 11.0, height: 3.5, sortY: 51.6 },
  { id: 'occ-desk-br', name: 'Meja Kerja Pod Kanan Bawah', left: 30.8, top: 49.2, width: 10.8, height: 3.5, sortY: 51.6 },
  // Meeting Room Wooden Conference Tabletop (occludes lower body of top-row seats at y=22.2)
  { id: 'occ-meeting-table', name: 'Meja Rapat Konferensi', left: 52.5, top: 22.4, width: 13.5, height: 6.1, sortY: 28.4 },
  // Meeting Room Bottom Glass Wall
  { id: 'occ-meeting-glass', name: 'Partisi Kaca Ruang Rapat', left: 48.2, top: 32.8, width: 20.4, height: 4.4, sortY: 36.8 },
  // Lounge Wooden Coffee Table
  { id: 'occ-lounge-table', name: 'Meja Kopi Lounge', left: 58.6, top: 51.4, width: 8.6, height: 5.2, sortY: 56.2 },
];

