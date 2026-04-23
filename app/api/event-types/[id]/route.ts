import { NextResponse } from 'next/server'
import { getEventTypeById, updateEventType, deleteEventType } from '@/lib/event-types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventType = await getEventTypeById(id)
    
    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }
    
    return NextResponse.json(eventType)
  } catch (error) {
    console.error('Error fetching event type:', error)
    return NextResponse.json({ error: 'Failed to fetch event type' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const eventType = await updateEventType(id, body)
    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }
    return NextResponse.json(eventType)
  } catch (error: unknown) {
    console.error('Error updating event type:', error)
    const message = error instanceof Error ? error.message : 'Failed to update event type'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteEventType(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting event type:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete event type'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
