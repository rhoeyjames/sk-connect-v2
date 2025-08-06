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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

interface Registration {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    age: number
    barangay: string
    municipality: string
    province: string
  }
  status: "pending" | "confirmed" | "cancelled" | "attended" | "no_show"
  registrationDate: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  specialRequirements?: string
  notes?: string
  attendanceMarked: boolean
  attendanceTime?: string
}

interface ParticipantsModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
}

export default function ParticipantsModal({ 
  isOpen, 
  onClose, 
  eventId, 
  eventTitle 
}: ParticipantsModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && eventId) {
      fetchParticipants()
    }
  }, [isOpen, eventId, statusFilter])

  const fetchParticipants = async () => {
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

      const queryParams = new URLSearchParams()
      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter)
      }

      const response = await fetch(`/api/registrations/event/${eventId}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error("Error fetching participants:", error)
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRegistrationStatus = async (registrationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`/api/registrations/${registrationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "Registration status updated",
      })

      // Refresh the list
      fetchParticipants()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error", 
        description: "Failed to update registration status",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled": return <XCircle className="h-4 w-4 text-red-600" />
      case "attended": return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "no_show": return <XCircle className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
      attended: { variant: "default" as const, label: "Attended" },
      no_show: { variant: "outline" as const, label: "No Show" },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredRegistrations = registrations.filter(registration => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      registration.user.firstName.toLowerCase().includes(searchLower) ||
      registration.user.lastName.toLowerCase().includes(searchLower) ||
      registration.user.email.toLowerCase().includes(searchLower)
    )
  })

  const statusCounts = registrations.reduce((acc, reg) => {
    acc[reg.status] = (acc[reg.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Event Participants - {eventTitle}
          </DialogTitle>
          <DialogDescription>
            Manage registrations and track attendance for this event
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{registrations.length}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed || 0}</div>
            <div className="text-sm text-gray-500">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.attended || 0}</div>
            <div className="text-sm text-gray-500">Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled || 0}</div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 pb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Participants Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Users className="h-12 w-12 mb-4" />
              <p>No participants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {registration.user.firstName.charAt(0)}
                            {registration.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {registration.user.firstName} {registration.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">Age: {registration.user.age}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {registration.user.email}
                        </div>
                        {registration.user.phoneNumber && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {registration.user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        <span>
                          {registration.user.barangay}, {registration.user.municipality}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(registration.status)}
                        {getStatusBadge(registration.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={registration.status}
                        onValueChange={(value) => updateRegistrationStatus(registration._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="attended">Attended</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
