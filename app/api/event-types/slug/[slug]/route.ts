import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const sql = getDb()
    const { slug } = await params
    const result = (await sql`
      SELECT * FROM event_types
      WHERE slug = ${slug}
      LIMIT 1
    `) as any[]
    const eventType = result[0] || null
    
    if (!eventType) {
      return new Response(JSON.stringify({ error: 'Event type not found' }), { status: 404 })
    }

    if (!eventType.is_active) {
      return new Response(JSON.stringify({ error: 'Event type disabled' }), { status: 404 })
    }
    
    // Get host info
    const user = (await sql`SELECT name, email FROM users WHERE id = ${eventType.user_id}`) as any[]
    
    return Response.json({
      eventType,
      host: user[0] || null,
    })
  } catch (error) {
    console.error('Error fetching event type:', error)
    return NextResponse.json({ error: 'Failed to fetch event type' }, { status: 500 })
  }
}
