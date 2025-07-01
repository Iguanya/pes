"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Globe, Shield, Smartphone, Mail, MessageSquare, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserSettings {
  notifications: {
    email_tournaments: boolean
    email_matches: boolean
    email_marketing: boolean
    sms_tournaments: boolean
    sms_matches: boolean
    push_notifications: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: string
    currency: string
  }
  privacy: {
    profile_visibility: string
    show_stats: boolean
    show_earnings: boolean
    allow_friend_requests: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("notifications")
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        // Set default settings if none exist
        setSettings({
          notifications: {
            email_tournaments: true,
            email_matches: true,
            email_marketing: false,
            sms_tournaments: true,
            sms_matches: false,
            push_notifications: false,
          },
          preferences: {
            language: "en",
            timezone: "Africa/Nairobi",
            theme: "system",
            currency: "KES",
          },
          privacy: {
            profile_visibility: "public",
            show_stats: true,
            show_earnings: false,
            allow_friend_requests: true,
          },
        })
      }
    } catch (error) {
      setError("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully.",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save settings")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateNotificationSetting = (key: keyof UserSettings["notifications"], value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
  }

  const updatePreferenceSetting = (key: keyof UserSettings["preferences"], value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    })
  }

  const updatePrivacySetting = (key: keyof UserSettings["privacy"], value: boolean | string) => {
    if (!settings) return
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load settings. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences and notification settings">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
              <CardDescription>Choose which email notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tournament Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about tournament registrations, starts, and results
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email_tournaments}
                  onCheckedChange={(checked) => updateNotificationSetting("email_tournaments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Match Updates</Label>
                  <p className="text-sm text-muted-foreground">Notifications about match schedules and results</p>
                </div>
                <Switch
                  checked={settings.notifications.email_matches}
                  onCheckedChange={(checked) => updateNotificationSetting("email_matches", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Promotional emails about new features and tournaments</p>
                </div>
                <Switch
                  checked={settings.notifications.email_marketing}
                  onCheckedChange={(checked) => updateNotificationSetting("email_marketing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>SMS Notifications</span>
              </CardTitle>
              <CardDescription>Manage SMS notifications to your phone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tournament Reminders</Label>
                  <p className="text-sm text-muted-foreground">SMS reminders for upcoming tournaments</p>
                </div>
                <Switch
                  checked={settings.notifications.sms_tournaments}
                  onCheckedChange={(checked) => updateNotificationSetting("sms_tournaments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Match Alerts</Label>
                  <p className="text-sm text-muted-foreground">SMS alerts for match schedules and urgent updates</p>
                </div>
                <Switch
                  checked={settings.notifications.sms_matches}
                  onCheckedChange={(checked) => updateNotificationSetting("sms_matches", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>Browser and mobile app notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Real-time notifications in your browser or mobile app</p>
                </div>
                <Switch
                  checked={settings.notifications.push_notifications}
                  onCheckedChange={(checked) => updateNotificationSetting("push_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Language & Region</span>
              </CardTitle>
              <CardDescription>Set your language, timezone, and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updatePreferenceSetting("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Kiswahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updatePreferenceSetting("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updatePreferenceSetting("theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => updatePreferenceSetting("currency", value)}
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
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>Control who can see your information and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile_visibility">Profile Visibility</Label>
                <Select
                  value={settings.privacy.profile_visibility}
                  onValueChange={(value) => updatePrivacySetting("profile_visibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private - Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your tournament and match statistics
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.show_stats}
                  onCheckedChange={(checked) => updatePrivacySetting("show_stats", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Earnings</Label>
                  <p className="text-sm text-muted-foreground">Display your tournament earnings on your profile</p>
                </div>
                <Switch
                  checked={settings.privacy.show_earnings}
                  onCheckedChange={(checked) => updatePrivacySetting("show_earnings", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-muted-foreground">Let other players send you friend requests</p>
                </div>
                <Switch
                  checked={settings.privacy.allow_friend_requests}
                  onCheckedChange={(checked) => updatePrivacySetting("allow_friend_requests", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Account</CardTitle>
              <CardDescription>Manage your account data and deletion options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Download Data</h4>
                  <p className="text-sm text-muted-foreground">Download a copy of your account data</p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
