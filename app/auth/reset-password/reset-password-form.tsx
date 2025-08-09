"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Key, CheckCircle, XCircle } from "lucide-react"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [tokenChecking, setTokenChecking] = useState(true)
  const [email, setEmail] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { toast } = useToast()

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false)
        setTokenChecking(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token/${token}`)
        const data = await response.json()

        if (data.valid) {
          setIsTokenValid(true)
          setEmail(data.email || "")
        } else {
          setIsTokenValid(false)
          toast({
            title: "Invalid Token",
            description: data.message || "The reset link is invalid or has expired.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Token verification error:", error)
        setIsTokenValid(false)
        toast({
          title: "Error",
          description: "Failed to verify reset token. Please try again.",
          variant: "destructive",
        })
      } finally {
        setTokenChecking(false)
      }
    }

    verifyToken()
  }, [token, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast({
        title: "Error",
        description: "Reset token is missing.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your password has been reset successfully.",
        })

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking token
  if (tokenChecking) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verifying reset link...</span>
      </div>
    )
  }

  // Show error state if token is invalid
  if (isTokenValid === false) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
        <p className="text-gray-600 mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button asChild>
          <a href="/auth/forgot-password">Request New Reset Link</a>
        </Button>
      </div>
    )
  }

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak'
  const passwordsMatch = password === confirmPassword && password.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {email && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Resetting password for:</strong> {email}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="password" className="flex items-center gap-2">
          <Key className="w-4 h-4" />
          New Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {password.length > 0 && (
          <div className="mt-1">
            <div className={`text-xs ${
              passwordStrength === 'strong' ? 'text-green-600' :
              passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Password strength: {passwordStrength}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
          <Key className="w-4 h-4" />
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {confirmPassword.length > 0 && (
          <div className="mt-1 flex items-center gap-1">
            {passwordsMatch ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </span>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !passwordsMatch || password.length < 6}
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  )
}
