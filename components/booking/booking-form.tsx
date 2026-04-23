'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, Globe } from 'lucide-react'

interface BookingFormProps {
  onSubmit: (data: { name: string; email: string; notes?: string; timezone: string }) => Promise<void>
  onBack: () => void
  loading?: boolean
}

export function BookingForm({ onSubmit, onBack, loading }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [timezone, setTimezone] = useState('')

  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(detectedTimezone)
    } catch (error) {
      console.error('Error detecting timezone:', error)
      setTimezone('UTC') // Fallback to UTC
    }
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, email, notes: notes || undefined, timezone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2 gap-2 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      
      <div>
        <h2 className="text-lg font-semibold text-foreground">Enter your details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Fill in your information to complete the booking.</p>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Your Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={loading}
            className="h-11 rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            disabled={loading}
            className="h-11 rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you'd like to share before the meeting..."
            rows={4}
            disabled={loading}
            className="rounded-xl resize-none"
          />
        </div>

        {/* Timezone display */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Timezone: <span className="font-medium text-foreground">{timezone}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Meeting times will be displayed in your local timezone
            </p>
          </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-sm" disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Schedule Meeting
      </Button>
    </form>
  )
}
