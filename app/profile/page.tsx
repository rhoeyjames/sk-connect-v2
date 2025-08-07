"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  Shield,
  Users,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "youth" | "sk_official" | "admin"
  age?: number
  barangay: string
  municipality?: string
  province?: string
  phoneNumber?: string
  dateOfBirth?: string
  interests?: string[]
  profilePicture?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    barangay: "",
    municipality: "",
    province: "",
    interests: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuthAndLoadProfile()
  }, [])

  const checkAuthAndLoadProfile = async () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        phoneNumber: parsedUser.phoneNumber || "",
        barangay: parsedUser.barangay || "",
        municipality: parsedUser.municipality || "",
        province: parsedUser.province || "",
        interests: parsedUser.interests?.join(", ") || "",
      })
      
      // Fetch updated profile from server
      await fetchProfile()
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth/login")
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/auth/profile", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phoneNumber: data.user.phoneNumber || "",
          barangay: data.user.barangay || "",
          municipality: data.user.municipality || "",
          province: data.user.province || "",
          interests: data.user.interests?.join(", ") || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      const updateData = {
        ...formData,
        interests: formData.interests.split(",").map(i => i.trim()).filter(i => i)
      }

      const response = await fetch("/api/auth/profile", {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        
        setEditing(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4 text-red-600" />
      case "sk_official": return <Shield className="h-4 w-4 text-blue-600" />
      default: return <Users className="h-4 w-4 text-green-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-red-100 text-red-800">Administrator</Badge>
      case "sk_official": return <Badge className="bg-blue-100 text-blue-800">SK Official</Badge>
      default: return <Badge className="bg-green-100 text-green-800">Youth Member</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.firstName} />
                  <AvatarFallback className="text-xl">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription className="text-lg">{user.email}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleIcon(user.role)}
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {editing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.firstName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {editing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.lastName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    {editing ? (
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.phoneNumber || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  {user.age && (
                    <div>
                      <Label>Age</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.age} years old</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location & Additional Info</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    {editing ? (
                      <Input
                        id="barangay"
                        value={formData.barangay}
                        onChange={(e) => handleInputChange("barangay", e.target.value)}
                        placeholder="Enter barangay"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.barangay}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="municipality">Municipality</Label>
                    {editing ? (
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) => handleInputChange("municipality", e.target.value)}
                        placeholder="Enter municipality"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.municipality || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="province">Province</Label>
                    {editing ? (
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        placeholder="Enter province"
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{user.province || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    {editing ? (
                      <Textarea
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => handleInputChange("interests", e.target.value)}
                        placeholder="Enter interests separated by commas"
                        rows={3}
                      />
                    ) : user.interests && user.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 mt-1">No interests specified</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View your account details and role information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>User ID</Label>
                <div className="text-sm text-gray-600 mt-1 font-mono">{user.id}</div>
              </div>
              <div>
                <Label>Account Role</Label>
                <div className="flex items-center mt-1">
                  {getRoleIcon(user.role)}
                  <span className="ml-2">{getRoleBadge(user.role)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
