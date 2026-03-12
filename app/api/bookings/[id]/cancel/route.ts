import { NextResponse } from 'next/server'
import { cancelBooking, getBookingById } from '@/lib/bookings'
import { sendBookingCancellationEmail } from '@/lib/email'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const cancelledBooking = await cancelBooking(id)

    try {
      await sendBookingCancellationEmail({
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        eventName: booking.event_title,
        startTime: booking.start_time,
      })
    } catch (emailError) {
      console.error('Failed to send cancellation email (non-critical):', emailError)
    }

    return NextResponse.json({ success: true, booking: cancelledBooking })
  } catch (error: unknown) {
    console.error('Error cancelling booking:', error)
    const message = error instanceof Error ? error.message : 'Failed to cancel booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
