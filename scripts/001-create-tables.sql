-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_types table
CREATE TABLE IF NOT EXISTS event_types (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  buffer_time INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_types_user_id ON event_types(user_id);
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_type_id ON bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);

-- Insert a default host user
INSERT INTO users (name, email, timezone) 
VALUES ('Host User', 'host@example.com', 'America/New_York')
ON CONFLICT (email) DO NOTHING;

-- Insert default availability (Monday-Friday, 9 AM - 5 PM)
INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active)
SELECT 1, day, '09:00:00', '17:00:00', true
FROM generate_series(1, 5) AS day
ON CONFLICT (user_id, day_of_week) DO NOTHING;

-- Insert sample event types
INSERT INTO event_types (user_id, title, slug, description, duration, buffer_time)
VALUES 
  (1, '30 Minute Meeting', '30-min-meeting', 'A quick 30-minute call to discuss your needs.', 30, 0),
  (1, '60 Minute Consultation', '60-min-consultation', 'An in-depth 60-minute consultation session.', 60, 10)
ON CONFLICT (slug) DO NOTHING;
