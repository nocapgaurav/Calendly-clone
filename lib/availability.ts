import { getDb, type Availability } from './db'

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export async function getAvailability(userId: string): Promise<Availability[]> {
  const sql = getDb()
  const result = await sql`
    SELECT * FROM availability 
    WHERE user_id = ${userId} 
    ORDER BY day_of_week
  `
  return result as Availability[]
}

export async function getAvailabilityForDay(userId: string, dayOfWeek: number): Promise<Availability | null> {
  const sql = getDb()
  const result = (await sql`
    SELECT * FROM availability 
    WHERE user_id = ${userId} 
    AND day_of_week = ${dayOfWeek}
    AND is_active = true
    LIMIT 1
  `) as any[]
  return result[0] as Availability | null
}

export async function upsertAvailability(
  userId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  isActive: boolean
): Promise<Availability> {
  const sql = getDb()
  const result = (await sql`
    INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active)
    VALUES (${userId}, ${dayOfWeek}, ${startTime}, ${endTime}, ${isActive})
    ON CONFLICT (user_id, day_of_week) 
    DO UPDATE SET 
      start_time = ${startTime},
      end_time = ${endTime},
      is_active = ${isActive}
    RETURNING *
  `) as any[]
  return result[0] as Availability
}
