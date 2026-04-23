import { format, parse, addMinutes, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns'

export type TimeSlot = {
  time: string
  startTime: Date
  endTime: Date
  available: boolean
}

export function generateTimeSlots(
  date: Date,
  startTime: string,
  endTime: string,
  duration: number,
  bufferTime: number = 0,
  bookedSlots: { start_time: string; end_time: string }[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const dayStart = startOfDay(date)
  
  // Parse start and end times
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  let currentSlotStart = new Date(dayStart)
  currentSlotStart.setHours(startHour, startMin, 0, 0)
  
  const dayEnd = new Date(dayStart)
  dayEnd.setHours(endHour, endMin, 0, 0)
  
  const now = new Date()
  // Each slot occupies: meeting duration + buffer gap before next meeting
  const slotInterval = duration + bufferTime

  while (isBefore(currentSlotStart, dayEnd)) {
    const slotEnd = addMinutes(currentSlotStart, duration)

    // Check if slot end time is within availability window
    if (isAfter(slotEnd, dayEnd)) {
      break
    }

    // Check if slot is in the past
    const isPast = isBefore(currentSlotStart, now)

    // Effective occupied range: the meeting itself PLUS the trailing buffer.
    // This ensures no other meeting can start within bufferTime after this one ends.
    const effectiveEnd = addMinutes(slotEnd, bufferTime)

    // Check if the effective occupied range overlaps with any confirmed booking.
    // A booking at [bStart, bEnd) also has its own buffer, so we extend it by
    // bufferTime as well when checking for collisions.
    const isBooked = bookedSlots.some(booking => {
      const bookingStart = new Date(booking.start_time)
      const bookingEnd = new Date(booking.end_time)
      const bookingEffectiveEnd = addMinutes(bookingEnd, bufferTime)

      // Two intervals [A,B) and [C,D) overlap when A < D && C < B
      return (
        currentSlotStart < bookingEffectiveEnd &&
        bookingStart < effectiveEnd
      )
    })

    slots.push({
      time: format(currentSlotStart, 'HH:mm'),
      startTime: new Date(currentSlotStart),
      endTime: new Date(slotEnd),
      available: !isPast && !isBooked,
    })

    currentSlotStart = addMinutes(currentSlotStart, slotInterval)
  }
  
  return slots
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatTimeFromDate(date: Date): string {
  return format(date, 'h:mm a')
}
