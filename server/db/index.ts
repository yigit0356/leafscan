import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (!_db) {
    const url = process.env.DATABASE_URL || useRuntimeConfig().databaseUrl
    if (!url) throw new Error('DATABASE_URL is not set')
    const client = postgres(url as string, { max: 10 })
    _db = drizzle(client, { schema })
  }
  return _db
}
