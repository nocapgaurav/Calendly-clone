'use client'

import { use, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function CancelMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (isSubmitting || isCancelled) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'PATCH' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to cancel meeting')
      }
      setIsCancelled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Cancel meeting</h1>
            <p className="text-sm text-muted-foreground">
              Confirm below to cancel your meeting. This action cannot be undone.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {isCancelled ? (
            <div className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
              Meeting cancelled successfully
            </div>
          ) : (
            <Button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full"
              variant="destructive"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Cancelling...
                </span>
              ) : (
                'Cancel Meeting'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
