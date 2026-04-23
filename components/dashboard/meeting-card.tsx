'use client'

import { format } from 'date-fns'
import { Clock, Mail, User, X, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BookingWithEventType } from '@/lib/db'

interface MeetingCardProps {
  booking: BookingWithEventType
  onCancel?: (id: string) => void
  onReschedule?: (id: string) => void
  isPast?: boolean
  statusBadge?: React.ReactNode
}

export function MeetingCard({ booking, onCancel, onReschedule, isPast, statusBadge }: MeetingCardProps) {
  const startTime = new Date(booking.start_time)
  const endTime = new Date(booking.end_time)
  return (
    <Card className="overflow-hidden rounded-xl border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex">
          {/* Date Column */}
          <div className="flex w-28 flex-col items-center justify-center border-r border-border bg-primary/5 p-5">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {format(startTime, 'MMM')}
            </span>
            <span className="text-3xl font-bold text-foreground">
              {format(startTime, 'd')}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              {format(startTime, 'EEE')}
            </span>
          </div>
          
          {/* Content Column */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-foreground">
                    {booking.event_title}
                  </h3>
                  {statusBadge}
                </div>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <span>
                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')} 
                      <span className="ml-1 text-xs">({booking.event_duration} min)</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4 text-primary/70" />
                    <span>{booking.guest_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span>{booking.guest_email}</span>
                  </div>

                </div>
                
                {booking.notes && (
                  <p className="mt-4 text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
                    "{booking.notes}"
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {!isPast && booking.status === 'confirmed' && onReschedule && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
                    onClick={() => onReschedule(booking.id)}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reschedule
                  </Button>
                )}
                
                {!isPast && (booking.status === 'confirmed' || booking.status === 'rescheduled') && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => onCancel(booking.id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                )}

              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
