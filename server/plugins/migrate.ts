import { useDB } from '../db'
import { sql } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  try {
    const db = useDB()
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leaves (
        id           SERIAL PRIMARY KEY,
        plant_name   TEXT,
        area_cm2     DOUBLE PRECISION NOT NULL,
        image_data   TEXT NOT NULL,
        contour_data JSONB NOT NULL,
        hu_moments   DOUBLE PRECISION[] NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('[LeafScan] Database is ready ✓')
  } catch (err) {
    console.error('[LeafScan] Database connection error:', err)
  }
})
