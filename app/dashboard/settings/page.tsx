'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your integrations and preferences.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Booking confirmations and cancellations are sent by email
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Guests receive a confirmation email after booking and a cancellation email when meetings are cancelled.
            </p>
            <p>
              Configure the sender address with <span className="font-medium">EMAIL_FROM</span> and provide a Resend API key.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environment Configuration Note */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Setup</CardTitle>
          <CardDescription>
            Configuration required for email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              To enable email notifications, add these environment variables:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-1">
              <div>RESEND_API_KEY=your_resend_api_key</div>
              <div>EMAIL_FROM=Schedulr &lt;onboarding@resend.dev&gt;</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}