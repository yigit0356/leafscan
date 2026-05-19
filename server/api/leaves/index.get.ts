import { useDB } from '../../db'
import { leaves } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  return await db.select({
    id: leaves.id,
    plantName: leaves.plantName,
    areaCm2: leaves.areaCm2,
    imageData: leaves.imageData,
    createdAt: leaves.createdAt,
  })
    .from(leaves)
    .orderBy(desc(leaves.createdAt))
})
