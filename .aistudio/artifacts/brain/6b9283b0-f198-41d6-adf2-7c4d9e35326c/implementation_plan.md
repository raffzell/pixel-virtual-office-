# Integrasi & Penyempurnaan 15 Spritesheet Karakter (`Virtual_Office_Spritesheets`)

Pembaruan ini mengintegrasikan 15 aset spritesheet karakter pixel-art baru (`96×184 px` per frame, 6 kolom × 16 baris sesuai `atlas.json`) sebagai sistem render utama di dalam kantor virtual 2.5D, dilengkapi pembersihan artefak piksel otomatis, penyesuaian postur duduk alami di atas kursi/sofa, serta animasi napas halus saat diam (`idle`).

## User Review & Critical Decisions

> [!IMPORTANT]
> Seluruh preferensi perbaikan visual dan mode tampilan karakter dari tahap klarifikasi telah dikonfirmasi dan menjadi dasar arsitektur rencana ini:

- **Confirmed Decision 1 (Pembersihan Artefak & Piksel Liar Otomatis)**: Menerapkan filter *connected-component / border-speck removal* serta *de-fringing* pada setiap frame `96×184 px` untuk menghapus garis tepi sisa potongan, titik piksel liar di sekitar kepala/tangan, dan halo ungu muda di luar outline karakter.
- **Confirmed Decision 2 (Adaptasi Postur Duduk di Kursi & Sofa)**: Memperbaiki baris mengetik (`typing_front`, `typing_back`, `typing_right`, `typing_left`) yang pada spritesheet mentah masih berdiri tegak dengan memendekkan/menekuk porsi tungkai bawah secara proporsional serta menyelaraskan titik tumpu duduk (`y=179`) agar karakter benar-benar tampak duduk di atas bantalan kursi atau sofa.
- **Confirmed Decision 3 (Efek Napas Halus pada Pose `idle`)**: Menambahkan ritme *idle breathing* (ayunan torso atas 1 piksel yang halus) pada baris `idle_*` yang hanya memiliki 1 frame statis agar karakter terlihat hidup saat berdiri.
- **Confirmed Decision 4 (Mode Spritesheet Baru sebagai Default + Simpan Mode Lama)**: Menjadikan **Spritesheet HD Baru (`spritesheet_hd`)** sebagai mode utama aplikasi, sambil tetap menyimpan mode **Potongan Roster Asli (`roster_transparent`)** dan **Animasi Prosedural 2D (`animated`)** di menu Pengaturan dan toolbar kamera.

---

## 1. Overview & Core Concept

- **What It Does**: Menggantikan sistem tampilan karakter utama dengan mesin pembaca *atlas spritesheet* 16-baris untuk ke-15 agen AI dan avatar pemain (`01_RaffZell` hingga `15_Aoi`), lengkap dengan *post-processing* kanvas otomatis yang memperbaiki kekurangan pada file spritesheet mentah.
- **Target Audience / Persona**: Pengguna simulasi manajemen kantor AI bergaya RPG 2.5D yang menginginkan kualitas animasi pixel-art yang tajam, bersih dari artefak potongan, dan sinkron saat karakter berjalan, mengetik di kursi kerja, duduk di sofa, maupun minum kopi di pantry.
- **Key Value**: Karakter memiliki animasi multi-frame asli (`walk` 4 frame @ 8 FPS, `typing` 4 frame @ 6 FPS, `coffee` 6 frame @ 5 FPS, `idle` + *breathing*) yang bersih, proporsional dengan meja/kursi 32-bit HD, dan bebas dari piksel liar.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Eksplorasi Kantor 2.5D**: Saat aplikasi dibuka, ke-15 agen AI dan karakter pemain langsung dirender menggunakan **Spritesheet HD Baru (`spritesheet_hd`)** dengan animasi spesifik sesuai aktivitas (`walking`, `sitting_typing`, `drinking_coffee`, `standing`).
  2. **Sinkronisasi Postur Duduk & Kedalaman 2.5D**:
     - Agen yang duduk di kursi putar depan atau sofa lounge tampak menekuk lutut dan duduk pas di atas bantalan kursi/sofa.
     - Agen yang duduk di kursi belakang meja kerja, meja manajer eksekutif, atau baris atas meja rapat memiliki postur duduk yang tertutupi meja secara alami dari pinggang ke bawah.
  3. **Pergantian Mode Sprite**: Pengguna dapat beralih kapan saja antara `Spritesheet HD (Baru)`, `Roster Asli`, dan `Animasi 2D` melalui tombol cepat di toolbar kiri-atas peta maupun melalui modal Pengaturan.
  4. **Potret & Avatar Konsisten**: Avatar karakter pada kotak dialog JRPG, daftar 15 agen (*Agent Roster*), dan kartu tugas mengambil frame `idle_front` yang telah dibersihkan dari spritesheet baru sehingga seragam di seluruh antarmuka.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: *Crisp 32-Bit Isometric/Top-Down Pixel-Art RPG Simulation* (`image-rendering: pixelated` tanpa blur).
  - *Color Palette & Mood*: Kanvas utama `#161925` (60%), panel HUD slate gelap `#0f172a` / `#1e293b` (30%), dengan aksen interaksi cyan `#38bdf8`, amber `#f59e0b`, dan emerald `#10b981` (10%).
  - *Typography & Hierarchy*: Font UI yang tegas dan mudah dibaca dengan pemisah teks bersih tanpa tumpukan *pill badge* berlebihan, serta angka metrik menggunakan `tabular-nums`.
  - *Component Styling & Layout*: Viewport kantor interaktif mengambil porsi utama layar dengan HUD mengambang yang ringkas, kontrol satu baris (`whitespace-nowrap`), dan label nama agen yang diposisikan akurat mengikuti tinggi aktual kepala karakter (`y ≈ 34px` pada frame `96×184 px`).

