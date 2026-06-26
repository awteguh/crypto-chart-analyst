// src/components/upload/MtfUploader.tsx

'use client'

import type { Timeframe } from '@/types/chart'
import { TIMEFRAMES } from '@/types/chart'
import { DropZone } from './DropZone'
import { ChartPreview } from './ChartPreview'

interface MtfUploaderProps {
  files: Partial<Record<Timeframe, File>>
  onFile: (tf: Timeframe, file: File) => void
  onRemove: (tf: Timeframe) => void
}

export function MtfUploader({ files, onFile, onRemove }: MtfUploaderProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {TIMEFRAMES.map((tf) => (
        <div key={tf}>
          {files[tf] ? (
            <ChartPreview
              file={files[tf]!}
              timeframe={tf}
              onRemove={() => onRemove(tf)}
              onCropChange={() => {}}
            />
          ) : (
            <DropZone
              onFile={(file) => onFile(tf, file)}
              label={`Drop chart ${tf}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
