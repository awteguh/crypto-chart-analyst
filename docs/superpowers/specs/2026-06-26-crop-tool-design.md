# Crop Tool — Design Spec
Date: 2026-06-26

## Problem

Ketika user upload screenshot dari app trading (Stockbit, Investing.com, dll), gambar mengandung UI tambahan: header nama saham, harga, tombol timeframe, tombol Beli, tab stream. Area candlestick chart hanya mengisi sebagian gambar (~30-50%).

AI Vision menerima gambar penuh → memberikan koordinat overlay relatif terhadap area chart → ChartOverlay merender di seluruh gambar → garis-garis pattern meleset ke area header/tombol.

**Root cause:** AI tidak tahu batas area chart dalam gambar. Fix `chart_bounds` di prompt tidak cukup karena AI sering tidak akurat menentukan batas yang tepat.

## Solution

Server-side crop sebelum gambar dikirim ke AI. User menandai area chart via crop tool di UI. Gambar yang dikirim ke Gemini/OpenRouter adalah area chart saja → koordinat AI selalu 0–100 = full chart → overlay selalu tepat.

## User Flow

1. User upload gambar (drag & drop / klik / paste)
2. `ChartPreview` tampilkan gambar + jalankan **auto-detect** server-side (endpoint baru `/api/detect-chart`)
3. Kotak seleksi hijau muncul di area yang terdeteksi, area luar digelapkan
4. User bisa **drag kotak / tarik sudut** untuk adjust (opsional)
5. Tombol **Reset** mengembalikan ke hasil auto-detect
6. Klik **Analisis Chart** → koordinat crop dikirim bersama gambar ke `/api/analyze`
7. Server crop gambar dengan `sharp.extract()` sebelum kirim ke AI
8. Overlay dirender di atas area crop saja (gambar yang ditampilkan ke user tetap full, overlay di-clip ke area crop)

## Architecture

### Komponen Baru / Diubah

**`src/components/upload/ChartPreview.tsx`** (diubah)
- Tambah state: `cropBox: {x1,y1,x2,y2} | null`, `detecting: boolean`
- Saat file masuk → call `/api/detect-chart` → set `cropBox` dari response
- Render `<CropOverlay>` di atas gambar
- Expose `cropBox` ke parent via prop `onCropChange`

**`src/components/upload/CropOverlay.tsx`** (baru)
- SVG/div overlay di atas `<img>`
- Tampilkan kotak seleksi dengan 4 corner handle + edge handle
- Pointer events: drag kotak = move, drag handle = resize
- Dim area di luar kotak (rgba overlay)
- Props: `cropBox`, `onChange(box)`, `imageSize: {w,h}`
- Koordinat dalam pixel → dikonversi ke % saat expose ke parent

**`src/app/api/detect-chart/route.ts`** (baru)
- POST dengan `FormData { image: File }`
- Pakai `sharp` untuk analisis histogram warna
- Scan rows dan columns untuk cari area dengan konsentrasi warna candle (merah/hijau saturasi tinggi)
- Return `{ x1, y1, x2, y2 }` dalam persen 0–100
- Fallback: jika tidak terdeteksi → return full image `{x1:0,y1:0,x2:100,y2:100}`
- Timeout: max 3 detik (deteksi harus cepat)

**`src/app/api/analyze/route.ts`** (diubah)
- Terima field tambahan `cropX1`, `cropY1`, `cropX2`, `cropY2` dari FormData
- Jika ada crop → `sharp(buffer).extract({left,top,width,height}).toBuffer()`
- Kirim cropped buffer ke engine AI
- Response tetap sama (`AnalysisResult`)

**`src/lib/engines/analyzer.ts`** (diubah)
- `analyzeChart(file, timeframe, cropBox?)` — terima optional cropBox
- Sebelum encode base64 → jika cropBox ada → crop buffer dulu
- Hapus `chart_bounds` dari alur (tidak diperlukan lagi jika gambar sudah di-crop)

### Data Flow

```
ChartPreview
  ├─ file upload → /api/detect-chart → {x1,y1,x2,y2}
  ├─ CropOverlay (interactive) → cropBox state
  └─ onCropChange(cropBox) → page.tsx state

page.tsx
  └─ analyze() → /api/analyze + FormData { image, cropX1, cropY1, cropX2, cropY2 }

/api/analyze route
  └─ sharp.extract(crop) → base64 → engine AI
                                      └─ overlay koordinat 0-100 = area crop
```

### Auto-detect Algorithm (sharp)

```
1. Resize ke 400×400 untuk efisiensi
2. Scan setiap row: hitung pixel dengan saturasi tinggi (candle merah/hijau)
   - Merah: R>150, G<100, B<100
   - Hijau: G>150, R<100, B<100
3. Cari range row dengan density candle tertinggi (sliding window)
4. Scan columns dalam range tersebut → cari batas kiri/kanan
5. Add padding 2% untuk keamanan
6. Fallback: jika total candle pixel < threshold (gambar plain/screenshot UI) → full image
```

## UI Detail

### CropOverlay
- Kotak seleksi: border 2px hijau (`#22c55e`), background `rgba(34,197,94,0.05)`
- Area luar kotak: `rgba(0,0,0,0.45)` overlay
- Corner handles: 10×10px kotak hijau di 4 sudut (draggable)
- Label di atas kotak: "✓ chart terdeteksi · drag untuk adjust" (saat auto) atau "crop area" (saat manual)
- Saat `detecting`: spinner + teks "mendeteksi area chart..."
- Tombol Reset muncul hanya jika user sudah adjust dari posisi auto

### Tombol Analisis
- Tetap di bawah ChartPreview (tidak berubah)
- Saat detecting berjalan → disabled dengan spinner kecil

### Mobile
- Touch events: touchstart/touchmove/touchend untuk drag
- Handle size 14×14px di mobile (lebih besar untuk jari)

## Files To Change

| File | Action |
|------|--------|
| `src/components/upload/ChartPreview.tsx` | Modify — tambah crop state + detect |
| `src/components/upload/CropOverlay.tsx` | Create — interactive crop overlay |
| `src/app/api/detect-chart/route.ts` | Create — server-side auto-detect |
| `src/app/api/analyze/route.ts` | Modify — terima + apply crop |
| `src/lib/engines/analyzer.ts` | Modify — crop buffer sebelum base64 |
| `src/app/page.tsx` | Modify — pass cropBox ke analyze() |
| `src/types/analysis.ts` | Modify — hapus/simplify chart_bounds (opsional) |

## Out of Scope

- Crop di MTF uploader (hanya single chart dulu)
- Preset platform (Stockbit, TradingView) — bisa ditambah nanti
- Crop dengan rotasi atau aspect-ratio lock
- Simpan crop preference per session
