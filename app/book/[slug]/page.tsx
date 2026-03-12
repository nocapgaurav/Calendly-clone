'use client'

import { use, useState, useEffect } from 'react'
import { format, addDays, startOfDay, isWeekend, isBefore } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Clock, User, Globe, AlertCircle, ChevronRight } from 'lucide-react'
import { TimeSlots } from '@/components/booking/time-slots'
import { BookingForm } from '@/components/booking/booking-form'
import { BookingConfirmation } from '@/components/booking/booking-confirmation'
import type { EventType, Booking } from '@/lib/db'
import type { TimeSlot } from '@/lib/slots'

type BookingStep = 'select-date' | 'select-time' | 'enter-details' | 'confirmed'

// Human-readable step labels for the breadcrumb
const STEP_LABELS: Record<BookingStep, string> = {
  'select-date': 'Select Date',
  'select-time': 'Select Time',
  'enter-details': 'Your Details',
  confirmed: 'Confirmed',
}
const STEP_ORDER: BookingStep[] = [
  'select-date',
  'select-time',
  'enter-details',
  'confirmed',
]

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<BookingStep>('select-date')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [host, setHost] = useState<{ name: string; email: string } | null>(null)
  const [availableDays, setAvailableDays] = useState<number[]>([])

  // Fetch event type, host info, and available days on mount
  useEffect(() => {
    async function fetchEventType() {
      try {
        const [slugRes, availRes] = await Promise.all([
          fetch(`/api/event-types/slug/${slug}`),
          fetch('/api/availability'),
        ])
        if (!slugRes.ok) {
          const errData = await slugRes.json().catch(() => ({}))
          throw new Error(errData.error || 'Event type not found')
        }
        const slugData = await slugRes.json()
        if (!slugData.eventType) throw new Error('Event type not found')
        setEventType(slugData.eventType)
        setHost(slugData.host ?? null)
        if (availRes.ok) {
          const availData: { is_active: boolean; day_of_week: number }[] = await availRes.json()
          if (Array.isArray(availData)) {
            setAvailableDays(availData.filter((a) => a.is_active).map((a) => a.day_of_week))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Event type not found')
      } finally {
        setLoading(false)
      }
    }
    fetchEventType()
  }, [slug])

  // Fetch slots whenever the selected date changes
  useEffect(() => {
    if (!selectedDate || !eventType) return

    async function fetchSlots() {
      setLoadingSlots(true)
      setSlots([])
      try {
        const res = await fetch(
          `/api/slots?slug=${slug}&date=${selectedDate!.toISOString()}`
        )
        if (res.ok) {
          const data = await res.json()
          setSlots(data.slots || [])
        }
      } catch (err) {
        console.error('Error fetching slots:', err)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [selectedDate, slug, eventType])

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setBookingError(null)
    if (date) setStep('select-time')
  }

  const handleSlotSelect = (slot: TimeSlot) => {
  setSelectedSlot({
    ...slot,
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  })

  setBookingError(null)
  setStep('enter-details')

  }

  const handleSubmit = async (data: { name: string; email: string; notes?: string; timezone: string }) => {
    if (!selectedSlot || !eventType) return

    setSubmitting(true)
    setBookingError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          guestName: data.name,
          guestEmail: data.email,
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString(),
          notes: data.notes,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to book')
      }

      const bookingData = await res.json()
      setBooking(bookingData)
      setStep('confirmed')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setBookingError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBookAnother = () => {
    setStep('select-date')
    setSelectedDate(undefined)
    setSelectedSlot(null)
    setBooking(null)
    setBookingError(null)
  }

  // -----------------------------------------------------------------------
  // Disabled-days predicate for the calendar
  // Past dates are always disabled. On days with availability data, disable
  // any day-of-week the host hasn't marked as active; otherwise fall back to
  // blocking weekends until availability finishes loading.
  // -----------------------------------------------------------------------
  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date())
    if (isBefore(date, today)) return true
    if (availableDays.length > 0) {
      return !availableDays.includes(date.getDay())
    }
    // Fallback while availability is still loading
    return isWeekend(date)
  }

  // -----------------------------------------------------------------------
  // Loading / error screens
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !eventType) {
    const isDisabled = error === 'Event type disabled'
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">
              {isDisabled ? 'Event Type Disabled' : 'Event Not Found'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isDisabled
                ? 'This event type is currently disabled and not accepting bookings.'
                : "The event type you're looking for doesn't exist."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  const currentStepIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Step breadcrumb */}
        {step !== 'confirmed' && (
          <div className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
            {STEP_ORDER.filter((s) => s !== 'confirmed').map((s, idx) => (
              <span key={s} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <span
                  className={
                    idx === currentStepIndex
                      ? 'font-semibold text-primary'
                      : idx < currentStepIndex
                      ? 'text-foreground'
                      : ''
                  }
                >
                  {STEP_LABELS[s]}
                </span>
              </span>
            ))}
          </div>
        )}

        <Card className="overflow-hidden rounded-2xl border-border shadow-lg">
          <div className="grid md:grid-cols-[360px,1fr]">
            {/* ---- Left Panel — Event Info ---- */}
            <div className="border-r border-border bg-card p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                {host
                  ? host.name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'DH'}
              </div>

              <p className="mt-5 text-sm text-muted-foreground">{host?.name ?? 'Demo Host'}</p>

              <h1 className="mt-2 text-2xl font-bold text-foreground leading-tight">
                {eventType.title}
              </h1>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary/70" />
                  <span className="text-sm font-medium">{eventType.duration} min</span>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="h-5 w-5 text-primary/70" />
                  <span className="text-sm font-medium">Web conferencing</span>
                </div>
              </div>

              {eventType.description && (
                <div className="mt-8 border-t border-border pt-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {eventType.description}
                  </p>
                </div>
              )}

              {/* Selected date + time summary */}
              {selectedDate && step !== 'select-date' && (
                <div className="mt-8 border-t border-border pt-8 space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  {selectedSlot && (
                    <p className="text-sm text-primary font-medium">
                      {format(selectedSlot.startTime, 'h:mm a')}
                      {' '}–{' '}
                      {format(selectedSlot.endTime, 'h:mm a')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ---- Right Panel — Booking Flow ---- */}
            <div className="p-10 bg-background">
              {step === 'confirmed' && booking ? (
                <BookingConfirmation
                  booking={booking}
                  eventType={eventType}
                  onBookAnother={handleBookAnother}
                />
              ) : step === 'enter-details' ? (
                <div className="space-y-6">
                  {bookingError && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}
                  <BookingForm
                    onSubmit={handleSubmit}
                    onBack={() => {
                      setBookingError(null)
                      setStep('select-time')
                    }}
                    loading={submitting}
                  />
                </div>
              ) : (
                <div className="grid gap-10 lg:grid-cols-2">
                  {/* Calendar */}
                  <div>
                    <h2 className="mb-5 text-base font-semibold text-foreground">
                      Select a Date
                    </h2>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={disabledDays}
                      className="rounded-xl border p-3"
                      fromDate={new Date()}
                      toDate={addDays(new Date(), 60)}
                    />
                    <p className="mt-3 text-xs text-muted-foreground">
                      Only highlighted dates have available time slots.
                    </p>
                  </div>

                  {/* Time slots */}
                  {selectedDate && (
                    <div>
                      <h2 className="mb-5 text-base font-semibold text-foreground">
                        {format(selectedDate, 'EEEE, MMMM d')}
                      </h2>
                      {loadingSlots ? (
                        <div className="flex h-64 items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <Spinner className="h-6 w-6" />
                            <p className="text-sm text-muted-foreground">
                              Loading available times…
                            </p>
                          </div>
                        </div>
                      ) : (
                        <TimeSlots
                          slots={slots}
                          selectedSlot={selectedSlot}
                          onSelectSlot={handleSlotSelect}
                          loading={false}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
