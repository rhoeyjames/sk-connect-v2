"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "youth" | "sk_official" | "admin"
  barangay: string
  municipality: string
  province: string
}

export default function EventsClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/auth/login")
      return
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.firstName} />
                  <AvatarFallback className="text-lg">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user.firstName}!
                  </h1>
                  <p className="text-gray-600">
                    {user.barangay}, {user.municipality}, {user.province}
                  </p>
                  <div className="flex items-center mt-2">
                    {user.role === "admin" && (
                      <Badge className="bg-red-100 text-red-800">Admin</Badge>
                    )}
                    {user.role === "sk_official" && (
                      <Badge className="bg-blue-100 text-blue-800">SK Official</Badge>
                    )}
                    {user.role === "youth" && (
                      <Badge className="bg-green-100 text-green-800">Youth Member</Badge>
                    )}
                  </div>
                </div>
              </div>
              {(user.role === "admin" || user.role === "sk_official") && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Event Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Community Cleanup Drive</CardTitle>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <CardDescription>
                Join us for a community cleanup initiative to keep our barangay clean and green.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  March 15, 2024
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  8:00 AM - 12:00 PM
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Barangay Hall
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  25 registered
                </div>
              </div>
              <Button className="w-full mt-4">Register for Event</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Youth Leadership Seminar</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
              </div>
              <CardDescription>
                Develop your leadership skills and learn about youth governance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  March 22, 2024
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  2:00 PM - 5:00 PM
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Municipal Hall
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  12 registered
                </div>
              </div>
              <Button className="w-full mt-4">Register for Event</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sports Festival</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">Registration Open</Badge>
              </div>
              <CardDescription>
                Annual sports festival featuring basketball, volleyball, and other activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  April 5-7, 2024
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  All Day Event
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Sports Complex
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  150 registered
                </div>
              </div>
              <Button className="w-full mt-4">Register for Event</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center h-16">
              <Users className="h-5 w-5 mr-2" />
              My Registrations
            </Button>
            <Button variant="outline" className="flex items-center justify-center h-16">
              <Calendar className="h-5 w-5 mr-2" />
              Event Calendar
            </Button>
            <Button variant="outline" className="flex items-center justify-center h-16">
              <MapPin className="h-5 w-5 mr-2" />
              Local Events
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
