"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Trash2, Save } from "lucide-react"
import { clearAllSymptomLogs } from "@/lib/symptom-storage"

export default function Settings() {
  const { toast } = useToast()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("20:00")

  const handleSaveSettings = () => {
    // In a real app, we would save these settings to localStorage or a database
    localStorage.setItem(
      "settings",
      JSON.stringify({
        notificationsEnabled,
        darkModeEnabled,
        reminderTime,
      }),
    )

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    })
  }

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your symptom logs? This action cannot be undone.")) {
      clearAllSymptomLogs()
      toast({
        title: "Data cleared",
        description: "All your symptom logs have been deleted",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Load settings from localStorage in a real app
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNotificationsEnabled(settings.notificationsEnabled)
      setDarkModeEnabled(settings.darkModeEnabled)
      setReminderTime(settings.reminderTime)
    }
  }, [])

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-teal-700 mb-6">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Daily Reminder Notifications</Label>
              <p className="text-sm text-slate-500">Receive reminders to log your symptoms</p>
            </div>
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>

          {notificationsEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-slate-500">Use dark theme for the application</p>
            </div>
            <Switch id="dark-mode" checked={darkModeEnabled} onCheckedChange={setDarkModeEnabled} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} className="bg-teal-600 hover:bg-teal-700">
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Permanently delete all your symptom logs and health data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

