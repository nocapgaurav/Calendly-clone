'use client'

import { useState } from 'react'
import {
  Clock,
  Link2,
  Pencil,
  Trash2,
  Copy,
  Check,
  MoreVertical,
  ExternalLink,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EventType } from '@/lib/db'

interface EventTypeCardProps {
  eventType: EventType
  onEdit: (eventType: EventType) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
}

export function EventTypeCard({ eventType, onEdit, onDelete, onToggle }: EventTypeCardProps) {
  const [copied, setCopied] = useState(false)

  const bookingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/book/${eventType.slug}`
      : `/book/${eventType.slug}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Colour accent top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: eventType.color }} />

      <div className="flex flex-1 flex-col px-5 py-5">
        {/* Header row: title + toggle + menu */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-900">{eventType.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {eventType.duration} min
              </span>
              {eventType.buffer_time > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                  +{eventType.buffer_time} min buffer
                </span>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={eventType.is_active}
              onCheckedChange={(checked) => onToggle(eventType.id, checked)}
              className="data-[state=checked]:bg-blue-600"
            />
            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100 focus:opacity-100 focus:outline-none">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuItem onClick={() => onEdit(eventType)} className="rounded-lg text-sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="rounded-lg text-sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(eventType.id)}
                  className="rounded-lg text-sm text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        {eventType.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {eventType.description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom action row */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" />
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

          <button
            onClick={() => onEdit(eventType)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}
