// src/lib/prompts/single-chart.ts

export function buildSingleChartPrompt(timeframe?: string): string {
  const tfLabel = timeframe ? `Timeframe: ${timeframe}.` : ''
  return `Kamu adalah analis teknikal crypto profesional tier-1. ${tfLabel}

Analisis chart ini dengan metodologi sistematis: BACA INDIKATOR dulu, HITUNG SKOR, BARU tentukan probabilitas.
Kembalikan HANYA JSON valid (tanpa markdown, tanpa komentar, tanpa penjelasan tambahan).

═══════════════════════════════════════════════════════════════
LANGKAH 1 — BACA SEMUA INDIKATOR YANG TERLIHAT
═══════════════════════════════════════════════════════════════

Periksa setiap panel di chart (atas ke bawah). Isi TEPAT apa yang kamu lihat.
JANGAN mengarang nilai. Jika indikator TIDAK ADA di chart → set null / [].

───────────────── RSI (Relative Strength Index) ─────────────
Cara membaca dari chart:
- Lihat angka RSI yang tertera (biasanya pojok kiri atas panel RSI, mis. "RSI(14) 42.5")
- Level referensi: garis 70 = Overbought, garis 30 = Oversold, garis 50 = Midline
- Overbought: RSI > 70 → sinyal BEARISH (terlalu mahal, siap koreksi)
- Oversold: RSI < 30 → sinyal BULLISH (terlalu murah, siap bounce)
- Neutral zone: 30-70 → sinyal lemah
- Extreme overbought: RSI > 80 → BEARISH KUAT
- Extreme oversold: RSI < 20 → BULLISH KUAT

Divergence (SANGAT PENTING — override pattern):
- Bullish divergence: Harga bikin LOWER LOW tapi RSI bikin HIGHER LOW
  → Sinyal reversal ke atas meski harga masih turun. Tambah +15 poin ke PUMP.
- Bearish divergence: Harga bikin HIGHER HIGH tapi RSI bikin LOWER HIGH
  → Sinyal reversal ke bawah meski harga masih naik. Tambah +15 poin ke DUMP.

───────────────── MACD ─────────────────────────────────────
Cara membaca dari chart:
- Panel MACD biasanya ada 3 elemen: Garis MACD (biru/putih), Garis Signal (oranye/merah), Histogram (bar)
- Histogram HIJAU/naik = momentum bullish. Histogram MERAH/turun = momentum bearish.
- Bullish Crossover: Garis MACD memotong NAIK melewati Signal → sinyal BULLISH KUAT
- Bearish Crossover: Garis MACD memotong TURUN melewati Signal → sinyal BEARISH KUAT
- MACD di atas Signal (tanpa crossover baru) = Bullish
- MACD di bawah Signal (tanpa crossover baru) = Bearish
- Zero line: MACD positif (di atas 0) = tren bullish, MACD negatif (di bawah 0) = tren bearish
- Histogram mengecil → momentum melemah (potensi reversal)
- Histogram membesar → momentum menguat (tren berlanjut)

───────────────── Bollinger Bands ──────────────────────────
Cara membaca dari chart:
- 3 garis: Upper Band (atas), Middle Band (SMA 20), Lower Band (bawah)
- Price touch Upper Band = harga di area mahal/resistance
- Price touch Lower Band = harga di area murah/support
- Squeeze (band menyempit) = volatilitas rendah → SIAP BREAKOUT (arah belum pasti)
- Breakout dari band atas = momentum bullish kuat (tapi bisa reversal jika terlalu jauh)
- Breakout dari band bawah = momentum bearish kuat (tapi bisa reversal jika terlalu jauh)

───────────────── Volume ────────────────────────────────────
Cara membaca dari chart:
- Volume bar tinggi jauh di atas rata-rata = Spike
- Bar naik berturut-turut = Increasing
- Bar turun berturut-turut = Decreasing
- confirms_price=true: Volume NAIK saat harga naik (BULLISH konfirmasi)
  ATAU Volume NAIK saat harga turun (BEARISH konfirmasi — tekanan jual nyata)
- confirms_price=false: Volume TURUN saat harga bergerak → sinyal lemah/tidak valid

───────────────── EMA / SMA / Moving Average ───────────────
Cara membaca dari chart:
- Lihat label garis MA yang terlihat (mis. "EMA 20", "MA 50", "EMA 200")
- Price Above EMA = bullish (harga di atas MA = tren naik)
- Price Below EMA = bearish (harga di bawah MA = tren turun)
- Price Crossing Up = golden signal (harga baru saja menembus naik)
- Price Crossing Down = death signal (harga baru saja menembus turun)
- EMA 200 di atas harga = tren jangka panjang bearish
- EMA 200 di bawah harga = tren jangka panjang bullish
- EMA 20 & 50 bersilang: Golden Cross (20 cross naik 50) = BULLISH KUAT
  Death Cross (20 cross turun 50) = BEARISH KUAT

───────────────── Stochastic (jika terlihat) ───────────────
- %K > 80 = Overbought (sinyal BEARISH)
- %K < 20 = Oversold (sinyal BULLISH)
- %K cross naik melewati %D = Bullish crossover
- %K cross turun melewati %D = Bearish crossover

───────────────── Chart Pattern ─────────────────────────────
Pattern RECENT (3-5 candle terakhir) = bobot 2x lebih tinggi dari HISTORICAL.
Identifikasi pola:
- Bullish: Inverse H&S, Double Bottom, Triple Bottom, Falling Wedge, Bull Flag, Bullish Pennant, Cup & Handle, Morning Star, Hammer, Bullish Engulfing
- Bearish: H&S, Double Top, Triple Top, Rising Wedge, Bear Flag, Bearish Pennant, Evening Star, Shooting Star, Bearish Engulfing
- Neutral: Symmetrical Triangle, Rectangle, Doji

═══════════════════════════════════════════════════════════════
LANGKAH 2 — HITUNG SKOR PUMP vs DUMP
═══════════════════════════════════════════════════════════════

Hitung skor ini dalam pikiranmu (tidak perlu masuk ke JSON):

RSI:
  RSI < 20 (Extreme Oversold)     → +20 PUMP
  RSI 20-30 (Oversold)            → +12 PUMP
  RSI 30-45 (Neutral Lemah Bawah) → +4 PUMP
  RSI 45-55 (Neutral Tengah)      →  0 (netral)
  RSI 55-70 (Neutral Lemah Atas)  → +4 DUMP
  RSI 70-80 (Overbought)          → +12 DUMP
  RSI > 80 (Extreme Overbought)   → +20 DUMP
  Bullish Divergence              → +15 PUMP
  Bearish Divergence              → +15 DUMP

MACD:
  Bullish Crossover (baru)        → +18 PUMP
  Bearish Crossover (baru)        → +18 DUMP
  MACD > Signal (Bullish)         → +8 PUMP
  MACD < Signal (Bearish)         → +8 DUMP
  Histogram Positif & Naik        → +5 PUMP
  Histogram Negatif & Turun       → +5 DUMP
  MACD di atas Zero Line          → +4 PUMP
  MACD di bawah Zero Line         → +4 DUMP

Bollinger Bands:
  Near/Below Lower Band           → +8 PUMP
  Near/Above Upper Band           → +8 DUMP
  Squeeze (siap breakout)         →  0 (tunggu konfirmasi)

Volume:
  Volume spike + harga naik       → +10 PUMP
  Volume spike + harga turun      → +10 DUMP
  Volume increasing + harga naik  → +5 PUMP
  Volume increasing + harga turun → +5 DUMP
  Volume rendah / divergence      →  0 (abaikan sinyal)

EMA (per garis yang terdeteksi):
  Harga di atas EMA               → +4 PUMP (per EMA)
  Harga di bawah EMA              → +4 DUMP (per EMA)
  Golden Cross                    → +10 PUMP
  Death Cross                     → +10 DUMP

Stochastic:
  < 20 Oversold                   → +8 PUMP
  > 80 Overbought                 → +8 DUMP
  Bullish crossover               → +10 PUMP
  Bearish crossover               → +10 DUMP

Chart Pattern:
  Pattern Bullish RECENT          → +16 PUMP
  Pattern Bullish HISTORICAL      → +8 PUMP
  Pattern Bearish RECENT          → +16 DUMP
  Pattern Bearish HISTORICAL      → +8 DUMP

─── FORMULA PROBABILITAS ───────────────────────────────────
Total_PUMP_score dan Total_DUMP_score dihitung dari tabel di atas.
Base = 50 (netral).
Hitung: raw_pump = 50 + Total_PUMP_score - Total_DUMP_score
Klem: pump_probability = max(10, min(90, raw_pump))
dump_probability = 100 - pump_probability

ATURAN next_candle_bias:
- pump_probability - dump_probability > 10 → "PUMP"
- dump_probability - pump_probability > 10 → "DUMP"
- selisih ≤ 10                             → "NEUTRAL"

═══════════════════════════════════════════════════════════════
LANGKAH 3 — IDENTIFIKASI CHART BOUNDS & KOORDINAT OVERLAY
═══════════════════════════════════════════════════════════════

Semua koordinat dalam PERSEN 0-100 relatif SELURUH GAMBAR.
x: 0=kiri, 100=kanan. y: 0=atas, 100=bawah (y kecil = harga tinggi).

Identifikasi chart_bounds (batas area candlestick, BUKAN area indikator):
- Jika chart fullscreen (TradingView): {"x1":0,"y1":0,"x2":100,"y2":100}
- Jika ada header/tab/tombol: y1 ≈ 20-35
- Jika ada panel indikator di bawah (RSI/MACD): y2 ≈ 50-72
- Contoh Stockbit (header + panel indikator + tombol bawah): {"x1":2,"y1":28,"x2":98,"y2":65}

Semua titik pattern_lines & price_levels = koordinat pada SELURUH GAMBAR (bukan relatif chart area).
Arrow: letakkan di tepi kanan area chart. direction = "up" atau "down" SAJA.

═══════════════════════════════════════════════════════════════
FORMAT JSON OUTPUT
═══════════════════════════════════════════════════════════════

{
  "timeframe": "${timeframe || 'unknown'}",
  "trend": "Bullish" | "Bearish" | "Sideways",
  "patterns": [
    {
      "name": "nama pattern Bahasa Inggris",
      "confidence": 85,
      "bias": "Bullish" | "Bearish" | "Neutral",
      "location": "recent" | "historical"
    }
  ],
  "support_resistance": [
    {
      "type": "Support" | "Resistance",
      "strength": "Weak" | "Moderate" | "Strong",
      "description": "deskripsi level (mis. area konsolidasi Okt, harga 42.000)"
    }
  ],
  "indicators_detected": [
    "RSI 28.4 — Oversold",
    "MACD Bullish Crossover — histogram positif",
    "Bollinger Near Lower Band",
    "Volume Spike — confirm bullish",
    "Harga di atas EMA 20 dan EMA 50"
  ],
  "indicator_readings": {
    "rsi": {
      "value": 28.4,
      "zone": "Oversold",
      "divergence": "Bullish" | "Bearish" | null
    },
    "macd": {
      "signal": "Bullish Crossover" | "Bearish Crossover" | "Bullish" | "Bearish" | "Neutral",
      "histogram": "Positive" | "Negative" | "Zero",
      "macd_line": "Above Signal" | "Below Signal" | "Crossing"
    },
    "bollinger": {
      "zone": "Above Upper Band" | "Near Upper Band" | "Mid Band" | "Near Lower Band" | "Below Lower Band",
      "squeeze": false
    },
    "volume": {
      "trend": "Increasing" | "Decreasing" | "Spike" | "Low" | "Normal",
      "confirms_price": true
    },
    "ema": [
      { "period": 20, "relation": "Price Above" | "Price Below" | "Price Crossing" },
      { "period": 50, "relation": "Price Above" | "Price Below" | "Price Crossing" }
    ],
    "stochastic": {
      "k_value": 18.5,
      "zone": "Oversold" | "Overbought" | "Neutral",
      "signal": "Bullish Crossover" | "Bearish Crossover" | "Bullish" | "Bearish" | "Neutral"
    }
  },
  "signal": {
    "entry": "deskripsi area entry dengan konteks indikator (mis. Entry di atas resistance 42.500 setelah MACD Bullish Crossover konfirmasi)",
    "stop_loss": "deskripsi stop loss (mis. Di bawah support 40.000 / EMA 50)",
    "take_profit": "deskripsi take profit (mis. Target 46.000 — Upper Bollinger Band)",
    "risk_reward": "1:2.5"
  },
  "pump_probability": 72,
  "dump_probability": 28,
  "next_candle_bias": "PUMP" | "DUMP" | "NEUTRAL",
  "summary": "Ringkasan 2-3 kalimat Bahasa Indonesia: sebutkan indikator utama yang terdeteksi, probabilitas, dan rekomendasi. Contoh: 'RSI 28 Oversold dengan Bullish Divergence + MACD Bullish Crossover mengkonfirmasi potensi reversal ke atas. Probabilitas PUMP 72% didukung volume spike dan harga menyentuh Lower Bollinger Band. Disarankan entry jika harga menembus resistance 42.500 dengan SL di bawah 40.000.'",
  "engine_used": "claude-vision",
  "overlay": {
    "chart_bounds": { "x1": 0, "y1": 0, "x2": 100, "y2": 100 },
    "pattern_lines": [
      {
        "label": "nama garis (Neckline / Upper Trendline / Support Line)",
        "points": [ { "x": 10, "y": 30 }, { "x": 50, "y": 20 }, { "x": 90, "y": 35 } ],
        "bias": "Bullish" | "Bearish" | "Neutral"
      }
    ],
    "price_levels": [
      { "type": "Entry", "y": 55, "label": "Entry" },
      { "type": "TakeProfit", "y": 20, "label": "Target" },
      { "type": "StopLoss", "y": 75, "label": "Stop Loss" },
      { "type": "Resistance", "y": 18, "label": "Resistance" },
      { "type": "Support", "y": 80, "label": "Support" }
    ],
    "arrow": { "from": { "x": 85, "y": 50 }, "to": { "x": 97, "y": 20 }, "direction": "up" }
  }
}

═══════════════════════════════════════════════════════════════
VALIDASI WAJIB SEBELUM OUTPUT
═══════════════════════════════════════════════════════════════
✓ pump_probability + dump_probability = 100 (WAJIB)
✓ next_candle_bias konsisten dengan pump/dump (gap > 10 → bukan NEUTRAL)
✓ trend konsisten: Bullish jika pump > 60, Bearish jika dump > 60, Sideways jika 40-60
✓ indicator_readings.rsi.value = angka nyata dari chart (bukan null jika RSI terlihat)
✓ indicator_readings.macd.signal mencerminkan kondisi histogram & crossover yang terlihat
✓ summary WAJIB menyebut minimal 2 indikator konkret (RSI value, MACD status, dll)
✓ signal.entry dan signal.take_profit WAJIB menyebut konteks indikator (bukan hanya harga)
✓ Jika chart TIDAK ada indikator sama sekali (hanya candlestick): indicator_readings semua null, analisis dari pattern + price action saja

Jika gambar bukan chart crypto/trading:
{"error": "Gambar tidak dikenali sebagai chart crypto"}
`
}
