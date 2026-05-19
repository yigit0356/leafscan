import { useDB } from '../../db'
import { leaves } from '../../db/schema'

// Hu Moments benzerlik karşılaştırması (OpenCV matchShapes I1 yöntemi)
function huDistance(a: number[], b: number[]): number {
  let d = 0
  for (let i = 0; i < 7; i++) {
    const ai = a[i] !== 0 ? Math.sign(a[i]) * Math.log10(Math.abs(a[i])) : 0
    const bi = b[i] !== 0 ? Math.sign(b[i]) * Math.log10(Math.abs(b[i])) : 0
    if (ai !== 0 && bi !== 0) {
      d += Math.abs(1 / ai - 1 / bi)
    }
  }
  return d
}

const SIMILARITY_THRESHOLD = 0.35

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { huMoments } = body as { huMoments: number[] }

  if (!huMoments || huMoments.length !== 7) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Hu Moment data' })
  }

  const db = useDB()
  const allLeaves = await db.select({
    id: leaves.id,
    plantName: leaves.plantName,
    areaCm2: leaves.areaCm2,
    huMoments: leaves.huMoments,
    imageData: leaves.imageData,
  }).from(leaves)

  let bestMatch: { id: number; plantName: string | null; areaCm2: number; imageData: string; distance: number } | null = null
  let minDist = Infinity

  for (const leaf of allLeaves) {
    const dist = huDistance(huMoments, leaf.huMoments as number[])
    if (dist < minDist) {
      minDist = dist
      bestMatch = { ...leaf, plantName: leaf.plantName, distance: dist }
    }
  }

  if (bestMatch && minDist < SIMILARITY_THRESHOLD) {
    return {
      match: {
        id: bestMatch.id,
        plantName: bestMatch.plantName,
        areaCm2: bestMatch.areaCm2,
        imageData: bestMatch.imageData,
        similarity: Math.max(0, Math.round((1 - minDist / SIMILARITY_THRESHOLD) * 100)),
      },
    }
  }

  return { match: null }
})
