import { pgTable, serial, text, doublePrecision, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const leaves = pgTable('leaves', {
  id: serial('id').primaryKey(),
  plantName: text('plant_name'),
  areaCm2: doublePrecision('area_cm2').notNull(),
  imageData: text('image_data').notNull(),
  contourData: jsonb('contour_data').notNull(),
  huMoments: doublePrecision('hu_moments').array().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Leaf = typeof leaves.$inferSelect
export type NewLeaf = typeof leaves.$inferInsert
