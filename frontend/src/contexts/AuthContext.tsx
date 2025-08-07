"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  age: number
  barangay: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  age: number
  barangay: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await axios.get("/api/auth/me")
          setUser(response.data.user)
        } catch (error) {
          localStorage.removeItem("token")
          setToken(null)
          delete axios.defaults.headers.common["Authorization"]
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token: newToken, user: userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)
      const { token: newToken, user: newUser } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(newUser)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
