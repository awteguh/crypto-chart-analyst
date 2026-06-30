# Neon Glassmorphism UI Redesign — Design Spec
Date: 2026-06-30

## Ringkasan

Full redesign visual Crypto Chart Analyst dari tampilan default Tailwind menjadi aesthetic **Neon Glassmorphism** dengan nuansa **Energetik/Crypto Native** (seperti Binance/Bybit dark mode premium).

Desain yang disetujui: **Opsi B (Glassmorphism) × Nuansa C (Energetik)** — glassmorphism panels, ambient glow orbs, gradient amber→orange→cyan, badge glow, typography bold.

**Tidak ada perubahan pada logika/fungsi** — hanya perubahan visual (CSS classes, warna, layout ornamen).

---

## Color Palette

| Token | Nilai | Digunakan untuk |
|-------|-------|----------------|
| Background utama | `#080B14` | `body`, `html` background |
| Card surface | `rgba(255,255,255,0.04)` | Semua card / panel |
| Card border | `rgba(255,255,255,0.08)` | Border card |
| Accent primary | `#f59e0b` (amber) | Tombol, heading highlight, border hover |
| Accent secondary | `#f97316` (orange) | Gradient pair dengan amber |
| Accent tertiary | `#06b6d4` (cyan) | Badge engine, AI summary, entry signal |
| Bullish | `#10b981` (emerald) | Pump, support, badge bullish |
| Bearish | `#ef4444` (red) | Dump, resistance, badge bearish |
| Text primary | `#e2e8f0` | Body text |
| Text muted | `#64748b` | Label, hint text |
| Text dimmed | `#334155` | Footer, secondary info |

---

## Ambient Background

3 glow orbs fixed di background (pointer-events: none, z-index: 0):
- **Orb 1** — amber `#f59e0b`, 400×400px, blur 80px, opacity 0.12, posisi top-right
- **Orb 2** — cyan `#06b6d4`, 300×300px, blur 80px, opacity 0.12, posisi bottom-left
- **Orb 3** — purple `#7c3aed`, 200×200px, blur 80px, opacity 0.12, posisi center

Seluruh konten `z-index: 1` di atasnya.

---

## Komponen Yang Diubah

### 1. `globals.css`
- Background: `#080B14`
- Foreground: `#e2e8f0`
- Tambah base styles untuk ambient glow orbs
- Font: tetap Inter

### 2. `layout.tsx`
- Tambah `<div class="bg-canvas">` dengan 3 orb divs sebagai ambient background
- Body class: `min-h-screen bg-[#080B14] text-[#e2e8f0]`

### 3. `page.tsx` — Header
- Logo pill: `bg-white/4 border border-white/8 rounded-full` dengan icon wrap gradient amber→red dan live dot berkedip
- `<h1>`: gradient text `from-amber-400 via-orange-400 to-cyan-400` via `bg-clip-text`
- Subtitle: flex row dengan separator dots
- "by AwTeguh": amber highlight

### 4. `page.tsx` — Tabs
- Container: `bg-white/3 border border-white/6 rounded-xl p-1`
- Tab aktif: `bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/30 text-amber-400 shadow-amber`
- Tab inaktif: `text-slate-500`

### 5. `ui/Card.tsx` — Glass Card
```
bg-white/4 border border-white/8 rounded-2xl backdrop-blur-xl
shadow-[0_0_30px_rgba(6,182,212,0.08)]
```
Hapus `bg-white dark:bg-gray-800` lama.

### 6. `ui/Badge.tsx` — Neon Badges
| Variant | Style baru |
|---------|-----------|
| bullish | `bg-emerald-500/15 border border-emerald-500/30 text-emerald-400` |
| bearish | `bg-red-500/15 border border-red-500/30 text-red-400` |
| neutral | `bg-white/6 border border-white/10 text-slate-400` |
| info (engine) | `bg-cyan-500/10 border border-cyan-500/25 text-cyan-400` |

### 7. `upload/DropZone.tsx` — Amber Dropzone
- Border: `border-2 border-dashed border-amber-500/25`
- Background: `bg-amber-500/3`
- Hover: `border-amber-500/50 bg-amber-500/6 shadow-[0_0_20px_rgba(245,158,11,0.1)]`
- Icon: `drop-shadow(0_0_12px_rgba(245,158,11,0.5))`
- Hint pill bawah: `bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full`

