"use client"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Phone, 
  Users,
  Heart,
  Save,
  Calendar,
  MapPin,
  Clock
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
}

interface EventRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onRegistrationSuccess: () => void
}

// Eligibility checking function
function checkEventEligibility(user: any, event: Event) {
  // Admin and SK officials can always register (for testing/monitoring)
  if (user.role === 'admin' || user.role === 'sk_official') {
    return { eligible: true, reason: '' }
  }

  // Check barangay match (case insensitive)
  const userBarangay = user.barangay?.toLowerCase().trim()
  const eventBarangay = event.barangay?.toLowerCase().trim()

  if (!userBarangay) {
    return {
      eligible: false,
      reason: 'Your profile is missing barangay information. Please update your profile first.'
    }
  }

  if (userBarangay !== eventBarangay) {
    return {
      eligible: false,
      reason: `This event is only for residents of ${event.barangay}. Your registered barangay is ${user.barangay}.`
    }
  }

  // Check municipality for extra validation (optional)
  const userMunicipality = user.municipality?.toLowerCase().trim()
  const eventMunicipality = event.municipality?.toLowerCase().trim()

  if (userMunicipality && eventMunicipality && userMunicipality !== eventMunicipality) {
    return {
      eligible: false,
      reason: `This event is only for residents of ${event.municipality}. Your registered municipality is ${user.municipality}.`
    }
  }

  return { eligible: true, reason: '' }
}

export default function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  onRegistrationSuccess
}: EventRegistrationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    specialRequirements: "",
    notes: "",
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        toast({
          title: "Authentication Required",
          description: "Please log in to register for events",
          variant: "destructive",
        })
        return
      }

      // Check barangay eligibility
      const user = JSON.parse(userData)
      const isEligible = checkEventEligibility(user, event)

      if (!isEligible.eligible) {
        toast({
          title: "Registration Not Allowed",
          description: isEligible.reason,
          variant: "destructive",
        })
        return
      }

      const registrationData = {
        eventId: event._id,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        specialRequirements: formData.specialRequirements,
        notes: formData.notes,
      }

      const response = await fetch("/api/registrations", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Registration Successful!",
          description: `You have successfully registered for ${event.title}`,
        })
        
        onRegistrationSuccess()
        onClose()
        
        // Reset form
        setFormData({
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelationship: "",
          specialRequirements: "",
          notes: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to register for event")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!event) return null

  const isRegistrationOpen = event.registrationDeadline ? 
    new Date() < new Date(event.registrationDeadline) : true
  const spotsAvailable = event.maxParticipants ? 
    event.maxParticipants - event.currentParticipants : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Register for Event
          </DialogTitle>
          <DialogDescription>
            Complete the registration form to join this event
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Event Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 text-lg mb-2">{event.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {event.time}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {event.currentParticipants} registered
                {spotsAvailable && ` (${spotsAvailable} spots left)`}
              </div>
            </div>
          </div>

          {/* Eligibility Check */}
          {(() => {
            const userData = localStorage.getItem("user")
            if (!userData) return null

            const user = JSON.parse(userData)
            const eligibility = checkEventEligibility(user, event)

            if (!eligibility.eligible) {
              return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Registration Restricted
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        {eligibility.reason}
                      </div>
                      <div className="mt-2 text-xs text-yellow-600">
                        <strong>Event Location:</strong> {event.barangay}, {event.municipality}, {event.province}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    ✓ You are eligible to register for this event
                  </span>
                </div>
              </div>
            )
          })()}

          {/* Registration Status */}
          {!isRegistrationOpen ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800">Registration Closed</h3>
              <p className="text-sm text-red-600 mt-1">
                Registration deadline has passed. Contact the organizer if you need assistance.
              </p>
            </div>
          ) : spotsAvailable === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800">Event Full</h3>
              <p className="text-sm text-yellow-600 mt-1">
                This event has reached its maximum capacity. You can still register to be added to the waitlist.
              </p>
            </div>
          ) : null}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      placeholder="Full name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      placeholder="+63 XXX XXX XXXX"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                <Input
                  id="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                  placeholder="e.g., Parent, Guardian, Spouse, Friend"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequirements">Special Requirements or Dietary Restrictions</Label>
              <div className="relative mt-1">
                <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                  placeholder="Any medical conditions, dietary restrictions, or accessibility needs..."
                  className="pl-10"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information or questions..."
                rows={2}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Registration Terms</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You agree to attend the event at the scheduled time</li>
                <li>• Contact information may be used for event-related communication</li>
                <li>• Follow event guidelines and organizer instructions</li>
                <li>• Inform organizers of any changes to your attendance</li>
              </ul>
            </div>
          </form>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isRegistrationOpen}
            className="flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? "Registering..." : "Register for Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
