'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check } from 'lucide-react'
import type { Availability } from '@/lib/db'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const time24 = `${hour.toString().padStart(2, '0')}:${minute}`
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  const time12 = `${hour12}:${minute} ${period}`
  return { value: time24, label: time12 }
})

type AvailabilityMap = Record<number, { startTime: string; endTime: string; isActive: boolean }>

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilityMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  
  useEffect(() => {
    fetchAvailability()
  }, [])
  
  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/availability')
      if (res.ok) {
        const data: Availability[] = await res.json()
        const map: AvailabilityMap = {}
        
        // Initialize all days
        DAYS_OF_WEEK.forEach(day => {
          map[day.value] = { startTime: '09:00', endTime: '17:00', isActive: false }
        })
        
        // Override with database values
        data.forEach(a => {
          map[a.day_of_week] = {
            startTime: a.start_time.slice(0, 5),
            endTime: a.end_time.slice(0, 5),
            isActive: a.is_active,
          }
        })
        
        setAvailability(map)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSave = async (dayOfWeek: number) => {
    const day = availability[dayOfWeek]
    if (!day) return
    
    setSaving(dayOfWeek)
    
    try {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          isActive: day.isActive,
        }),
      })
      setSaved(dayOfWeek)
      setTimeout(() => setSaved(null), 2000)
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setSaving(null)
    }
  }
  
  const updateDay = (dayOfWeek: number, updates: Partial<AvailabilityMap[number]>) => {
    setAvailability(prev => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...updates },
    }))
  }

  const saveAllDays = async (data: AvailabilityMap) => {
    setSavingAll(true)
    try {
      await Promise.all(
        DAYS_OF_WEEK.map(({ value: dayOfWeek }) => {
          const day = data[dayOfWeek]
          if (!day) return Promise.resolve()
          return fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayOfWeek,
              startTime: day.startTime,
              endTime: day.endTime,
              isActive: day.isActive,
            }),
          })
        })
      )
    } catch (error) {
      console.error('Error saving all availability:', error)
    } finally {
      setSavingAll(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set your weekly hours when you are available for meetings.
        </p>
      </div>
      
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg">Weekly Hours</CardTitle>
          <CardDescription>
            Configure the times when guests can book meetings with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-8 pb-8">
          {DAYS_OF_WEEK.map((day) => {
            const dayAvailability = availability[day.value]
            if (!dayAvailability) return null
            
            return (
              <div
                key={day.value}
                className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={dayAvailability.isActive}
                    onCheckedChange={(checked) => updateDay(day.value, { isActive: checked })}
                  />
                  <span className="font-medium text-foreground">{day.label}</span>
                </div>
                
                {dayAvailability.isActive ? (
                  <div className="flex flex-1 items-center gap-4">
                    <Select
                      value={dayAvailability.startTime}
                      onValueChange={(value) => updateDay(day.value, { startTime: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-muted-foreground">to</span>
                    
                    <Select
                      value={dayAvailability.endTime}
                      onValueChange={(value) => updateDay(day.value, { endTime: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        onClick={() => handleSave(day.value)}
                        disabled={saving === day.value || savingAll}
                      >
                        {saving === day.value ? (
                          <Spinner className="h-4 w-4" />
                        ) : saved === day.value ? (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 px-8 pb-8">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={savingAll}
            onClick={async () => {
              const newData: AvailabilityMap = { ...availability }
              ;[1, 2, 3, 4, 5].forEach(day => {
                newData[day] = { startTime: '09:00', endTime: '17:00', isActive: true }
              })
              ;[0, 6].forEach(day => {
                newData[day] = {
                  ...(availability[day] ?? { startTime: '09:00', endTime: '17:00' }),
                  isActive: false,
                }
              })
              setAvailability(newData)
              await saveAllDays(newData)
            }}
          >
            Set Weekdays 9am–5pm
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={savingAll}
            onClick={async () => {
              const newData: AvailabilityMap = { ...availability }
              DAYS_OF_WEEK.forEach(({ value }) => {
                newData[value] = {
                  ...(availability[value] ?? { startTime: '09:00', endTime: '17:00' }),
                  isActive: false,
                }
              })
              setAvailability(newData)
              await saveAllDays(newData)
            }}
          >
            Clear All
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={savingAll}
            onClick={() => saveAllDays(availability)}
          >
            {savingAll && <Spinner className="mr-2 h-4 w-4" />}
            Save All
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
