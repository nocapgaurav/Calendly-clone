import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getUpcomingBookings, getPastBookings, getCancelledBookings, createBooking } from '@/lib/bookings'
import { sendBookingConfirmationEmail } from '../../../lib/email'

async function getDefaultUserId(): Promise<string> {
  const sql = getDb()
  const result = (await sql`SELECT id FROM users WHERE email = 'host@calendly.demo' LIMIT 1`) as any[]
  if (result.length === 0) {
    throw new Error('Default user not found')
  }
  return result[0].id
}

export async function GET(request: Request) {
  try {
    const userId = await getDefaultUserId()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'upcoming'

    let bookings
    switch (type) {
      case 'past':
        bookings = await getPastBookings(userId)
        break
      case 'cancelled':
        bookings = await getCancelledBookings(userId)
        break
      case 'upcoming':
      default:
        bookings = await getUpcomingBookings(userId)
        break
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch bookings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // --- Parse & validate body ---
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { eventTypeId, guestName, guestEmail, startTime, endTime, notes } = body as {
      eventTypeId?: string
      guestName?: string
      guestEmail?: string
      startTime?: string
      endTime?: string
      notes?: string
    }

    if (!eventTypeId || !guestName || !guestEmail || !startTime || !endTime) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['eventTypeId', 'guestName', 'guestEmail', 'startTime', 'endTime'],
        },
        { status: 400 }
      )
    }

    const parsedStart = new Date(startTime)
    const parsedEnd = new Date(endTime)

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: 'Invalid startTime or endTime' }, { status: 400 })
    }

    if (parsedStart >= parsedEnd) {
      return NextResponse.json(
        { error: 'startTime must be before endTime' },
        { status: 400 }
      )
    }

    // --- Create the booking ---
    const booking = await createBooking(
      eventTypeId,
      guestName,
      guestEmail,
      parsedStart,
      parsedEnd,
      notes
    )

    // --- Send email confirmation (non-blocking, never crashes the request) ---
    try {
      const sql = getDb()
      const rows = (await sql`
        SELECT et.title
        FROM event_types et
        WHERE et.id = ${eventTypeId}
        LIMIT 1
      `) as any[]
      if (rows.length > 0) {
        const row = rows[0] as {
          title: string
        }
        await sendBookingConfirmationEmail({
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          eventName: row.title,
          startTime: booking.start_time,
        })
      }
    } catch (emailLookupErr) {
      console.error('Could not load event details for email:', emailLookupErr)
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating booking:', error)
    if (error instanceof Error && error.message === 'This time slot is already booked') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : 'Failed to create booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
