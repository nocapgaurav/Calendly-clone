'use client'

import { use, useState, useEffect } from 'react'
import { format, addDays, startOfDay, isWeekend, isBefore } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Clock, User, Calendar as CalendarIcon, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import { TimeSlots } from '@/components/booking/time-slots'
import type { BookingWithEventType } from '@/lib/db'
import type { TimeSlot } from '@/lib/slots'

type RescheduleStep = 'view-current' | 'select-date' | 'select-time' | 'confirmed'

export default function ReschedulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [booking, setBooking] = useState<BookingWithEventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<RescheduleStep>('view-current')

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<number[]>([])

  // Fetch booking details
  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings/${id}`)
        if (!response.ok) {
          throw new Error('Booking not found')
        }
        const bookingData = await response.json()
        setBooking(bookingData)

        // Also fetch availability
        const availRes = await fetch('/api/availability')
        if (availRes.ok) {
          const availData: { is_active: boolean; day_of_week: number }[] = await availRes.json()
          if (Array.isArray(availData)) {
            setAvailableDays(availData.filter((a) => a.is_active).map((a) => a.day_of_week))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id])

  // Fetch slots when date is selected
  useEffect(() => {
    if (!selectedDate || !booking) return

    async function fetchSlots() {
      setLoadingSlots(true)
      setSlots([])
      try {
        // Get the event type slug from the booking
        const eventTypeRes = await fetch(`/api/event-types/${booking!.event_type_id}`)
        if (eventTypeRes.ok) {
          const eventTypeData = await eventTypeRes.json()
          const slug = eventTypeData.slug

          const res = await fetch(
            `/api/slots?slug=${slug}&date=${selectedDate!.toISOString()}`
          )
          if (res.ok) {
            const data = await res.json()
            setSlots(data.slots || [])
          }
        }
      } catch (err) {
        console.error('Error fetching slots:', err)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    
    fetchSlots()
  }, [selectedDate, booking])

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
    })
    setRescheduleError(null)
  }

  const handleConfirmReschedule = async () => {
    if (!selectedSlot || !booking) return

    setSubmitting(true)
    setRescheduleError(null)

    try {
      const response = await fetch(`/api/bookings/${id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to reschedule')
      }

      setStep('confirmed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setRescheduleError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date())
    if (isBefore(date, today)) return true
    if (availableDays.length > 0) {
      return !availableDays.includes(date.getDay())
    }
    return isWeekend(date)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold">Booking Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (step === 'confirmed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="w-full max-w-lg p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Meeting Rescheduled!</h1>
              <p className="text-muted-foreground">
                Your meeting has been successfully rescheduled to{' '}
                {selectedSlot && format(selectedSlot.startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive an updated confirmation email shortly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <a href="/dashboard/meetings">View All Meetings</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Reschedule Meeting
          </h1>
          <p className="text-muted-foreground">
            Select a new time for your meeting with {booking.event_title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current booking info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5" />
                  Current Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meeting</p>
                  <p className="font-semibold">{booking.event_title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Time</p>
                  <p className="font-medium">
                    {format(new Date(booking.start_time), "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_time), "h:mm a")} -{' '}
                    {format(new Date(booking.end_time), "h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendee</p>
                  <p className="font-medium">{booking.guest_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reschedule interface */}
          <div className="lg:col-span-2">
            {step === 'view-current' && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-lg font-semibold">Ready to reschedule?</h3>
                    <p className="text-muted-foreground">
                      Choose a new date and time for your meeting
                    </p>
                    <Button onClick={() => setStep('select-date')} size="lg">
                      Select New Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'select-date' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('view-current')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">Select a date</h3>
                  </div>
                  
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      if (date) setStep('select-time')
                    }}
                    disabled={disabledDays}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            )}

            {step === 'select-time' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('select-date')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-muted-foreground">Select a time slot</p>
                    </div>
                  </div>

                  {rescheduleError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{rescheduleError}</p>
                    </div>
                  )}

                  <TimeSlots
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSlotSelect}
                    loading={loadingSlots}
                  />

                  {selectedSlot && (
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleConfirmReschedule}
                        disabled={submitting}
                        size="lg"
                      >
                        {submitting && <Spinner className="mr-2 h-4 w-4" />}
                        Confirm Reschedule
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}