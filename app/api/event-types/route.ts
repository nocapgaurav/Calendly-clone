import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getEventTypes, createEventType } from '@/lib/event-types'

// Default user ID - in production this would come from auth
async function getDefaultUserId(): Promise<string> {
  const sql = getDb()
  const result = (await sql`SELECT id FROM users WHERE email = 'host@calendly.demo' LIMIT 1`) as any[]
  if (result.length === 0) {
    throw new Error('Default user not found. Please run setup first.')
  }
  return result[0].id
}

export async function GET() {
  try {
    const userId = await getDefaultUserId()
    const eventTypes = await getEventTypes(userId)
    return NextResponse.json(eventTypes)
  } catch (error: unknown) {
    console.error('Error fetching event types:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch event types'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId()
    const body = await request.json()
    const { title, slug, duration, description, bufferTime, color } = body
    
    if (!title || !slug || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const eventType = await createEventType(
      userId,
      title,
      slug,
      duration,
      description,
      bufferTime,
      color
    )
    
    return NextResponse.json(eventType)
  } catch (error: unknown) {
    console.error('Error creating event type:', error)
    const message = error instanceof Error ? error.message : 'Failed to create event type'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
