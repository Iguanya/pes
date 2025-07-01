"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, DollarSign, Globe, Bell, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PlatformSettings {
  general: {
    platformName: string
    description: string
    supportEmail: string
    supportPhone: string
    timezone: string
    currency: string
    language: string
  }
  tournaments: {
    maxParticipants: number
    minEntryFee: number
    maxEntryFee: number
    defaultFormat: string
    autoApproval: boolean
    requireScreenshots: boolean
    disputeTimeLimit: number
  }
  payments: {
    platformFee: number
    payoutDelay: number
    minPayout: number
    mpesaPaybill: string
    autoPayouts: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireEmailVerification: boolean
    requirePhoneVerification: boolean
    twoFactorAuth: boolean
  }
}

export default function AdminSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platformName: "PES Tournament Platform",
      description: "Kenya's premier eFootball tournament platform",
      supportEmail: "support@pestournament.ke",
      supportPhone: "+254700000000",
      timezone: "Africa/Nairobi",
      currency: "KES",
      language: "en",
    },
    tournaments: {
      maxParticipants: 128,
      minEntryFee: 100,
      maxEntryFee: 10000,
      defaultFormat: "knockout",
      autoApproval: false,
      requireScreenshots: true,
      disputeTimeLimit: 24,
    },
    payments: {
      platformFee: 10,
      payoutDelay: 24,
      minPayout: 500,
      mpesaPaybill: "174379",
      autoPayouts: true,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      requirePhoneVerification: true,
      twoFactorAuth: false,
    },
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Platform settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Configure platform-wide settings and preferences">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.general.platformName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, platformName: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.general.description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, description: e.target.value },
                  })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={settings.general.supportPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportPhone: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.general.currency}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, currency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Tournament Settings</span>
            </CardTitle>
            <CardDescription>Configure tournament defaults and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={settings.tournaments.maxParticipants}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, maxParticipants: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultFormat">Default Format</Label>
                <Select
                  value={settings.tournaments.defaultFormat}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, defaultFormat: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knockout">Single Elimination</SelectItem>
                    <SelectItem value="double-elimination">Double Elimination</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="swiss">Swiss System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minEntryFee">Min Entry Fee (KSh)</Label>
                <Input
                  id="minEntryFee"
                  type="number"
                  value={settings.tournaments.minEntryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, minEntryFee: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntryFee">Max Entry Fee (KSh)</Label>
                <Input
                  id="maxEntryFee"
                  type="number"
                  value={settings.tournaments.maxEntryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, maxEntryFee: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Tournaments</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new tournaments</p>
                </div>
                <Switch
                  checked={settings.tournaments.autoApproval}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, autoApproval: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Screenshots</Label>
                  <p className="text-sm text-muted-foreground">Require match result screenshots</p>
                </div>
                <Switch
                  checked={settings.tournaments.requireScreenshots}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      tournaments: { ...settings.tournaments, requireScreenshots: checked },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Payment Settings</span>
            </CardTitle>
            <CardDescription>Configure payment processing and fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={settings.payments.platformFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, platformFee: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutDelay">Payout Delay (hours)</Label>
                <Input
                  id="payoutDelay"
                  type="number"
                  value={settings.payments.payoutDelay}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, payoutDelay: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPayout">Min Payout (KSh)</Label>
                <Input
                  id="minPayout"
                  type="number"
                  value={settings.payments.minPayout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, minPayout: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesaPaybill">M-Pesa Paybill</Label>
                <Input
                  id="mpesaPaybill"
                  value={settings.payments.mpesaPaybill}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, mpesaPaybill: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Payouts</Label>
                <p className="text-sm text-muted-foreground">Process payouts automatically</p>
              </div>
              <Switch
                checked={settings.payments.autoPayouts}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    payments: { ...settings.payments, autoPayouts: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>Configure security and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.security.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireEmailVerification: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Phone Verification</Label>
                  <p className="text-sm text-muted-foreground">Require phone verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.security.requirePhoneVerification}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requirePhoneVerification: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: checked },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription>Configure platform notifications and communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications</p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send SMS notifications</p>
              </div>
              <Switch
                checked={settings.notifications.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, smsNotifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Send push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, pushNotifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Send marketing emails</p>
              </div>
              <Switch
                checked={settings.notifications.marketingEmails}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, marketingEmails: checked },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
