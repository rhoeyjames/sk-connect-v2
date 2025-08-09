"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import ParticipantsModal from "@/components/participants-modal"
import EventManagementModal from "@/components/event-management-modal"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Settings, 
  UserPlus,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react"

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

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  organizer: {
    firstName: string
    lastName: string
    email: string
  }
  maxParticipants?: number
  currentParticipants: number
  status: string
  registrationDeadline?: string
  barangay: string
  municipality: string
  province: string
  requirements?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export default function EventDetailClient({ eventId }: { eventId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showManageEvent, setShowManageEvent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
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
      router.push("/auth/login")
      return
    }

    fetchEventDetails()
  }, [eventId, router])

  const fetchEventDetails = async (retryCount = 0) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      console.log(`Fetching event details for ID: ${eventId} (attempt ${retryCount + 1})`)

      // Add a small delay for retries
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        cache: 'no-cache',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`Event detail response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log('Event data received:', data)
        setEvent(data.event || data)
      } else {
        console.error("Failed to fetch event details:", response.status, response.statusText)

        // Retry on server errors
        if (response.status >= 500 && retryCount < 2) {
          return fetchEventDetails(retryCount + 1)
        }

        let errorMessage = "Failed to load event details"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          console.error("Error response data:", errorData)
        } catch (e) {
          const text = await response.text()
          console.error("Error response text:", text)
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching event details:", error)

      // Retry on network errors
      if (retryCount < 2 && error instanceof Error &&
          (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`Retrying fetch after error: ${error.message}`)
        return fetchEventDetails(retryCount + 1)
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageEvent = () => {
    setShowManageEvent(true)
  }

  const handleViewParticipants = () => {
    setShowParticipants(true)
  }

  const handleRegisterEvent = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to register for events.",
          variant: "destructive",
        })
        return
      }

      // TODO: Create proper registration form with emergency contact info
      // For now, just show a coming soon message
      toast({
        title: "Coming Soon",
        description: "Event registration form will be available soon.",
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event Not Found</h3>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = user?.role === "admin" || user?.role === "sk_official"
  const canEdit = isAdmin // You could add more specific permissions here

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Events</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>

          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleViewParticipants}>
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Participants</span>
                <span className="sm:hidden">Participants</span>
              </Button>
            </div>
          )}
        </div>

        {/* Event Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl">{event.title}</CardTitle>
                  <Badge className={`${
                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-lg">{event.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                      <div className="text-sm text-gray-500">Event Date</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{event.time}</div>
                      <div className="text-sm text-gray-500">Start Time</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-sm text-gray-500">{event.barangay}, {event.municipality}, {event.province}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {event.currentParticipants} 
                        {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} registered
                      </div>
                      <div className="text-sm text-gray-500">Participants</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer & Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Organizer</h3>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {event.organizer.firstName.charAt(0)}{event.organizer.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{event.organizer.firstName} {event.organizer.lastName}</div>
                    <div className="text-sm text-gray-500">{event.organizer.email}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Category</div>
                    <div className="text-sm text-gray-600 capitalize">{event.category}</div>
                  </div>

                  {event.registrationDeadline && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">Registration Deadline</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.registrationDeadline).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {event.requirements && event.requirements.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">Requirements</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {event.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t">
              {isAdmin ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleManageEvent} className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Event</span>
                    <span className="sm:hidden">Manage</span>
                  </Button>
                  <Button variant="outline" onClick={handleViewParticipants} className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Participants</span>
                    <span className="sm:hidden">Participants</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={handleRegisterEvent} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Register for Event</span>
                  <span className="sm:hidden">Register</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Administrative Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span> {new Date(event.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(event.updatedAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Event ID:</span> {event._id}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {event.status}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Modal */}
        <ParticipantsModal
          isOpen={showParticipants}
          onClose={() => setShowParticipants(false)}
          eventId={eventId}
          eventTitle={event?.title || "Event"}
        />

        {/* Event Management Modal */}
        <EventManagementModal
          isOpen={showManageEvent}
          onClose={() => setShowManageEvent(false)}
          event={event}
          onEventUpdated={fetchEventDetails}
        />
      </div>
    </div>
  )
}
