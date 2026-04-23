'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Copy, Check, ExternalLink, Plus, Calendar } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import type { EventType } from '@/lib/db'

function EventCard({ eventType }: { eventType: EventType }) {
  const [copied, setCopied] = useState(false)
  const bookingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/book/${eventType.slug}`
      : `/book/${eventType.slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Colour accent bar */}
      <div className="h-1.5 w-full rounded-t-xl" style={{ backgroundColor: eventType.color }} />

      <div className="flex flex-1 flex-col p-6">
        {/* Status indicator */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              eventType.is_active
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                eventType.is_active ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            {eventType.is_active ? 'Active' : 'Inactive'}
          </span>

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{eventType.duration} min</span>
          </div>
        </div>

        {/* Title & description */}
        <h3 className="text-base font-semibold text-gray-900">{eventType.title}</h3>
        {eventType.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {eventType.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider + actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </button>

          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/event-types')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEventTypes(Array.isArray(data) ? data : []))
      .catch(() => setEventTypes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create events that let people book time with you.
          </p>
        </div>
        <Link
          href="/dashboard/event-types"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New event type
        </Link>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Calendar className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No event types yet</h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Create your first event type so guests can start booking time with you.
          </p>
          <Link
            href="/dashboard/event-types"
            className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create event type
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((et) => (
            <EventCard key={et.id} eventType={et} />
          ))}
        </div>
      )}
    </div>
  )
}
