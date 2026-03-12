'use client'

import { CheckCircle2, Calendar, Clock, Mail, User, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { Booking, EventType } from '@/lib/db'

interface BookingConfirmationProps {
  booking: Booking
  eventType: EventType
  onBookAnother?: () => void
}

export function BookingConfirmation({ booking, eventType, onBookAnother }: BookingConfirmationProps) {
  const startTime = new Date(booking.start_time)
  const endTime = new Date(booking.end_time)
  
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      
      <h2 className="mt-6 text-2xl font-bold text-foreground">You're all set!</h2>
      <p className="mt-2 text-muted-foreground">
        A calendar invitation has been sent to your email address.
      </p>
      
      <div className="mt-8 w-full max-w-md rounded-lg border border-border bg-card p-6 text-left">
        <h3 className="font-semibold text-lg text-foreground">{eventType.title}</h3>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')} 
              <span className="ml-1">({eventType.duration} min)</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{booking.guest_name}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{booking.guest_email}</span>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Need to make changes?</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/reschedule/${booking.id}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </Link>
            <Link
              href={`/cancel/${booking.id}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10">
                Cancel Meeting
              </Button>
            </Link>
          </div>
        </div>

      </div>
      
      {onBookAnother && (
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={onBookAnother}
        >
          Book Another Meeting
        </Button>
      )}
    </div>
  )
}
