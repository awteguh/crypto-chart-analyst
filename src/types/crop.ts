// src/types/crop.ts

/** Batas area crop dalam persen 0-100 relatif terhadap ukuran gambar penuh. */
export interface CropBox {
  x1: number // tepi kiri (0-100)
  y1: number // tepi atas (0-100)
  x2: number // tepi kanan (0-100)
  y2: number // tepi bawah (0-100)
}

/** Validasi bahwa CropBox masuk akal (bukan full-image default). */
export function isMeaningfulCrop(box: CropBox): boolean {
  return (
    box.x1 >= 0 && box.y1 >= 0 &&
    box.x2 <= 100 && box.y2 <= 100 &&
    box.x2 - box.x1 >= 10 &&
    box.y2 - box.y1 >= 10 &&
    !(box.x1 === 0 && box.y1 === 0 && box.x2 === 100 && box.y2 === 100)
  )
}
