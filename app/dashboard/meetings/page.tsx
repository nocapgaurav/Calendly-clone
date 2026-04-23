'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { MeetingCard } from '@/components/dashboard/meeting-card'
import { CalendarX, Calendar, Clock, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { BookingWithEventType } from '@/lib/db'

export default function MeetingsPage() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<BookingWithEventType[]>([])
  const [pastMeetings, setPastMeetings] = useState<BookingWithEventType[]>([])
  const [cancelledMeetings, setCancelledMeetings] = useState<BookingWithEventType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  
  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        fetch('/api/bookings?type=upcoming'),
        fetch('/api/bookings?type=past'),
      ])
      
      if (upcomingRes.ok) {
        const upcoming = await upcomingRes.json()
        // Separate upcoming by status
        setUpcomingMeetings(upcoming.filter((b: any) => 
          (b.status === 'confirmed' || b.status === 'rescheduled') && 
          new Date(b.start_time) > new Date()
        ))
        setCancelledMeetings(upcoming.filter((b: any) => b.status === 'cancelled'))
      }
      if (pastRes.ok) {
        const past = await pastRes.json()
        setPastMeetings(past.filter((b: any) => 
          b.status === 'completed' || 
          (b.status === 'confirmed' && new Date(b.start_time) < new Date())
        ))
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchMeetings()
  }, [])
  
  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return
    
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      await fetchMeetings() // Refresh all meeting lists
    } catch (error) {
      console.error('Error canceling meeting:', error)
    }
  }

  const handleReschedule = (id: string) => {
    window.location.href = `/reschedule/${id}`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">No meetings</h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">{message}</p>
    </div>
  )

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { icon: CheckCircle, label: 'Confirmed', className: 'bg-green-100 text-green-800 border-green-200' },
      rescheduled: { icon: Clock, label: 'Rescheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      cancelled: { icon: X, label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
      completed: { icon: CheckCircle, label: 'Completed', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.confirmed
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meetings</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            View and manage your scheduled meetings.
          </p>
        </div>
        <Button onClick={fetchMeetings} variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-11 rounded-xl p-1">
          <TabsTrigger value="upcoming" className="rounded-lg px-4">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg px-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            Past ({pastMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg px-4">
            <X className="h-4 w-4 mr-2" />
            Cancelled ({cancelledMeetings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-8">
          {upcomingMeetings.length === 0 ? (
            <EmptyState 
              message="You don't have any upcoming meetings. Share your booking link to get started." 
              icon={Calendar}
            />
          ) : (
            <div className="space-y-5">
              {upcomingMeetings
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((booking) => (
                <MeetingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                  statusBadge={getStatusBadge(booking.status)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-8">
          {pastMeetings.length === 0 ? (
            <EmptyState 
              message="You don't have any past meetings yet." 
              icon={CheckCircle}
            />
          ) : (
            <div className="space-y-5">
              {pastMeetings
                .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                .map((booking) => (
                <MeetingCard
                  key={booking.id}
                  booking={booking}
                  isPast
                  statusBadge={getStatusBadge(booking.status)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-8">
          {cancelledMeetings.length === 0 ? (
            <EmptyState 
              message="No cancelled meetings." 
              icon={X}
            />
          ) : (
            <div className="space-y-5">
              {cancelledMeetings
                .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                .map((booking) => (
                <MeetingCard
                  key={booking.id}
                  booking={booking}
                  isPast
                  statusBadge={getStatusBadge(booking.status)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
