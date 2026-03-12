import { NextResponse } from 'next/server'
import { getEventTypeBySlug } from '@/lib/event-types'
import { getAvailabilityForDay } from '@/lib/availability'
import { getBookingsForDate } from '@/lib/bookings'
import { generateTimeSlots } from '@/lib/slots'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const dateStr = searchParams.get('date')
    
    if (!slug || !dateStr) {
      return NextResponse.json({ error: 'Missing slug or date' }, { status: 400 })
    }
    
    // Get event type
    const eventType = await getEventTypeBySlug(slug)
    if (!eventType) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }
    
    // Parse date
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()
    
    // Get availability for this day
    const availability = await getAvailabilityForDay(eventType.user_id, dayOfWeek)
    
    if (!availability) {
      return NextResponse.json({ slots: [], message: 'No availability for this day' })
    }
    
    // Get existing bookings for this date
    const bookings = await getBookingsForDate(eventType.id, date)
    
    // Generate available slots
    const slots = generateTimeSlots(
      date,
      availability.start_time,
      availability.end_time,
      eventType.duration,
      eventType.buffer_time,
      bookings.map(b => ({ start_time: b.start_time, end_time: b.end_time }))
    )
    
    return NextResponse.json({ 
      slots: slots.filter(s => s.available),
      eventType,
      availability 
    })
  } catch (error: unknown) {
    console.error('Error fetching slots:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch slots'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
