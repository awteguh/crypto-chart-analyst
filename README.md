# 📊 Crypto Chart Analyst

> Upload screenshot chart crypto — AI mendeteksi pattern & memprediksi pump/dump

Aplikasi web berbasis AI yang menganalisis screenshot chart cryptocurrency secara otomatis. Deteksi chart pattern, level support/resistance, sinyal trading, dan prediksi arah candle berikutnya — semua dari satu gambar.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Free-4285f4?logo=google&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-Free-ff6b35)

---

## ✨ Fitur

- **🤖 Multi-AI Engine** — Gemini, OpenRouter (100+ model), Claude, atau rule-based fallback otomatis
- **📈 Deteksi Chart Pattern** — Double Top/Bottom, Head & Shoulders, Triangle, Wedge, Flag, Pennant, Cup & Handle, dan candlestick pattern
- **🎯 Overlay Visual** — Garis pattern, level Entry/TP/SL, dan panah arah harga digambar langsung di atas chart
- **📊 Pump/Dump Meter** — Probabilitas pump vs dump dengan validasi konsistensi otomatis
- **🔀 Multi-Timeframe (MTF)** — Upload hingga 4 chart (15m, 1h, 4h, 1D) sekaligus untuk analisis konfluensi
- **⚡ Engine Fallback Chain** — Jika satu engine rate-limited, otomatis coba engine berikutnya
- **✅ Consistency Validator** — Koreksi otomatis jika AI memberi sinyal yang inkonsisten (mis. Double Top tapi pump > dump)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/awteguh/crypto-chart-analyst.git
cd crypto-chart-analyst
npm install
```

### 2. Setup API Key

Copy file contoh:

```bash
cp .env.example .env.local
```

Isi minimal **satu** API key di `.env.local`:

```env
# Pilih salah satu (atau lebih). Prioritas: Gemini → OpenRouter → Claude → rule-based

# Google Gemini — GRATIS, dapat di https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OpenRouter — akses 100+ model via satu key, https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Anthropic Claude — berbayar, https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 🤖 AI Engine

Sistem menggunakan **priority chain** — engine pertama yang berhasil akan dipakai, sisanya sebagai fallback otomatis:

| Prioritas | Engine | API Key | Biaya |
|-----------|--------|---------|-------|
| 1 | **Gemini 2.5 Flash Lite** | `GEMINI_API_KEY` | 🆓 Gratis |
| 2 | **Gemini 2.5 Flash** | `GEMINI_API_KEY` | 🆓 Gratis (fallback jika lite 503) |
| 3 | **OpenRouter** `google/gemma-4-31b-it:free` | `OPENROUTER_API_KEY` | 🆓 Gratis |
| 4 | **OpenRouter** `google/gemma-4-26b-a4b-it:free` | `OPENROUTER_API_KEY` | 🆓 Gratis |
| 5 | **Claude** (claude-opus-4) | `ANTHROPIC_API_KEY` | 💰 Berbayar |
| 6 | **Rule-based** (analisis warna pixel) | — | 🆓 Gratis, akurasi terbatas |

> **Rekomendasi:** Cukup set `GEMINI_API_KEY` untuk penggunaan normal. OpenRouter berfungsi sebagai backup otomatis jika Gemini sedang overload.

Ganti model OpenRouter default lewat env:

```env
OPENROUTER_MODEL=google/gemma-4-31b-it:free
```

---

## 📐 Cara Kerja

```
Upload chart PNG / JPG / WEBP
            ↓
   API Route /api/analyze
            ↓
 analyzeChart() — pilih engine
 berdasarkan API key tersedia
            ↓
  AI Vision Model — baca gambar,
   kembalikan JSON analisis lengkap
            ↓
 validateConsistency() — pastikan
 pump/dump konsisten dengan pattern
            ↓
 ChartOverlay — render garis pattern
   di atas chart (koordinat % dari AI)
            ↓
      ResultCard — tampilkan hasil
```

### Konsistensi Pattern → Probabilitas

Validator otomatis memastikan logika yang benar setelah AI menjawab:

| Pattern (Recent) | Koreksi otomatis |
|---|---|
| Double Top / Head & Shoulders / Rising Wedge | `dump > pump` |
| Double Bottom / Falling Wedge / Bull Flag | `pump > dump` |
| Pattern `recent` | Bobot **2× lipat** vs `historical` |

---

## 🗂️ Struktur Proyek

```
src/
├── app/
│   ├── page.tsx                  # Halaman utama
│   └── api/
│       ├── analyze/              # Endpoint single chart
│       └── analyze-mtf/          # Endpoint multi-timeframe
├── components/
│   ├── analysis/
│   │   ├── ChartOverlay.tsx      # SVG overlay garis pattern di chart
│   │   ├── PatternReference.tsx  # Diagram referensi textbook
│   │   ├── PumpDumpMeter.tsx     # Bar probabilitas pump/dump
│   │   ├── ResultCard.tsx        # Kartu hasil analisis
│   │   ├── SignalSummary.tsx     # Entry / SL / TP / R:R
│   │   └── SupportResistance.tsx
│   └── upload/
│       ├── DropZone.tsx          # Drag & drop / paste gambar
│       ├── ChartPreview.tsx
│       └── MtfUploader.tsx       # Upload 4 timeframe sekaligus
└── lib/
    ├── engines/
    │   ├── analyzer.ts           # Orchestrator engine chain
    │   ├── gemini-vision.ts      # Google Gemini engine
    │   ├── openrouter-vision.ts  # OpenRouter engine (multi-model fallback)
    │   ├── claude-vision.ts      # Anthropic Claude engine
    │   ├── rule-based.ts         # Fallback berbasis warna pixel
    │   └── validate.ts           # Validator konsistensi pattern → probabilitas
    ├── mtf/
    │   └── synthesizer.ts        # Sintesis & konfluensi multi-timeframe
    └── prompts/
        └── single-chart.ts       # Prompt analisis chart dengan aturan konsistensi
```

---

## 🔧 Development

```bash
# Dev server dengan hot reload
npm run dev

# Build production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## ⚠️ Disclaimer

Aplikasi ini hanya untuk **referensi teknikal** dan tujuan edukasi. Bukan financial advice. Selalu lakukan riset sendiri (DYOR) sebelum membuat keputusan trading.

---

## 📄 License

MIT — bebas digunakan dan dimodifikasi.
