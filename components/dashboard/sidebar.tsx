'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, Calendar, Clock, Users, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home',         href: '/dashboard',                  icon: Home,        exact: true },
  { name: 'Event Types',  href: '/dashboard/event-types',      icon: Calendar },
  { name: 'Availability', href: '/dashboard/availability',     icon: Clock },
  { name: 'Meetings',     href: '/dashboard/meetings',         icon: Users },
  { name: 'Settings',     href: '/dashboard/settings',         icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <CalendarDays className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">Schedulr</span>
      </div>

      {/* Create button */}
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/dashboard/event-types"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Create
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-1">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User avatar */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            DH
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">Demo Host</p>
            <p className="truncate text-xs text-gray-500">host@calendly.demo</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
