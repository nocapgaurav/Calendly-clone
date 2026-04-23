import { getDb, type Booking, type BookingWithEventType } from './db'

export async function getBookingsForDate(eventTypeId: string, date: Date): Promise<Booking[]> {
  const sql = getDb()
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  const result = await sql`
    SELECT * FROM bookings 
    WHERE event_type_id = ${eventTypeId}
    AND start_time >= ${startOfDay.toISOString()}
    AND start_time <= ${endOfDay.toISOString()}
    AND status = 'confirmed'
  `
  return result as Booking[]
}

export async function getUpcomingBookings(userId: string): Promise<BookingWithEventType[]> {
  const sql = getDb()
  const now = new Date().toISOString()
  const result = await sql`
    SELECT b.*, et.title as event_title, et.duration as event_duration
    FROM bookings b
    JOIN event_types et ON b.event_type_id = et.id
    WHERE et.user_id = ${userId}
    AND b.start_time >= ${now}
    ORDER BY b.start_time ASC
  `
  return result as BookingWithEventType[]
}

export async function getPastBookings(userId: string): Promise<BookingWithEventType[]> {
  const sql = getDb()
  const now = new Date().toISOString()
  const result = await sql`
    SELECT b.*, et.title as event_title, et.duration as event_duration
    FROM bookings b
    JOIN event_types et ON b.event_type_id = et.id
    WHERE et.user_id = ${userId}
    AND (b.start_time < ${now} OR b.status IN ('cancelled', 'completed'))
    ORDER BY b.start_time DESC
    LIMIT 50
  `
  return result as BookingWithEventType[]
}

export async function getCancelledBookings(userId: string): Promise<BookingWithEventType[]> {
  const sql = getDb()
  const result = await sql`
    SELECT b.*, et.title as event_title, et.duration as event_duration
    FROM bookings b
    JOIN event_types et ON b.event_type_id = et.id
    WHERE et.user_id = ${userId}
    AND b.status = 'cancelled'
    ORDER BY b.created_at DESC
    LIMIT 50
  `
  return result as BookingWithEventType[]
}

export async function createBooking(
  eventTypeId: string,
  guestName: string,
  guestEmail: string,
  startTime: Date,
  endTime: Date,
  notes?: string
): Promise<Booking> {
  const sql = getDb()

  // Check for overlapping bookings (not just exact start_time match).
  // Two ranges overlap when: existingStart < newEnd AND newStart < existingEnd
  const existing = (await sql`
    SELECT id FROM bookings
    WHERE event_type_id = ${eventTypeId}
      AND status = 'confirmed'
      AND start_time < ${endTime.toISOString()}
      AND end_time   > ${startTime.toISOString()}
  `) as any[]

  if (existing.length > 0) {
    throw new Error('This time slot is already booked')
  }
  
  const result = (await sql`
    INSERT INTO bookings (event_type_id, guest_name, guest_email, start_time, end_time, notes, status)
    VALUES (${eventTypeId}, ${guestName}, ${guestEmail}, ${startTime.toISOString()}, ${endTime.toISOString()}, ${notes || null}, 'confirmed')
    RETURNING *
  `) as any[]
  return result[0] as Booking
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  const sql = getDb()
  const result = (await sql`
    UPDATE bookings 
    SET status = 'cancelled'
    WHERE id = ${bookingId}
    RETURNING *
  `) as any[]
  return result[0] as Booking
}

export async function rescheduleBooking(
  bookingId: string,
  newStartTime: Date,
  newEndTime: Date
): Promise<Booking> {
  const sql = getDb()

  // Get the existing booking to check event type
  const existing = (await sql`
    SELECT * FROM bookings
    WHERE id = ${bookingId} AND status = 'confirmed'
    LIMIT 1
  `) as any[]

  if (existing.length === 0) {
    throw new Error('Booking not found or already cancelled')
  }

  const booking = existing[0]

  // Check for overlapping bookings in the new time slot (excluding current booking)
  const overlapping = (await sql`
    SELECT id FROM bookings
    WHERE event_type_id = ${booking.event_type_id}
      AND id != ${bookingId}
      AND status = 'confirmed'
      AND start_time < ${newEndTime.toISOString()}
      AND end_time   > ${newStartTime.toISOString()}
  `) as any[]

  if (overlapping.length > 0) {
    throw new Error('The new time slot is already booked')
  }

  const result = (await sql`
    UPDATE bookings 
    SET start_time = ${newStartTime.toISOString()},
        end_time = ${newEndTime.toISOString()},
        status = 'rescheduled'
    WHERE id = ${bookingId}
    RETURNING *
  `) as any[]
  return result[0] as Booking
}

export async function getBookingById(bookingId: string): Promise<BookingWithEventType | null> {
  const sql = getDb()
  const result = (await sql`
    SELECT b.*, et.title as event_title, et.duration as event_duration, et.description as event_description
    FROM bookings b
    JOIN event_types et ON b.event_type_id = et.id
    WHERE b.id = ${bookingId}
    LIMIT 1
  `) as any[]
  
  return result.length > 0 ? (result[0] as BookingWithEventType) : null
}
