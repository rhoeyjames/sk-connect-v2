"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, UserCheck, Loader2, RefreshCw } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  barangay: string
  municipality: string
  province: string
  createdAt: string
}

export default function DebugUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/debug/users")
      const data = await response.json()
      
      if (data.users) {
        setUsers(data.users)
      } else {
        setError(data.message || "No users found")
      }
    } catch (err) {
      setError("Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />
      case "sk_official":
        return <UserCheck className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-green-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Administrator</Badge>
      case "sk_official":
        return <Badge className="bg-blue-100 text-blue-800">SK Official</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800">Youth Member</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <Shield className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ DEVELOPMENT ONLY - SECURITY WARNING
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>This debug page exposes user information and should ONLY be used during development.
                  Remove this page in production environments.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Debug: Registered Users</h1>
              <p className="text-gray-600 mt-2">
                View all registered users in the database (for debugging login issues)
              </p>
            </div>
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        )}

        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <Button onClick={fetchUsers} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Total Users: {users.length}
              </h2>
              <p className="text-sm text-gray-600">
                Use any of these email addresses to test login. If you can't log in, 
                try registering a new account first.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2">{user.firstName} {user.lastName}</span>
                      </CardTitle>
                      {getRoleBadge(user.role)}
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Location:</span> {user.barangay}, {user.municipality}, {user.province}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Registered:</span>{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(user.email)
                            alert("Email copied to clipboard!")
                          }}
                          className="w-full"
                        >
                          Copy Email for Login
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {users.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-600 mb-4">
                      No users are registered in the database yet.
                    </p>
                    <Button onClick={() => window.location.href = "/auth/register"}>
                      Register First User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Troubleshooting Login Issues:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure you're using the exact email address shown above</li>
            <li>• Use the same password you set during registration</li>
            <li>• Ensure the user account is "Active"</li>
            <li>• Select the correct role in the login dropdown</li>
            <li>• If still having issues, try registering a new account</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
