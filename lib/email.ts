import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type BookingEmailInput = {
  guestName: string
  guestEmail: string
  eventName: string
  startTime: string | Date
}

export async function sendBookingConfirmationEmail({
  guestName,
  guestEmail,
  eventName,
  startTime,
}: BookingEmailInput) {
  const fromAddress = process.env.EMAIL_FROM ?? 'Scheduler <onboarding@resend.dev>'
  await resend.emails.send({
    from: fromAddress,
    to: guestEmail,
    subject: 'Meeting Confirmed',
    html: `
Meeting Confirmed
Hello ${guestName},

  <p>Your meeting has been scheduled.</p>

  <p><b>Event:</b> ${eventName}</p>
  <p><b>Time:</b> ${new Date(startTime).toLocaleString()}</p>

  <p>Thank you.</p>
`,
  })
}

export async function sendBookingCancellationEmail({
  guestName,
  guestEmail,
  eventName,
  startTime,
}: BookingEmailInput) {
  const fromAddress = process.env.EMAIL_FROM ?? 'Scheduler <onboarding@resend.dev>'
  await resend.emails.send({
    from: fromAddress,
    to: guestEmail,
    subject: 'Meeting Cancelled',
    html: `
Meeting Cancelled
Hello ${guestName},

  <p>Your meeting has been cancelled.</p>

  <p><b>Event:</b> ${eventName}</p>
  <p><b>Time:</b> ${new Date(startTime).toLocaleString()}</p>

  <p>If this was a mistake, please book again.</p>
`,
  })
}
