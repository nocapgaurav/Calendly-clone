import { NextResponse } from 'next/server'
import { getBookingById, rescheduleBooking } from '@/lib/bookings'
import { sendBookingConfirmationEmail } from '../../../../../lib/email'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Parse request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { startTime, endTime } = body as {
      startTime?: string
      endTime?: string
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: startTime, endTime' },
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

    // Get original booking details
    const originalBooking = await getBookingById(id)
    if (!originalBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (originalBooking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Cannot reschedule cancelled or completed bookings' },
        { status: 400 }
      )
    }

    // Reschedule the booking
    const updatedBooking = await rescheduleBooking(id, parsedStart, parsedEnd)

    // Send updated confirmation email
    try {
      await sendBookingConfirmationEmail({
        guestName: updatedBooking.guest_name,
        guestEmail: updatedBooking.guest_email,
        eventName: originalBooking.event_title,
        startTime: updatedBooking.start_time,
      })
    } catch (emailError) {
      console.error('Failed to send reschedule confirmation email (non-critical):', emailError)
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    if (error instanceof Error && error.message.includes('already booked')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : 'Failed to reschedule booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}