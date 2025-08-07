"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Shield, Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/setup/promote-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, secretKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to promote user to admin")
        return
      }

      setSuccess(`Successfully promoted ${data.user.firstName} ${data.user.lastName} to admin!`)
      toast({
        title: "Admin Promotion Successful!",
        description: `${data.user.firstName} is now an admin. Please log out and log back in to access admin features.`,
      })

      // Clear form
      setEmail("")
      setSecretKey("")
    } catch (error: any) {
      console.error("Promote admin error:", error)
      setError("Failed to promote user to admin. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Setup Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Promote a user to admin role for initial setup
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Promote User to Admin</CardTitle>
            <CardDescription>
              Enter the email of the user you want to promote to admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6" variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter user email to promote"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  name="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  placeholder="Enter setup secret key"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use: admin-setup-secret-key
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Promoting to Admin...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Promote to Admin
                  </>
                )}
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Important Notes:
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>This should only be used for initial setup</li>
                        <li>After promotion, log out and log back in</li>
                        <li>Admin users can access /admin dashboard</li>
                        <li>Delete this page after setup is complete</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
