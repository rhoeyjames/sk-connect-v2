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
import { Calendar, MapPin, Users, Clock, Plus, RefreshCw, Eye, Settings } from "lucide-react"
import EventRegistrationModal from "@/components/event-registration-modal"
import EventCalendar from "@/components/event-calendar"

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
  location: string
  category: string
  organizer: {
    firstName: string
    lastName: string
  }
  maxParticipants?: number
  currentParticipants: number
  status: string
  registrationDeadline?: string
}

export default function EventsClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    maxParticipants: "",
    registrationDeadline: "",
    registrationDeadlineTime: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [editEventOpen, setEditEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [localEventsFilter, setLocalEventsFilter] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Frontend validation
    const eventDateTime = new Date(eventForm.date + "T" + eventForm.time)
    const now = new Date()

    if (eventDateTime <= now) {
      toast({
        title: "Invalid Date",
        description: "Event date and time must be in the future",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    const registrationDateTime = new Date(eventForm.registrationDeadline + "T" + eventForm.registrationDeadlineTime)
    if (registrationDateTime >= eventDateTime) {
      toast({
        title: "Invalid Registration Deadline",
        description: "Registration deadline must be before the event date",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const isEditing = !!editingEvent
      const url = isEditing ? `/api/events/${editingEvent._id}` : "/api/events"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          category: eventForm.category,
          maxParticipants: parseInt(eventForm.maxParticipants) || 50,
          registrationDeadline: eventForm.registrationDeadline,
          registrationDeadlineTime: eventForm.registrationDeadlineTime,
          // Use user's location data for new events
          barangay: user?.barangay || "",
          municipality: user?.municipality || "",
          province: user?.province || "",
        }),
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Event Updated!" : "Event Created!",
          description: isEditing ? "Your event has been updated successfully." : "Your event has been created successfully.",
        })
        setCreateEventOpen(false)
        setEditEventOpen(false)
        setEditingEvent(null)
        setEventForm({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          category: "",
          maxParticipants: "",
          registrationDeadline: "",
          registrationDeadlineTime: ""
        })
        // Refresh events list
        await fetchEvents()
      } else {
        let errorMessage = isEditing ? "Failed to update event" : "Failed to create event"
        try {
          const error = await response.json()

          // Handle validation errors specifically
          if (error.errors && typeof error.errors === 'object') {
            const validationErrors = Object.values(error.errors).map((err: any) => err.message || err).join(', ')
            errorMessage = validationErrors
          } else if (error.message) {
            errorMessage = error.message
          } else if (error.error) {
            errorMessage = error.error
          }
        } catch (e) {
          // Handle cases where response body cannot be parsed
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const fetchEvents = async (retryCount = 0) => {
    try {
      setEventsLoading(true)

      // Add a small delay to avoid rapid retries
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }

      const response = await fetch("/api/events", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache control to avoid caching issues
        cache: "no-cache",
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error("Failed to fetch events:", response.status, response.statusText)
        // If it's a server error and we haven't retried too many times, retry
        if (response.status >= 500 && retryCount < 2) {
          return fetchEvents(retryCount + 1)
        }
      }
    } catch (error) {
      console.error("Error fetching events (attempt " + (retryCount + 1) + "):", error)

      // Retry on network errors, but not too many times
      if (retryCount < 2) {
        return fetchEvents(retryCount + 1)
      }

      // If all retries failed, set events to empty array to show empty state
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEventForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEventCalendar = () => {
    setShowCalendarView(!showCalendarView)
    toast({
      title: showCalendarView ? "List View" : "Calendar View",
      description: showCalendarView ? "Switched to list view" : "Switched to calendar view",
    })
  }

  const handleLocalEvents = () => {
    setLocalEventsFilter(!localEventsFilter)

    toast({
      title: localEventsFilter ? "All Events" : "Local Events",
      description: localEventsFilter
        ? "Showing all events"
        : `Showing events in ${user?.barangay}, ${user?.municipality}`,
    })
  }

  const handleRegisterForEvent = (event: Event) => {
    setSelectedEventForRegistration(event)
    setShowRegistrationModal(true)
  }

  const handleRegistrationSuccess = () => {
    // Refresh events to update participant count
    fetchEvents()
  }

  const handleEventClick = (event: Event) => {
    router.push(`/events/${event._id}`)
  }

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
    fetchEvents()
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

  // Filter events based on local events toggle
  const filteredEvents = localEventsFilter && user
    ? events.filter(event => {
        // Filter events by user's location
        const location = event.location.toLowerCase()
        const userBarangay = user.barangay.toLowerCase()
        const userMunicipality = user.municipality.toLowerCase()
        const userProvince = user.province.toLowerCase()

        return location.includes(userBarangay) ||
               location.includes(userMunicipality) ||
               location.includes(userProvince)
      })
    : events

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
                <>
                  <Button onClick={() => setCreateEventOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create a new community event.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Event Title</Label>
                          <Input
                            id="title"
                            value={eventForm.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="Enter event title"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={eventForm.category} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="environment">Environment</SelectItem>
                              <SelectItem value="culture">Culture</SelectItem>
                              <SelectItem value="livelihood">Livelihood</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={eventForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Describe your event..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={eventForm.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            placeholder="Event location"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxParticipants">Max Participants</Label>
                          <Input
                            id="maxParticipants"
                            type="number"
                            value={eventForm.maxParticipants}
                            onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                            placeholder="e.g. 50"
                            min="1"
                            max="1000"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                          <Input
                            id="registrationDeadline"
                            type="date"
                            value={eventForm.registrationDeadline}
                            onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registrationDeadlineTime">Deadline Time</Label>
                          <Input
                            id="registrationDeadlineTime"
                            type="time"
                            value={eventForm.registrationDeadlineTime}
                            onChange={(e) => handleInputChange("registrationDeadlineTime", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateEventOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Creating..." : "Create Event"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Edit Event Dialog */}
                <Dialog open={editEventOpen} onOpenChange={(open) => {
                  setEditEventOpen(open)
                  if (!open) {
                    setEditingEvent(null)
                    setEventForm({
                      title: "",
                      description: "",
                      date: "",
                      time: "",
                      location: "",
                      category: "",
                      maxParticipants: "",
                      registrationDeadline: "",
                      registrationDeadlineTime: ""
                    })
                  }
                }}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Event</DialogTitle>
                      <DialogDescription>
                        Update the event details below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Event Title</Label>
                          <Input
                            id="edit-title"
                            value={eventForm.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="Enter event title"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-category">Category</Label>
                          <Select value={eventForm.category} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="environment">Environment</SelectItem>
                              <SelectItem value="culture">Culture</SelectItem>
                              <SelectItem value="livelihood">Livelihood</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={eventForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Describe your event..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-date">Date</Label>
                          <Input
                            id="edit-date"
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-time">Time</Label>
                          <Input
                            id="edit-time"
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-location">Location</Label>
                          <Input
                            id="edit-location"
                            value={eventForm.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            placeholder="Event location"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                          <Input
                            id="edit-maxParticipants"
                            type="number"
                            value={eventForm.maxParticipants}
                            onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                            placeholder="e.g. 50"
                            min="1"
                            max="1000"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-registrationDeadline">Registration Deadline</Label>
                          <Input
                            id="edit-registrationDeadline"
                            type="date"
                            value={eventForm.registrationDeadline}
                            onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-registrationDeadlineTime">Deadline Time</Label>
                          <Input
                            id="edit-registrationDeadlineTime"
                            type="time"
                            value={eventForm.registrationDeadlineTime}
                            onChange={(e) => handleInputChange("registrationDeadlineTime", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditEventOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Updating..." : "Update Event"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {localEventsFilter ? `Local Events - ${user?.barangay}` : "Community Events"}
            </h2>
            <p className="text-gray-600">
              {user?.role === "admin" || user?.role === "sk_official"
                ? "Manage and oversee community events and activities"
                : "Discover and participate in local SK events and activities"
              }
            </p>
            <div className="flex items-center gap-4 mt-2">
              {(user?.role === "admin" || user?.role === "sk_official") && (
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Management Mode</span>
                </div>
              )}
              {localEventsFilter && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Local Filter Active</span>
                </div>
              )}
              {showCalendarView && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">Calendar View</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchEvents()}
            disabled={eventsLoading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${eventsLoading ? 'animate-spin' : ''}`} />
            {eventsLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {showCalendarView ? (
          // Calendar View
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Calendar</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Simple calendar representation */}
              {Array.from({ length: 35 }).map((_, index) => {
                const dayNumber = index - 5 + 1 // Assuming month starts on a Wednesday
                const hasEvent = filteredEvents.some(event => {
                  const eventDate = new Date(event.date)
                  return eventDate.getDate() === dayNumber && dayNumber > 0 && dayNumber <= 31
                })

                return (
                  <div
                    key={index}
                    className={`h-10 flex items-center justify-center text-sm rounded ${
                      dayNumber > 0 && dayNumber <= 31
                        ? hasEvent
                          ? 'bg-blue-100 text-blue-800 font-medium cursor-pointer hover:bg-blue-200'
                          : 'hover:bg-gray-100 cursor-pointer'
                        : 'text-gray-300'
                    }`}
                  >
                    {dayNumber > 0 && dayNumber <= 31 ? dayNumber : ''}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-2"></span>
              Days with events
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredEvents.length > 0 ? (
            // Real events
            filteredEvents.map((event) => (
              <Card key={event._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge className={`${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.currentParticipants} {event.maxParticipants ? `/ ${event.maxParticipants}` : ''} registered
                    </div>
                    {event.organizer && (
                      <div className="flex items-center text-xs">
                        <span className="font-medium">Organizer:</span>
                        <span className="ml-1">{event.organizer.firstName} {event.organizer.lastName}</span>
                      </div>
                    )}

                    {/* Show additional admin info */}
                    {(user?.role === "admin" || user?.role === "sk_official") && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Category: {event.category}</span>
                          <span>Status: {event.status}</span>
                        </div>
                        {event.registrationDeadline && (
                          <div className="text-xs text-gray-500 mt-1">
                            Registration deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {user?.role === "admin" || user?.role === "sk_official" ? (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          // Navigate to event details page
                          router.push(`/events/${event._id}`)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setEditingEvent(event)
                          // Pre-fill form with existing event data
                          const eventDate = new Date(event.date)
                          const date = eventDate.toISOString().split('T')[0]
                          const time = event.time || eventDate.toTimeString().slice(0, 5)

                          setEventForm({
                            title: event.title,
                            description: event.description,
                            date: date,
                            time: time,
                            location: event.location,
                            category: event.category,
                            maxParticipants: event.maxParticipants?.toString() || "50",
                            registrationDeadline: event.registrationDeadline
                              ? new Date(event.registrationDeadline).toISOString().split('T')[0]
                              : "",
                            registrationDeadlineTime: event.registrationDeadline
                              ? new Date(event.registrationDeadline).toTimeString().slice(0, 5)
                              : ""
                          })
                          setEditEventOpen(true)
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Event
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        // TODO: Implement event registration
                        toast({
                          title: "Coming Soon",
                          description: "Event registration will be available soon.",
                        })
                      }}
                    >
                      Register for Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
            ) : (
              // No events message
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {localEventsFilter ? "No Local Events Found" : "No Events Found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {localEventsFilter
                    ? `No events found in ${user?.barangay}, ${user?.municipality}. Try viewing all events.`
                    : user?.role === "admin" || user?.role === "sk_official"
                      ? "Create your first event to get started!"
                      : "Check back later for new events."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center h-16"
              onClick={handleEventCalendar}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Event Calendar
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center h-16"
              onClick={handleLocalEvents}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Local Events
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
