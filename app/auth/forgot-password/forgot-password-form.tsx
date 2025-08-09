"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reset Link Sent!",
          description: data.message || "Check your email for password reset instructions.",
        })

        // Show preview URL in development
        if (data.previewUrl) {
          console.log("📧 Email preview:", data.previewUrl)
          toast({
            title: "Development Mode",
            description: "Check console for email preview link.",
          })
        }

        setEmail("")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset email. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  )
}
