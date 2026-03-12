import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const sql = getDb()
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        timezone VARCHAR(100) DEFAULT 'UTC',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Create event_types table
    await sql`
      CREATE TABLE IF NOT EXISTS event_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL DEFAULT 30,
        buffer_time INTEGER DEFAULT 0,
        color VARCHAR(20) DEFAULT '#0066FF',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Create availability table
    await sql`
      CREATE TABLE IF NOT EXISTS availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(user_id, day_of_week)
      )
    `

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Check if default user exists
    const existingUser = (await sql`SELECT id FROM users WHERE email = 'host@calendly.demo'`) as any[]
    
    let userId: string
    
    if (existingUser.length === 0) {
      // Create default user
      const userResult = (await sql`
        INSERT INTO users (name, email, timezone)
        VALUES ('Demo Host', 'host@calendly.demo', 'America/New_York')
        RETURNING id
      `) as any[]
      userId = userResult[0].id
      
      // Create default availability (Mon-Fri 9am-5pm)
      for (let day = 1; day <= 5; day++) {
        await sql`
          INSERT INTO availability (user_id, day_of_week, start_time, end_time, is_active)
          VALUES (${userId}, ${day}, '09:00', '17:00', true)
          ON CONFLICT (user_id, day_of_week) DO NOTHING
        `
      }
      
      // Create sample event types
      await sql`
        INSERT INTO event_types (user_id, title, slug, description, duration, buffer_time, color)
        VALUES 
          (${userId}, '30 Minute Meeting', '30-min-meeting', 'A quick 30 minute call to discuss your needs.', 30, 0, '#0066FF'),
          (${userId}, '60 Minute Meeting', '60-min-meeting', 'A comprehensive 60 minute consultation.', 60, 10, '#00CC66'),
          (${userId}, '15 Minute Chat', '15-min-chat', 'A brief 15 minute introduction call.', 15, 5, '#FF6600')
        ON CONFLICT (slug) DO NOTHING
      `
    } else {
      userId = existingUser[0].id
    }

    return NextResponse.json({ success: true, userId })
  } catch (error: unknown) {
    console.error('Setup error:', error)
    const message = error instanceof Error ? error.message : 'Failed to setup database'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
