# 🎮 Hermes 2D RPG Virtual Office: Prompt & Design System Specification

Spesifikasi dan panduan pembuatan prompt visual (Image Generation AI) serta prompt arsitektur kode (LLM / Developer Prompt) untuk memigrasikan konsep [JuniorXcoder/hermes-virtual-office](https://github.com/JuniorXcoder/hermes-virtual-office) dari 3D Three.js ke **2D Top-Down Japanese RPG (Chibi Pixel-Art)** persis seperti referensi visual `RaffZell Corporation`.

---

## 📑 Daftar Isi
1. [Analisis Visual & Gaya Referensi](#1-analisis-visual--gaya-referensi)
2. [Prompt Generator Gambar (AI Image Prompts)](#2-prompt-generator-gambar-ai-image-prompts)
   - 2.1 Complete Office Map & Environment
   - 2.2 Chibi Character Sprite Sheet (4 Directions)
   - 2.3 RPG Dialogue Box & UI Assets
   - 2.4 Office Isometric/Top-Down Furniture Tileset
3. [Arsitektur Teknis & Mapping AI Agent](#3-arsitektur-teknis--mapping-ai-agent)
4. [Prompt Fullstack Coding (Next.js + Phaser 3 + Hermes CLI/API)](#4-prompt-fullstack-coding)

---

## 1. Analisis Visual & Gaya Referensi

Mengacu pada screenshot referensi:
* **Perspektif**: 2D Top-Down (Semi-elevated $3/4$ perspective khas JRPG klasik/RPG Maker).
* **Art Style**: Crisp modern pixel art / 16-bit to 32-bit aesthetic, clean line art, soft muted business tones (abu-abu, biru navy, aksen kayu natural dan tanaman hijau).
* **Zonasi Ruangan**:
  * **Main Open Office / Work Cubicles**: Meja kubikel berpasangan, PC monitor CRT/flat, printer, water dispenser.
  * **Meeting Room**: Meja rapat panjang di balik kaca transparan dengan kursi berjejer.
  * **Executive / Private Room**: Meja pimpinan dengan lemari buku dan jendela view luar.
  * **Lounge / Break Area**: Sofa set, coffee table, dispenser, dan kasur tidur kucing peliharaan.
  * **Pantry / Kitchenette**: Counter dapur, kulkas, microwave, meja makan bundar kecil.
  * **Entrance / Security**: Turnstile gate, logo karpet penerima tamu, papan informasi.
* **UI Overlay**:
  * Top bar: Profil avatar, Level, Job Title, Exp Bar, Coin, Diamond, Jam/Hari, Status Cuaca, Setting/Mail icons.
  * Right Sidebar: To-Do List / Kanban tasks tracker dengan checkbox & progress bar.
  * Bottom Overlay: JRPG Dialogue Box dengan avatar portrait resolusi tinggi, nama pembicara, teks typewriter, dan indikator cursor lanjut (`▼`).
  * Bottom Right: Minimap radar interaktif yang menandai posisi user dan agen AI.

---

## 2. Prompt Generator Gambar (AI Image Prompts)

Gunakan prompt di bawah ini untuk Midjourney v6, FLUX.1, Stable Diffusion XL, atau DALL-E 3.

### 2.1 Complete Office Map & Environment (Full Layout)
> Gunakan prompt ini untuk menghasilkan blueprint visual atau background pre-rendered.

```text
Prompt:
A top-down 2D pixel-art office simulation interior, Japanese RPG game style, 32-bit pixel aesthetic, clean and crisp detailing. Detailed layout featuring distinct connected zones: a modern open-plan workstation area with multiple employee desks and desktop computers, an executive private glass office, a corporate conference meeting room with long wooden table, a cozy staff lounge with sofas and a sleeping cat in a pet bed, and a pantry kitchen with coffee maker and refrigerator. Pixel-art office props including water dispensers, potted houseplants, bookshelves, server racks, and vending machines. Muted corporate palette with slate gray tiles, warm wood accents, and soft overhead ambient lighting. High quality retro game background, RPG Maker MV style, orthogonal 2D top-down perspective, orthographic view --ar 16:9 --v 6.1 --stylize 250
```

---

### 2.2 Chibi Character Sprite Sheet (4 Directions)
> Mengacu pada roster 15 karakter di referensi, menghasilkan template sprite sheet untuk animasi berjalan (Walking Cycle).

```text
Prompt:
A full 2D pixel-art character sprite turnaround sheet, Japanese anime chibi RPG style. Four distinct viewing angles: front view, right profile view, back view, and left profile view. The character is a cute chibi Japanese IT office employee with clean modern anime hairstyle, stylish glasses, wearing a crisp business casual suit with collared shirt, tie, and trousers. 32-bit pixel art, uniform proportions, clean isolated white background, pixel color palette swatch included on the side, perfect for 2D game walk-cycle animation and sprite rigging, clean borders --ar 3:2 --v 6.1 --stylize 200
```

*Varian Kostum / Karakter:*
* **Casual Developer**: `wearing an open dark hoodie, graphic tee, and headphones around neck`.
* **Lead Architect**: `wearing a white tech lab coat over formal attire with glasses`.
* **Project Manager**: `chibi female office worker with twin-tails hair, corporate vest, and pleated skirt`.

---

### 2.3 RPG Dialogue Box & UI Assets
> Menghasilkan aset UI retro-modern untuk berinteraksi dengan AI Agent.

```text
Prompt:
2D Japanese RPG pixel-art UI kit, modern virtual office theme. Includes: a deep blue semi-transparent text dialogue box with clean white rounded borders and a downward blinking prompt arrow; a large expressive chibi anime portrait headshot inside a sleek frame; an office status HUD bar with clock, weather icon, coin and gem counters, player level badge, and an interactive quest checklist box with sleek progress bar. Clean vector-like pixel art, 9-slice UI panel design, flat game UI design, isolated on neutral dark background --ar 16:9 --v 6.1
```

---

### 2.4 Office Isometric/Top-Down Furniture Tileset
> Untuk dipotong menjadi modular spritesheet (32x32 atau 48x48 px) di game engine (Phaser / Tiled Map Editor).

```text
Prompt:
2D top-down pixel-art tile set sheet for a modern Japanese game office interior. Modular 32x32 grid items: modular wooden desks, dual-monitor PC setups, ergonomic office chairs (facing up, down, left, right), conference table segments, coffee machine, office water cooler, potted ficus plants, office sofa, whiteboards with task diagrams, glass partition walls, and tiled floor textures. Clean grid separation, RPG Maker compatible, crisp pixel outlines, isolated on a light gray grid --ar 1:1 --v 6.1
```

---

## 3. Arsitektur Teknis & Mapping AI Agent

Untuk menggantikan rendering 3D Three.js bawaan Hermes Virtual Office dengan engine 2D:

| Komponen 3D Asli (Hermes) | Pengganti 2D Top-Down JRPG | Teknologi Rekomendasi |
| :--- | :--- | :--- |
| **Canvas Three.js / R3F** | HTML5 Canvas 2D via Phaser 3 atau Pixi.js | `@phaserjs/react` atau `pixi-react` |
| **3D GLTF Avatars** | 2D Chibi Animated Sprites (Walk, Sit, Type) | Spritesheet JSON (Aseprite / TexturePacker) |
| **Room Models** | 2D Orthographic Tilemap (`.json` + tileset `.png`) | Tiled Map Editor |
| **Hermes A2A Meetings** | Event trigger saat agen berjalan ke Meeting Room | State Machine (`IDLE` $\rightarrow$ `WALKING` $\rightarrow$ `IN_MEETING`) |
| **Live Screen-Peeking** | Pop-up modal retro JRPG menampilkan CLI terminal / browser screen | Xterm.js / Tailwind Glassmorphism Modal |
| **Agent Profile / Doctor** | JRPG Dialogue Box + Karakter Portrait & Status Card | React Overlay UI synced with SSE / WebSocket |

---

## 4. Prompt Fullstack Coding (Next.js + Phaser 3 + Hermes)

Gunakan prompt di bawah ini untuk menginstruksikan LLM/AI Coding Assistant (Claude 3.5 Sonnet / GPT-4o / Cursor) dalam membangun aplikasi:

```markdown
Anda adalah Senior Game Developer & Frontend Engineer ahli dalam Next.js (App Router), TypeScript, Tailwind CSS, dan Phaser 3.

TUGAS:
Ubah arsitektur 3D dari repository `JuniorXcoder/hermes-virtual-office` menjadi Virtual Office berbasis 2D Top-Down Japanese RPG Sim menggunakan Phaser 3 yang di-embed ke dalam Next.js.

PERSYARATAN FITUR & VISUAL:
1. Engine 2D & Map:
   - Gunakan Phaser 3 (atau Canvas 2D teroptimasi) di dalam container React.
   - Buat representasi layout kantor: Open Workspace (Desks), Meeting Room, Executive Room, Lounge (dengan Sofa), Kitchen/Pantry, dan Entrance.
   - Sistem pergerakan karakter Chibi dengan Pathfinding sederhana (A* atau waypoint) menuju meja kerja atau ruang meeting.

2. Hermes AI Agent Integration:
   - Hubungkan ke Hermes CLI / Agent runtime via REST API / WebSocket.
   - Setiap AI Agent direpresentasikan oleh satu karakter NPC Chibi.
   - Status Agent:
     * 'idle': duduk di meja atau santai di lounge.
     * 'thinking/executing': efek animasi mengetik di laptop/PC dengan bubble icon di atas kepala.
     * 'meeting': agen bergerak menuju Meeting Room saat ada sesi A2A (Agent-to-Agent).

3. RPG UI Layer (React Overlay):
   - Top Bar: Player profile/level, Gold/Tokens, Time, Weather, Settings.
   - Right Sidebar: To-Do List yang tersinkronisasi dengan Hermes Kanban tasks.
   - Bottom JRPG Dialogue Box: Saat user mengklik salah satu AI Agent, tampilkan dialog box RPG dengan portrait chibi besar, nama agen, bubble chat typewriter, dan opsi input teks/perintah suara untuk berinteraksi langsung.
   - Minimap interaktif di pojok kanan bawah yang menunjukkan blip posisi agent.

Berikan kode implementasi modular dengan komponen React utama, konfigurasi scene Phaser, dan state manager untuk sinkronisasi agen Hermes.
```