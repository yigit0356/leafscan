import cv from '@techstark/opencv-js'
import sharp from 'sharp'

/**
 * Converts a raw image buffer (e.g., from an upload) into an OpenCV Mat object.
 * Resizes the image to a maximum width/height of 1400px to prevent memory spikes.
 */
export async function bufferToMat(imageBuffer: Buffer): Promise<{ mat: any; cv: any }> {
  // 1. Resize and decode to raw RGBA
  const { data, info } = await sharp(imageBuffer)
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // 2. Create OpenCV Mat and copy data
  const mat = new cv.Mat(info.height, info.width, cv.CV_8UC4)
  mat.data.set(new Uint8Array(data))

  return { mat, cv }
}

/**
 * Converts an OpenCV Mat into a Base64 JPEG string for the frontend.
 */
export async function matToBase64(mat: any): Promise<string> {
  const dst = new cv.Mat()
  
  // Ensure the mat is RGBA for Sharp
  if (mat.channels() === 1) {
    cv.cvtColor(mat, dst, cv.COLOR_GRAY2RGBA)
  } else if (mat.channels() === 3) {
    cv.cvtColor(mat, dst, cv.COLOR_BGR2RGBA)
  } else {
    mat.copyTo(dst)
  }

  // Convert Uint8Array to Node Buffer
  const buffer = Buffer.from(dst.data)

  // Encode to JPEG using Sharp
  const jpegBuffer = await sharp(buffer, {
    raw: {
      width: dst.cols,
      height: dst.rows,
      channels: 4
    }
  }).jpeg({ quality: 75 }).toBuffer()

  dst.delete()

  return 'data:image/jpeg;base64,' + jpegBuffer.toString('base64')
}

/**
 * Computes Hu Moments from OpenCV normalized central moments
 */
export function computeHuMoments(m: any): number[] {
  const { nu20, nu11, nu02, nu30, nu21, nu12, nu03 } = m
  return [
    nu20 + nu02,
    (nu20 - nu02) ** 2 + 4 * nu11 ** 2,
    (nu30 - 3 * nu12) ** 2 + (3 * nu21 - nu03) ** 2,
    (nu30 + nu12) ** 2 + (nu21 + nu03) ** 2,
    (nu30 - 3 * nu12) * (nu30 + nu12) * ((nu30 + nu12) ** 2 - 3 * (nu21 + nu03) ** 2)
      + (3 * nu21 - nu03) * (nu21 + nu03) * (3 * (nu30 + nu12) ** 2 - (nu21 + nu03) ** 2),
    (nu20 - nu02) * ((nu30 + nu12) ** 2 - (nu21 + nu03) ** 2)
      + 4 * nu11 * (nu30 + nu12) * (nu21 + nu03),
    (3 * nu21 - nu03) * (nu30 + nu12) * ((nu30 + nu12) ** 2 - 3 * (nu21 + nu03) ** 2)
      - (nu30 - 3 * nu12) * (nu21 + nu03) * (3 * (nu30 + nu12) ** 2 - (nu21 + nu03) ** 2),
  ]
}

/**
 * Orders 4 points of a rectangle in a consistent way:
 * Top-Left, Top-Right, Bottom-Right, Bottom-Left
 */
export function orderPoints(pts: { x: number; y: number }[]): { x: number; y: number }[] {
  const sortedX = [...pts].sort((a, b) => a.x - b.x)
  
  const leftPts = [sortedX[0], sortedX[1]].sort((a, b) => a.y - b.y)
  const rightPts = [sortedX[2], sortedX[3]].sort((a, b) => a.y - b.y)

  const tl = leftPts[0]
  const bl = leftPts[1]
  const tr = rightPts[0]
  const br = rightPts[1]

  return [tl, tr, br, bl]
}
