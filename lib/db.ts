import { neon } from '@neondatabase/serverless'

let _warnedOnce = false

export function getDb() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    if (!_warnedOnce) {
      console.warn(
        '[db] WARNING: DATABASE_URL is not set. ' +
          'The app is running in demo mode — all database operations will throw. ' +
          'Set DATABASE_URL in your .env.local to connect to a real database.'
      )
      _warnedOnce = true
    }
    // Return a proxy that throws a friendly error on any query so callers can
    // catch it individually and surface a meaningful response instead of a
    // non-descriptive crash.
    //
    // IMPORTANT: the Proxy target MUST be a function, not a plain object.
    // Tagged-template calls  sql`SELECT …`  desugar to  sql(strings, ...values),
    // which invokes the value directly. The `apply` trap only fires when the
    // target is itself callable; wrapping {} would produce "sql is not a function".
    const demoError = () => {
      throw new Error(
        'Database not available: DATABASE_URL environment variable is not configured.'
      )
    }
    return new Proxy(demoError as unknown as ReturnType<typeof neon>, {
      // Intercepts direct calls: sql`...`  →  sql(strings, ...values)
      apply() {
        demoError()
      },
      // Intercepts property access: sql.query(...)  /  sql.transaction(...)
      get(_target, prop) {
        if (prop === 'then') return undefined // prevent accidental Promise treatment
        return demoError
      },
    })
  }

  return neon(connectionString)
}

export type User = {
  id: string
  name: string
  email: string
  timezone: string
  created_at: string
}

export type EventType = {
  id: string
  user_id: string
  title: string
  slug: string
  description: string | null
  duration: number
  buffer_time: number
  color: string
  is_active: boolean
  created_at: string
}

export type Availability = {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export type Booking = {
  id: string
  event_type_id: string
  guest_name: string
  guest_email: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'
  notes: string | null
  created_at: string
}

export type BookingWithEventType = Booking & {
  event_title: string
  event_duration: number
}
