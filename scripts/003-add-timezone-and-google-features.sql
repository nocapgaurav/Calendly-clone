-- Add timezone support to bookings table
ALTER TABLE bookings ADD COLUMN guest_timezone VARCHAR(100);

-- Add Google Calendar integration columns to users table  
ALTER TABLE users ADD COLUMN google_access_token TEXT;
ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN google_expires_at BIGINT;

-- Add Google Meet link to bookings table
ALTER TABLE bookings ADD COLUMN google_meet_link TEXT;

-- Add Google Calendar event ID for future reference
ALTER TABLE bookings ADD COLUMN google_calendar_event_id TEXT;

-- Update status column to support new values
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'completed'));

-- Add index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);