"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import apiClient, { type ApiError } from "./api"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "youth" | "sk_official" | "admin"
  age?: number
  barangay: string
  municipality?: string
  province?: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  updateProfile: (userData: any) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  age: number
  barangay: string
  municipality: string
  province: string
  phoneNumber?: string
  dateOfBirth?: string
  interests?: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount and verify token
    const initializeAuth = async () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        try {
          // Verify token with backend
          const response = await apiClient.verifyToken()
          if (response.valid) {
            setUser(JSON.parse(userData))
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        } catch (error) {
          console.error("Token verification failed:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password)

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.data?.message || apiError.message || "Login failed")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const data = await apiClient.register(userData)

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      router.push("/")
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.data?.message || apiError.message || "Registration failed")
    }
  }

  const updateProfile = async (userData: any) => {
    try {
      const data = await apiClient.updateProfile(userData)

      // Update user in state and localStorage
      const updatedUser = data.user
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.data?.message || apiError.message || "Profile update failed")
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiClient.changePassword(currentPassword, newPassword)
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.data?.message || apiError.message || "Password change failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
