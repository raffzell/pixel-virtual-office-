import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch {
    return null;
  }
}

// 15 Character definitions matching the user roster
interface AgentInfo {
  id: string;
  name: string;
  role: string;
  personality: string;
  specialty: string;
}

const AGENT_PROFILES: Record<string, AgentInfo> = {
  '01': { id: '01', name: 'RaffZell', role: 'Office Lead & AI Manager', personality: 'Bijaksana, ramah, kepemimpinan tenang, selalu siap membantu', specialty: 'Orkestrasi sistem, manajemen tugas tim, panduan umum' },
  '02': { id: '02', name: 'Sora', role: 'UI/UX & Product Designer', personality: 'Kreatif, estetis, penuh ide visual modern dan ramah pengguna', specialty: 'Desain visual, micro-interactions, wireframing, estetika pixel' },
  '03': { id: '03', name: 'Hana', role: 'Research Analyst & Knowledge Bot', personality: 'Teliti, analitis, suka membaca dokumentasi dan data', specialty: 'Riset mendalam, ekstraksi insight, data synthesis' },
  '04': { id: '04', name: 'Rina', role: 'Frontend Specialist', personality: 'Enerjik, gesit, suka animasi halus dan komponen rapi', specialty: 'React, Tailwind CSS, TypeScript, Motion UI' },
  '05': { id: '05', name: 'Kaito', role: 'DevOps & Cloud Engineer', personality: 'Santai bertopi hoodie, pragmatis, penjaga stabilitas server', specialty: 'Docker, CI/CD pipelines, Kubernetes, monitoring' },
  '06': { id: '06', name: 'Mei', role: 'Chief Systems Architect', personality: 'Jenius dengan jas lab, analitis tinggi, perfeksionis arsitektur', specialty: 'Desain sistem skalabel, algoritma efisien, code audit' },
  '07': { id: '07', name: 'Ren', role: 'Business Strategy & Finance', personality: 'Formal berjas rapi, fokus pada metrik bisnis dan efisiensi', specialty: 'Analisis ROI, roadmap produk, valuasi token' },
  '08': { id: '08', name: 'Ayaka', role: 'QA & Test Automation Lead', personality: 'Kritis, teliti, pemburu bug tanpa ampun namun ceria', specialty: 'E2E testing, unit testing, bug tracking, edge cases' },
  '09': { id: '09', name: 'Tsubasa', role: 'Security & Fullstack Hacker', personality: 'Suka kopi hitam, cepat tanggap terhadap celah keamanan', specialty: 'Penetration testing, API hardening, token auth' },
  '10': { id: '10', name: 'Yui', role: 'Customer Success & Support', personality: 'Empatis, sabar, ramah mendengarkan keluhan pengguna', specialty: 'Komunikasi publik, user onboarding, troubleshooting' },
  '11': { id: '11', name: 'Daichi', role: 'Database & Data Architect', personality: 'Kuat dan stabil, mencintai SQL teroptimasi dan indexing', specialty: 'PostgreSQL, NoSQL indexing, query tuning, data lakes' },
  '12': { id: '12', name: 'Miku', role: 'Media, Audio & Live Comms', personality: 'Selalu memakai headphone, ceria, ahli presentasi audio visual', specialty: 'Audio synthesis, media processing, real-time voice' },
  '13': { id: '13', name: 'Natsuki', role: 'Marketing & Content Growth', personality: 'Ekspresif dengan rambut twin bun, paham tren digital terkini', specialty: 'Copywriting, viral growth, kampanye sosial' },
  '14': { id: '14', name: 'Haruto', role: 'Backend Services & API', personality: 'Praktis, fokus pada latency rendah dan REST/gRPC handal', specialty: 'Microservices, REST APIs, GraphQL, caching' },
  '15': { id: '15', name: 'Aoi', role: 'Compliance & Legal AI', personality: 'Tenang, teliti membaca regulasi dan tata kelola etika AI', specialty: 'Data privacy, AI governance, regulasi keamanan' },
};

