# 🚀 Schedulr - Production Features

A comprehensive scheduling platform built with Next.js 16, featuring timezone-aware booking, email notifications, and advanced meeting management.

## ✨ New Features

### 🌍 **Timezone Detection**
- Automatic timezone detection using browser API
- Timezone is stored with each booking
- Meeting times display correctly across timezones
- Visual timezone indicator during booking process

### 🔄 **Meeting Reschedule**
- Easy rescheduling interface at `/reschedule/[bookingId]`
- Real-time availability checking
- Automatic email notifications for changes
- Reschedule links in confirmation emails

### 📊 **Enhanced Dashboard**
- **Upcoming Meetings**: Active and rescheduled meetings
- **Past Meetings**: Completed meetings history
- **Cancelled Meetings**: Cancelled meetings tracking
- Status badges (Confirmed, Rescheduled, Cancelled, Completed)
- Sort by date and status
- Meeting actions (Join, Reschedule, Cancel)

### 📧 **Improved Email Notifications**
- Meeting confirmations and cancellations
- Reschedule and cancel action buttons
- Enhanced email templates with better visual design

### ⚙️ **Settings & Integrations**
- Email notification configuration
- Environment setup guidance

## 🛠️ Setup & Installation

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Setup 
Apply the database migrations:
```bash
# Run the SQL scripts in order:
# 001-create-tables.sql
# 002-add-booking-status.sql  
# 003-add-timezone-and-google-features.sql
```

### 3. Environment Configuration
Create a `.env.local` file:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Schedulr <onboarding@resend.dev>
```

### 4. Run the Application
```bash
pnpm dev
```

## 🎯 Feature Usage

### Timezone-Aware Booking
- Users' timezones are automatically detected
- All meeting times are displayed in user's local time
- Timezone information is stored with bookings
- Hosts can see guest timezone in dashboard

### Rescheduling Meetings
**For Guests:**
- Use reschedule link from confirmation email
- Or visit `/reschedule/[bookingId]` directly
- Select new available time slot
- Receive updated confirmation

**For Hosts:**
- Use "Reschedule" button in meetings dashboard
- Real-time availability checking
- Automatic calendar updates

### Meeting Status Management
- **Confirmed**: Active upcoming meetings
- **Rescheduled**: Meetings moved to new time
- **Cancelled**: Cancelled meetings (kept for history)
- **Completed**: Past meetings that occurred

### Email Notifications
All emails now include:
- Meeting title and details
- Reschedule meeting link
- Cancel meeting link

## 🔧 API Endpoints

### Bookings
- `GET /api/bookings?type=upcoming` - Get upcoming meetings
- `GET /api/bookings?type=past` - Get past meetings  
- `GET /api/bookings?type=cancelled` - Get cancelled meetings
- `GET /api/bookings/[id]` - Get specific booking
- `PUT /api/bookings/[id]/reschedule` - Reschedule booking
- `DELETE /api/bookings/[id]` - Cancel booking

## 📱 Pages & Routes

### Public Pages
- `/book/[slug]` - Public booking page (enhanced with timezone)
- `/reschedule/[id]` - Meeting reschedule interface
- `/cancel/[id]` - Meeting cancellation (existing)

### Dashboard Pages
- `/dashboard` - Dashboard overview
- `/dashboard/meetings` - Enhanced meetings management
- `/dashboard/event-types` - Event type management (existing)
- `/dashboard/availability` - Availability settings (existing) 
- `/dashboard/settings` - Settings (new)

## 🔒 Security Features

- Environment variable validation
- Error handling for API failures

## 🎨 UI/UX Improvements

- Status badges with color coding
- Improved meeting cards with actions
- Timezone display in booking flow
- Enhanced confirmation page
- Better error states and loading indicators

## 📋 Database Schema Changes

New fields added:

**Bookings table:**
- `status` - Updated to support 'rescheduled' status

## 🚀 Production Deployment

### Environment Variables
Ensure all environment variables are set in production:
- Database connection string
- Resend API key for emails

## 🛡️ Error Handling

The system gracefully handles:
- Timezone detection errors (fallback to UTC)
- Missing environment variables
- Database connection issues

## 📈 Monitoring & Analytics

- Error logging for email failures
- Meeting analytics by status
- Email delivery tracking

---

## 🆕 Version History

### v2.0.0 - Production Features
- ✅ Timezone detection and storage
- ✅ Meeting reschedule functionality
- ✅ Enhanced meeting status system
- ✅ Improved dashboard with tabs
- ✅ Enhanced email notifications
- ✅ Settings page with integrations

### v1.0.0 - Base Features  
- ✅ Event type creation
- ✅ Availability management
- ✅ Slot generation
- ✅ Public booking page
- ✅ Email confirmations with .ics
- ✅ Meeting cancellation
- ✅ Basic dashboard

---

🎉 **Your Calendly-style scheduling platform is now production-ready!**