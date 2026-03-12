import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getAvailability, upsertAvailability } from '@/lib/availability'

async function getDefaultUserId(): Promise<string> {
  const sql = getDb()
  const result = (await sql`SELECT id FROM users WHERE email = 'host@calendly.demo' LIMIT 1`) as any[]
  if (result.length === 0) {
    throw new Error('Default user not found')
  }
  return result[0].id
}

export async function GET() {
  try {
    const userId = await getDefaultUserId()
    const availability = await getAvailability(userId)
    return NextResponse.json(availability)
  } catch (error: unknown) {
    console.error('Error fetching availability:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch availability'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDefaultUserId()
    const body = await request.json()
    const { dayOfWeek, startTime, endTime, isActive } = body
    
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const availability = await upsertAvailability(
      userId,
      dayOfWeek,
      startTime,
      endTime,
      isActive ?? true
    )
    
    return NextResponse.json(availability)
  } catch (error: unknown) {
    console.error('Error updating availability:', error)
    const message = error instanceof Error ? error.message : 'Failed to update availability'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
