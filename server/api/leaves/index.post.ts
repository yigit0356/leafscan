import { useDB } from '../../db'
import { leaves } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { plantName, areaCm2, imageData, contourData, huMoments } = body

  if (!areaCm2 || !imageData || !contourData || !huMoments) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const db = useDB()
  const [inserted] = await db.insert(leaves).values({
    plantName: plantName || null,
    areaCm2,
    imageData,
    contourData,
    huMoments,
  }).returning()

  return inserted
})
