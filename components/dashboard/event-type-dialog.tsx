'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { EventType } from '@/lib/db'

interface EventTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventType?: EventType | null
  onSave: (data: Partial<EventType>) => Promise<void>
}

const COLORS = [
  '#0066FF',
  '#00CC66',
  '#FF6600',
  '#9933FF',
  '#FF3366',
  '#00CCCC',
]

export function EventTypeDialog({ open, onOpenChange, eventType, onSave }: EventTypeDialogProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [duration, setDuration] = useState('30')
  const [description, setDescription] = useState('')
  const [bufferTime, setBufferTime] = useState('0')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    if (eventType) {
      setTitle(eventType.title)
      setSlug(eventType.slug)
      setDuration(String(eventType.duration))
      setDescription(eventType.description || '')
      setBufferTime(String(eventType.buffer_time))
      setColor(eventType.color)
    } else {
      setTitle('')
      setSlug('')
      setDuration('30')
      setDescription('')
      setBufferTime('0')
      setColor(COLORS[0])
    }
  }, [eventType, open])
  
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!eventType) {
      setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await onSave({
        id: eventType?.id,
        title,
        slug,
        duration: parseInt(duration),
        description,
        buffer_time: parseInt(bufferTime),
        color,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {eventType ? 'Edit Event Type' : 'Create Event Type'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="30 Minute Meeting"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/book/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="30-min-meeting"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                <Input
                  id="bufferTime"
                  type="number"
                  min="0"
                  max="60"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this meeting type..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              {eventType ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