// API: Agent Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { agentId = '01', userMessage, history = [], officeContext = {} } = req.body;
    const agent = AGENT_PROFILES[agentId] || AGENT_PROFILES['01'];

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const systemPrompt = `Kamu adalah ${agent.name}, agen AI di kantor virtual "RaffZell Corporation" (berbasis konsep Hermes 2D RPG Virtual Office).
Role: ${agent.role}
Kepribadian: ${agent.personality}
Keahlian Utama: ${agent.specialty}
Konteks Kantor Saat Ini:
- Waktu: ${officeContext.time || '09:00'}
- Cuaca: ${officeContext.weather || 'Cerah'}
- Status Kantor: Berjalan aktif dengan 15 AI agent.

Gaya Komunikasi:
- Berbicaralah dalam bahasa Indonesia yang ramah, natural, dan sedikit sentuhan nuansa JRPG / simulasi kantor yang seru.
- Tetap profesional sesuai bidangmu (${agent.specialty}).
- Berikan jawaban yang ringkas (2-4 kalimat) agar pas dengan format kotak dialog RPG retro, kecuali jika diminta menjelaskan kode/analisis secara detail.
- Jangan gunakan formatting markdown berlebih (seperti heading besar) yang merusak kotak teks RPG.`;

    const aiClient = getAiClient();
    if (aiClient) {
      try {
        const formattedContents = [
          ...history.slice(-6).map((h: { sender: string; text: string }) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ];

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 350,
          },
        });

        const replyText =
          response?.text || `Siap! Saya ${agent.name} akan segera memproses ini untuk kantor.`;
        return res.json({
          reply: replyText.trim(),
          agent: agent.name,
          role: agent.role,
          mood: 'happy',
        });
      } catch {
        // Silently fall back to local agent persona response
      }
    }

    // Fallback if GEMINI_API_KEY is not configured or unavailable
    const simulatedReplies: Record<string, string[]> = {
      '01': [
        `Halo! Sebagai Office Lead, saya pastikan koordinasi tugas kita berjalan mulus. Ada proyek yang perlu kita prioritaskan hari ini?`,
        `Siap, instruksi dicatat! Saya akan instruksikan tim di workstation untuk langsung bergerak.`,
      ],
      '06': [
        `Arsitektur sistem sudah saya telaah. Dari segi skalabilitas, kita bisa mengisolasi microservices ini agar throughput tetap tinggi.`,
        `Menurut analisa teknis saya, pendekatan modular ini paling minim latency. Mau saya buatkan diagramnya di whiteboard?`,
      ],
      '02': [
        `Dari segi estetika UI dan flow pengguna, komposisi warna slate dan aksen neon biru ini sangat intuitif. Mari kita poles micro-interactions-nya!`,
      ],
      '05': [
        `Container Docker sudah stabil di cluster. Build pipeline selesai dalam 42 detik tanpa alert error. Santai aja, infra aman!`,
      ],
    };

    const pool = simulatedReplies[agent.id] || [
      `Halo! Saya ${agent.name} (${agent.role}). Siap berkontribusi maksimal untuk RaffZell Corporation! Ada yang bisa saya bantu?`,
      `Tugas dipahami! Saya akan selesaikan dengan teliti di meja kerja saya sekarang.`,
    ];
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return res.json({
      reply: picked,
      agent: agent.name,
      role: agent.role,
      mood: 'happy',
    });
  } catch (error) {
    res.status(500).json({
      reply: 'Maaf, sambungan neural agent sedang buffering sejenak. Namun tugasmu tetap tersimpan!',
      error: String(error),
    });
  }
});

// API: Agent-to-Agent Meeting Brainstorming
app.post('/api/meeting', async (req, res) => {
  try {
    const {
      topic = 'Optimasi Performa & Rilis Fitur Baru',
      participants = ['01', '06', '02', '05'],
    } = req.body;

    const roster: AgentInfo[] = (participants as string[]).map(
      (id: string) => AGENT_PROFILES[id] || AGENT_PROFILES['01']
    );

    const prompt = `Simulasikan rapat tim singkat antara AI Agent berikut di ruang rapat RaffZell Corporation:
Peserta:
${roster.map((p: AgentInfo) => `- ID "${p.id}": ${p.name} (${p.role})`).join('\n')}

Topik Rapat: "${topic}"

Buatlah 4 giliran bicara (turns) singkat dalam Bahasa Indonesia (masing-masing 1-2 kalimat) di mana mereka berdiskusi sesuai peran dan mencapai kesepakatan.`;

    const aiClient = getAiClient();
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  id: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                },
                required: ['speaker', 'id', 'dialogue'],
              },
            },
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        const parsed = JSON.parse(response?.text || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ turns: parsed, topic });
        }
      } catch {
        // Silently fall back to contextual local simulation if API call fails
      }
    }

    // Contextual fallback turns tailored to the selected participants & topic
    const fallbackTurns = [
      {
        speaker: roster[0].name,
        id: roster[0].id,
        dialogue: `Baik rekan-rekan, mari kita mulai rapat koordinasi mengenai "${topic}".`,
      },
      {
        speaker: roster[1]?.name || 'Mei',
        id: roster[1]?.id || '06',
        dialogue: `Dari sisi ${roster[1]?.role || 'arsitektur'}, struktur modul saat ini sudah sangat solid dan siap kita optimalkan lebih lanjut.`,
      },
      {
        speaker: roster[2]?.name || 'Sora',
        id: roster[2]?.id || '02',
        dialogue: `Setuju! Untuk mendukung "${topic}", saya sudah menyiapkan peningkatan alur kerja agar eksekusi tim semakin mulus.`,
      },
      {
        speaker: roster[3]?.name || 'Kaito',
        id: roster[3]?.id || '05',
        dialogue: `Pipeline deployment dan monitoring server sudah siap 100% mengawal rilis ini tanpa kendala.`,
      },
      {
        speaker: roster[0].name,
        id: roster[0].id,
        dialogue: `Konsensus tercapai! Mari kita kembali ke meja kerja masing-masing dan eksekusi action items hari ini.`,
      },
    ];

    return res.json({ turns: fallbackTurns, topic });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// API: Agent Terminal Execution (Hermes Screen Peek)
app.post('/api/terminal-peek', async (req, res) => {
  try {
    const { agentId = '06', taskName = 'Code Refactoring & Build' } = req.body;
    const agent = AGENT_PROFILES[agentId] || AGENT_PROFILES['06'];

    const timestamp = new Date().toISOString();
    const logs = [
      `[${timestamp}] [Hermes-Agent-Core v2.4] Initialized agent: ${agent.name} (${agent.role})`,
      `[${timestamp}] [Workspace] Checked out branch feature/agent-${agentId}-task`,
      `[${timestamp}] [Analyzer] Scanning codebase AST and dependencies...`,
      `[${timestamp}] [Execute] Running command: hermes run --agent=${agent.name.toLowerCase()} --task="${taskName}"`,
      `[${timestamp}] [Status: 200 OK] 14 modules compiled successfully in 312ms.`,
      `[${timestamp}] [Hermes] Memory footprint: 48.2MB | CPU Load: 12% | All test suites passing (48/48).`,
      `[${timestamp}] [Commit] 9f2d1a3: "${agent.name}: Completed sprint milestone for ${taskName}"`,
      `[${timestamp}] [Agent State] Ready for next prompt or user review.`,
    ];

    return res.json({ agent, logs, taskName });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hermes 2D RPG Virtual Office Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
