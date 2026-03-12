import { NextResponse } from 'next/server'
import { getBookingById, cancelBooking } from '@/lib/bookings'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await getBookingById(id)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }
    
    // Get booking details before cancelling
    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Cancel the booking
    const cancelledBooking = await cancelBooking(id)

    return NextResponse.json(cancelledBooking)
  } catch (error: unknown) {
    console.error('Error canceling booking:', error)
    const message = error instanceof Error ? error.message : 'Failed to cancel booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
