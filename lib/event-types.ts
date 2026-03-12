import { getDb, type EventType } from './db'

export async function getEventTypes(userId: string): Promise<EventType[]> {
  const sql = getDb()
  const result = await sql`
    SELECT * FROM event_types 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return result as EventType[]
}

export async function getEventTypeBySlug(slug: string): Promise<EventType | null> {
  const sql = getDb()
  const result = (await sql`
    SELECT * FROM event_types 
    WHERE slug = ${slug}
    LIMIT 1
  `) as any[]
  return result[0] as EventType | null
}

export async function getEventTypeById(id: string): Promise<EventType | null> {
  const sql = getDb()
  const result = (await sql`
    SELECT * FROM event_types 
    WHERE id = ${id}
    LIMIT 1
  `) as any[]
  return result[0] as EventType | null
}

export async function createEventType(
  userId: string,
  title: string,
  slug: string,
  duration: number,
  description?: string,
  bufferTime?: number,
  color?: string
): Promise<EventType> {
  const sql = getDb()
  const result = (await sql`
    INSERT INTO event_types (user_id, title, slug, duration, description, buffer_time, color)
    VALUES (${userId}, ${title}, ${slug}, ${duration}, ${description || null}, ${bufferTime || 0}, ${color || '#0066FF'})
    RETURNING *
  `) as any[]
  return result[0] as EventType
}

export async function updateEventType(
  id: string,
  updates: Partial<Omit<EventType, 'id' | 'user_id' | 'created_at'>>
): Promise<EventType> {
  const sql = getDb()
  const { title, slug, duration, description, buffer_time, color, is_active } = updates
  
  const result = (await sql`
    UPDATE event_types 
    SET 
      title = COALESCE(${title ?? null}, title),
      slug = COALESCE(${slug ?? null}, slug),
      duration = COALESCE(${duration ?? null}, duration),
      description = COALESCE(${description ?? null}, description),
      buffer_time = COALESCE(${buffer_time ?? null}, buffer_time),
      color = COALESCE(${color ?? null}, color),
      is_active = COALESCE(${is_active ?? null}, is_active)
    WHERE id = ${id}
    RETURNING *
  `) as any[]
  return result[0] as EventType
}

export async function deleteEventType(id: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM event_types WHERE id = ${id}`
}
