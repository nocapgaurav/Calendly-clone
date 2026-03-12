'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EventTypeCard } from '@/components/dashboard/event-type-card'
import { EventTypeDialog } from '@/components/dashboard/event-type-dialog'
import type { EventType } from '@/lib/db'

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null)
  
  const fetchEventTypes = async () => {
    try {
      const res = await fetch('/api/event-types')
      if (res.ok) {
        const data = await res.json()
        setEventTypes(data)
      }
    } catch (error) {
      console.error('Error fetching event types:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchEventTypes()
  }, [])
  
  const handleCreate = () => {
    setEditingEventType(null)
    setDialogOpen(true)
  }
  
  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType)
    setDialogOpen(true)
  }
  
  const handleSave = async (data: Partial<EventType>) => {
    try {
      if (data.id) {
        await fetch(`/api/event-types/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/api/event-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      await fetchEventTypes()
    } catch (error) {
      console.error('Error saving event type:', error)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return
    
    try {
      await fetch(`/api/event-types/${id}`, { method: 'DELETE' })
      await fetchEventTypes()
    } catch (error) {
      console.error('Error deleting event type:', error)
    }
  }
  
  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/event-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      await fetchEventTypes()
    } catch (error) {
      console.error('Error toggling event type:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create events that let people book time with you.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Event Type
        </Button>
      </div>

      {eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Plus className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No event types yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-gray-500">
            Create your first event type to start accepting bookings from guests.
          </p>
          <Button
            onClick={handleCreate}
            className="mt-5 gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Event Type
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <EventTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventType={editingEventType}
        onSave={handleSave}
      />
    </div>
  )
}
