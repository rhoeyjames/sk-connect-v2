"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Save,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Edit
} from "lucide-react"

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
  isRegistrationOpen?: boolean
}

interface EventManagementModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onEventUpdated: () => void
}

export default function EventManagementModal({ 
  isOpen, 
  onClose, 
  event,
  onEventUpdated
}: EventManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    maxParticipants: "",
    status: "",
    registrationDeadline: "",
    barangay: "",
    municipality: "",
    province: "",
    requirements: "",
    tags: "",
    isRegistrationOpen: true
  })
  const { toast } = useToast()

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
        time: event.time || "",
        location: event.location || "",
        category: event.category || "",
        maxParticipants: event.maxParticipants?.toString() || "",
        status: event.status || "",
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
        barangay: event.barangay || "",
        municipality: event.municipality || "",
        province: event.province || "",
        requirements: event.requirements?.join(", ") || "",
        tags: event.tags?.join(", ") || "",
        isRegistrationOpen: event.isRegistrationOpen !== false
      })
    }
  }, [event])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async () => {
    if (!event) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        })
        return
      }

      // Prepare JSON data for update
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category,
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province,
        status: formData.status,
        isRegistrationOpen: formData.isRegistrationOpen,
      }

      if (formData.maxParticipants) {
        updateData.maxParticipants = parseInt(formData.maxParticipants) || 50
      }
      if (formData.registrationDeadline) {
        updateData.registrationDeadline = formData.registrationDeadline
      }
      if (formData.requirements) {
        // Split requirements by comma
        updateData.requirements = formData.requirements.split(",").map(r => r.trim()).filter(r => r)
      }
      if (formData.tags) {
        // Split tags by comma
        updateData.tags = formData.tags.split(",").map(t => t.trim()).filter(t => t)
      }

      console.log('Updating event with data:', updateData)

      const response = await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update event')
      }

      toast({
        title: "Success",
        description: "Event updated successfully",
      })

      onEventUpdated()
      onClose()
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event) return

    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete event')
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      onClose()
      // Redirect to events page
      window.location.href = "/events"
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleRegistration = () => {
    handleInputChange("isRegistrationOpen", !formData.isRegistrationOpen)
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Manage Event - {event.title}
          </DialogTitle>
          <DialogDescription>
            Update event details, manage registrations, and control event status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="details" className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter event description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange("time", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Enter event location"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sports">Sports & Recreation</SelectItem>
                        <SelectItem value="education">Education & Training</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="culture">Arts & Culture</SelectItem>
                        <SelectItem value="community">Community Service</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="livelihood">Livelihood & Skills</SelectItem>
                        <SelectItem value="governance">Governance & Leadership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="barangay">Barangay</Label>
                      <Input
                        id="barangay"
                        value={formData.barangay}
                        onChange={(e) => handleInputChange("barangay", e.target.value)}
                        placeholder="Barangay"
                      />
                    </div>
                    <div>
                      <Label htmlFor="municipality">Municipality</Label>
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) => handleInputChange("municipality", e.target.value)}
                        placeholder="Municipality"
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        placeholder="Province"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    placeholder="e.g., Valid ID, Medical Certificate, Parental Consent"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="e.g., youth, sports, community, training"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 p-1">
              <Card>
                <CardHeader>
                  <CardTitle>Event Status</CardTitle>
                  <CardDescription>Control the current status of your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registration Settings</CardTitle>
                  <CardDescription>Manage event registration availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Registration Status</div>
                      <div className="text-sm text-gray-500">
                        {formData.isRegistrationOpen ? "Accepting new registrations" : "Registration closed"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={toggleRegistration}
                      className="flex items-center"
                    >
                      {formData.isRegistrationOpen ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Close Registration
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Open Registration
                        </>
                      )}
                    </Button>
                  </div>
                  <Badge variant={formData.isRegistrationOpen ? "default" : "secondary"}>
                    {formData.isRegistrationOpen ? "Open" : "Closed"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Statistics</CardTitle>
                  <CardDescription>Current event metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{event.currentParticipants}</div>
                      <div className="text-sm text-gray-500">Current Participants</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{event.maxParticipants || "∞"}</div>
                      <div className="text-sm text-gray-500">Max Participants</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="space-y-6 p-1">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that will permanently affect your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-700">Delete Event</div>
                      <div className="text-sm text-gray-500">
                        Permanently delete this event and all associated data. This action cannot be undone.
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteEvent}
                      disabled={loading}
                      className="flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