### 8. `ui/Button.tsx` — Gradient Button
- Primary: `bg-gradient-to-r from-amber-500 to-orange-500 text-[#080B14] font-bold shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.5)] hover:-translate-y-0.5`
- Secondary: `bg-white/6 border border-white/10 text-slate-400 hover:bg-white/8`

### 9. `analysis/PumpDumpMeter.tsx` — Glow Meter
- Bias label: glow text — pump: `text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]`, dump: `text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]`
- Track: `bg-white/6 rounded-full h-2`
- Fill pump: `bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]`
- Fill dump: `bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]`

### 10. `analysis/PatternBadge.tsx` — Amber/Red Badges
- Bullish: `bg-amber-500/12 border border-amber-500/30 text-amber-400`
- Bearish: `bg-red-500/12 border border-red-500/30 text-red-400`
- Neutral: `bg-white/6 border border-white/10 text-slate-400`

### 11. `analysis/SupportResistance.tsx` — Glow Dots
- Section title: `text-[9px] font-bold tracking-[1.5px] uppercase text-slate-600`
- Item: flex row, divider bottom `border-white/4`
- Resistance dot: `w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]`
- Support dot: `w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]`
- Teks resistance: `text-red-400`, support: `text-emerald-400`

### 12. `analysis/SignalSummary.tsx` — 4-Card Grid
Layout: `grid grid-cols-2 gap-2`
Setiap card: `bg-white/3 border border-white/6 rounded-xl p-3`
- Entry: `border-l-2 border-cyan-500`
- Stop Loss: `border-l-2 border-red-500`
- Take Profit: `border-l-2 border-emerald-500`
- R:R: `border-l-2 border-amber-500`, nilai: `text-2xl font-black text-amber-400`

Label: `text-[9px] font-bold tracking-widest uppercase text-slate-500 mb-1`
Value: `text-xs text-slate-300 leading-relaxed`

### 13. `analysis/ResultCard.tsx` — AI Summary box
- Ganti `bg-blue-50 dark:bg-blue-900/20` → `bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-3`
- Label "Analisis AI": `text-cyan-400 font-semibold`
- Teks: `text-slate-400 text-sm leading-relaxed`

### 14. `analysis/PatternReference.tsx` — Dark Reference Cards
- Container card: `bg-white/3 border border-white/6 rounded-xl`
- SVG stroke: warna disesuaikan (bullish=emerald, bearish=red, neutral=amber)
- Label text: `text-slate-400`

---

## Divider Style (baru)

Semua divider antar section: `border-t border-white/5 my-3`
Ganti semua `border-gray-*` menjadi `border-white/5` atau `border-white/8`

---

## Tidak Berubah

- Semua logika analisis, hooks, API routes
- Struktur komponen (props, interface)
- Crop tool functionality
- ChartOverlay SVG rendering
- PatternReference diagram paths
- Font (Inter)

---

## File Yang Diubah

| File | Jenis perubahan |
|------|----------------|
| `src/app/globals.css` | Background color, base vars |
| `src/app/layout.tsx` | Ambient orb divs, body class |
| `src/app/page.tsx` | Header pill, h1 gradient, tabs |
| `src/components/ui/Card.tsx` | Glassmorphism surface |
| `src/components/ui/Badge.tsx` | Neon variant styles |
| `src/components/ui/Button.tsx` | Gradient primary, ghost secondary |
| `src/components/upload/DropZone.tsx` | Amber dashed border, glow hover |
| `src/components/analysis/PumpDumpMeter.tsx` | Glow meter bars |
| `src/components/analysis/PatternBadge.tsx` | Amber/red badge style |
| `src/components/analysis/SupportResistance.tsx` | Glow dots, row style |
| `src/components/analysis/SignalSummary.tsx` | 4-card grid with colored borders |
| `src/components/analysis/ResultCard.tsx` | AI summary box style |
| `src/components/analysis/PatternReference.tsx` | Dark card style |
