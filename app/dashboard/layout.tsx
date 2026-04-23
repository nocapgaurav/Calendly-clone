'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  useEffect(() => {
    async function setup() {
      try {
        const res = await fetch('/api/setup', { method: 'POST' })
        const data = await res.json()
        if (res.ok) {
          setSetupComplete(true)
        } else {
          setSetupError(data.error || 'Setup failed')
        }
      } catch (error) {
        console.error('Setup error:', error)
        setSetupError('Failed to connect to database')
      }
    }
    setup()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-8">
          {setupError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Database setup issue: {setupError}. The app will still function with limited data.
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
