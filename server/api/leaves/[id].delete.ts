import { useDB } from '../../db'
import { leaves } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const db = useDB()
  await db.delete(leaves).where(eq(leaves.id, id))
  return { success: true }
})