- **Interactive Feedback & Motion**:
  - Transisi frame berjalan pada kecepatan asli `atlas.json` (`walk`: 8 FPS, `typing`: 6 FPS + partikel piksel ketikan halus, `coffee`: 5 FPS + uap kopi piksel naik).
  - Ketika karakter berhenti berjalan di meja kerja, animasi otomatis berpindah mulus dari `walk_*` ke `typing_*` dengan postur duduk sesuai arah hadap kursi (`deskFacing`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pembersihan Piksel Liar & *Sitting-Posture Synthesis* di Memori Kanvas**
  - *Chosen Approach*: Memproses setiap spritesheet satu kali saat dimuat (*lazy-cached per frame*) menggunakan algoritma pembersihan piksel terisolasi (menghapus pulau piksel `< 6 px` yang terpisah dari siluet utama karakter serta piksel tepi kolom `x ≤ 2` atau `x ≥ 93`) dan transformasi postur duduk untuk state `sitting_typing`.
  - *Why*: Menjaga file aset asli tetap utuh sekaligus menghilangkan garis bocor di tepi frame (seperti pada spritesheet Mei, Sora, dan Ren) dan mengatasi masalah karakter yang tampak berdiri kaku di atas kursi saat mengetik.
  - *Alternatives Considered*: Merender gambar mentah secara langsung menggunakan tag `<img>` atau CSS `background-position`—ditolak karena tidak dapat membersihkan titik piksel liar dan membuat karakter terlihat berdiri di atas kursi.

- **Decision 2: Normalisasi *Bounding Box* & Titik Pijakan (`x=48, y=179`)**
  - *Chosen Approach*: Memangkas ruang kosong berlebih di bagian atas frame (`y: 0..28`) saat merender ke kanvas karakter dan mengunci titik pijakan kaki tepat di `y=179` (`origin bawah-tengah`).
  - *Why*: Dalam frame `96×184 px`, tinggi karakter sebenarnya adalah `~145 px` (`y=34` s/d `y=179`). Dengan menormalisasi ruang atas, ukuran visual karakter di peta tetap proporsional terhadap meja/kursi dan balon nama tidak melayang terlalu jauh di atas kepala.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 Virtual Office 15-Character Atlas Assets                 │
│   /assets/Virtual_Office_Spritesheets/atlas.json + 15 PNG Spritesheets   │
│         (576×2944 px per sheet · 6 cols × 16 rows · 96×184 cell)         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│            Sprite Atlas & Frame Sanitizer Engine (In-Memory Cache)       │
│  1. Border & Stray Speck Cleaner (removes edge bleed & isolated dots)    │
│  2. Halo De-Fringer (cleans lavender-white anti-aliased border pixels)   │
│  3. Posture Transformer:                                                 │
│     • walk_*   (4 frames @ 8 FPS, foot-anchored at x=48, y=179)          │
│     • typing_* (4 frames @ 6 FPS + seated knee-tuck & seat-drop offset)  │
│     • coffee_* (6 frames @ 5 FPS + rising pixel steam particles)         │
│     • idle_*   (1 frame + 1px rhythmic upper-torso idle breathing)       │
└───────────────────┬──────────────────────────────────┬───────────────────┘
                    │                                  │
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌────────────────────────────────┐
│   2.5D Office World Canvas Layer     │  │   UI Portrait & Roster Modals  │
│ • Y-Sorted against 32-Bit HD Props   │  │ • JRPG Dialogue Box Portrait   │
│ • Tabletop & Chair-Back Sandwich     │  │ • 15-Agent Roster Cards        │
│ • Floating Name & Banter Bubble UI   │  │ • Top-Left Mode Switcher &     │
│ • A* Doorway & Raycast Wall Physics  │  │   Settings Modal (3 Modes)     │
└──────────────────────────────────────┘  └────────────────────────────────┘
```

- **Data Model & State**:
  - `SpriteRenderMode`: Diperluas menjadi `'spritesheet_hd' | 'roster_transparent' | 'animated'`, dengan nilai awal `'spritesheet_hd'`.
  - Pemetaan baris `atlas.json` (`0` s/d `15`):
    - `standing` (`idle`): `down → row 0`, `up → row 1`, `right → row 2`, `left → row 3` (`1 frame` + *idle breathing*).
    - `walking` (`walk`): `down → row 4`, `up → row 5`, `right → row 6`, `left → row 7` (`4 frames @ 8 FPS`).
    - `sitting_typing` (`typing`): `down → row 8`, `up → row 9`, `right → row 10`, `left → row 11` (`4 frames @ 6 FPS` + *seated leg-tuck transformation*).
    - `drinking_coffee` (`coffee`): `down → row 12`, `up → row 13`, `right → row 14`, `left → row 15` (`6 frames @ 5 FPS` + uap kopi).

- **Interactive Component & State Mapping**:
  - **Toolbar Kamera & Modal Pengaturan**: Menyediakan tombol pemilih 3 mode (`Spritesheet HD`, `Roster Asli`, `Animasi 2D`) yang langsung memperbarui state `spriteMode` tanpa memuat ulang halaman.
  - **Sinkronisasi Kursi & Meja 2.5D**: Saat karakter berstatus `working` tiba di kursi kerja (`deskPos`) atau ruang rapat (`MEETING_SEATS`), pose otomatis berubah ke `sitting_typing` dengan transformasi duduk sehingga menyatu dengan layer kursi dan meja 32-bit HD.
