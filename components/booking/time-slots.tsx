'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { formatTimeFromDate } from '@/lib/slots'
import type { TimeSlot } from '@/lib/slots'

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  loading?: boolean
}

export function TimeSlots({ slots, selectedSlot, onSelectSlot, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-center">
        <p className="text-muted-foreground">
          No available time slots for this day.
          <br />
          Please select another date.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[360px] pr-4">
      <div className="grid gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.time === slot.time
          return (
            <Button
              key={slot.time}
              variant={isSelected ? 'default' : 'outline'}
              className={`justify-center rounded-xl py-6 text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'border-border hover:border-primary hover:bg-primary/5 hover:text-primary'
              }`}
              onClick={() => onSelectSlot(slot)}
            >
              {formatTimeFromDate(slot.startTime)}
            </Button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
