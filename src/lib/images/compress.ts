/**
 * Browser-side image compression using the Canvas API.
 *
 * Takes an image File and iteratively re-encodes (and if needed, downscales)
 * it until the result is at or below `maxBytes`. Animated GIFs are returned
 * unchanged because canvas re-encoding would destroy animation.
 */

const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4]
const MAX_RESIZE_ITERATIONS = 3

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      },
      type,
      quality,
    )
  })
}

function loadImage(file: File): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, revoke: () => URL.revokeObjectURL(url) })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export async function compressImageToMaxSize(
  file: File,
  maxBytes: number,
): Promise<File> {
  if (file.size <= maxBytes) return file
  // Canvas re-encoding would flatten animated GIFs, so leave them alone.
  if (file.type === 'image/gif') return file

  // PNG lacks a quality knob; re-encode to JPEG.
  const outputType =
    file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg'

  const { img, revoke } = await loadImage(file)
  try {
    let width = img.naturalWidth
    let height = img.naturalHeight
    let best: Blob | null = null

    for (let resize = 0; resize <= MAX_RESIZE_ITERATIONS; resize++) {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width))
      canvas.height = Math.max(1, Math.round(height))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not acquire 2D canvas context')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, outputType, quality)
        if (blob.size <= maxBytes) {
          best = blob
          break
        }
        if (!best || blob.size < best.size) best = blob
      }

      if (best && best.size <= maxBytes) break

      // Still too large — halve dimensions and try again.
      width = width / 2
      height = height / 2
    }

    if (!best) throw new Error('Image compression produced no output')

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
    const ext = mimeToExt(outputType)
    return new File([best], `${baseName}.${ext}`, {
      type: outputType,
      lastModified: Date.now(),
    })
  } finally {
    revoke()
  }
}
