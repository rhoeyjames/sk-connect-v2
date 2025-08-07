"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Mail, MapPin, User, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import apiClient from "@/lib/api"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    barangay: "",
    municipality: "",
    province: "",
    phoneNumber: "",
    dateOfBirth: "",
    interests: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("") // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (Number.parseInt(formData.age) < 15 || Number.parseInt(formData.age) > 30) {
      setError("Age must be between 15 and 30 years old")
      setIsLoading(false)
      return
    }

    if (!formData.phoneNumber) {
      setError("Phone number is required")
      setIsLoading(false)
      return
    }

    // Validate phone number format for Philippines
    const phoneRegex = /^(\+63|0)[0-9]{10}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be in format: +639123456789 or 09123456789 (exactly 11 digits starting with +63 or 0)")
      setIsLoading(false)
      return
    }

    if (!formData.dateOfBirth) {
      setError("Date of birth is required")
      setIsLoading(false)
      return
    }

    try {

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        age: Number.parseInt(formData.age),
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : [],
      }

      const data = await apiClient.register(registrationData)

      // Store auth data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast({
        title: "Registration Successful!",
        description: `Welcome to SKConnect, ${data.user.firstName}! You are now logged in.`,
      })

      // Redirect based on user role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/events") // Default page for users
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error message:', error.message)
      console.error('Error data:', error.data)

      // Extract specific error message from API response
      let errorMessage = "Registration failed. Please check your information and try again."

      // Check if this is the known "user already exists" case (from backend logs)
      if (error.message && error.message.includes("400")) {
        // This is likely the "User already exists" error based on our backend logs
        errorMessage = "An account with this email address already exists. Please use a different email or try logging in instead."
      } else if (error.message) {
        console.log('Processing error message:', error.message)

        if (error.message.includes("User already exists") || error.message.includes("already exists")) {
          errorMessage = "An account with this email address already exists. Please use a different email or try logging in instead."
        } else if (error.message.includes("validation failed") || error.message.includes("Validation")) {
          errorMessage = "Please check that all fields are filled correctly and try again."
        } else if (error.message.includes("phone")) {
          errorMessage = "Please enter a valid Philippine phone number (e.g., 09123456789)."
        } else if (error.message.includes("password")) {
          errorMessage = "Password must be at least 6 characters long."
        } else {
          errorMessage = error.message
        }
      }

      console.log('Final error message:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">SK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Join SKConnect</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Fill in your information to get started with SKConnect</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{error}</p>
                    {error.includes("already exists") && (
                      <div className="text-sm">
                        <p className="font-medium">What you can do:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          <li>
                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 underline">
                              Try logging in instead
                            </Link>
                          </li>
                          <li>Use a different email address</li>
                          <li>Contact support if you forgot your login details</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your first name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your last name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="15"
                      max="30"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your age (15-30)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be between 15-30 years old to join SK</p>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="09123456789 or +639123456789"
                    className="mt-1"
                    pattern="^(\+63|0)[0-9]{10}$"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 11 digits: start with 09 or +639, followed by 9 more digits
                  </p>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Account Information
                </h3>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Create a password (min. 6 characters)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </h3>
                <div>
                  <Label htmlFor="barangay">Barangay *</Label>
                  <Input
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your barangay"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="municipality">Municipality/City *</Label>
                    <Input
                      id="municipality"
                      name="municipality"
                      value={formData.municipality}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your municipality/city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your province"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Interests & Skills (Optional)</h3>
                <div>
                  <Label htmlFor="interests">What community activities or causes are you interested in?</Label>
                  <Textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., Environmental protection, Youth leadership, Sports, Arts and culture..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
