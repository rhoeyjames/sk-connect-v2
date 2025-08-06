"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Users, Info, LogIn, UserPlus, Shield, LogOut, Settings } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "youth" | "sk_official" | "admin"
  age: number
  barangay: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Function to check authentication state
    const checkAuthState = () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error("Error parsing user data:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    // Check on initial load
    checkAuthState()

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        checkAuthState()
      }
    }

    // Listen for focus events (when user returns to tab after login)
    const handleFocus = () => {
      checkAuthState()
    }

    // Custom event for when auth state changes in same tab
    const handleAuthChange = () => {
      checkAuthState()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("authStateChange", handleAuthChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("authStateChange", handleAuthChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  // Create role-based navigation
  const navigation = user?.role === "admin"
    ? [
        { name: "Dashboard", href: "/admin", icon: Shield },
        { name: "Events", href: "/events", icon: Calendar },
        { name: "About", href: "/about", icon: Info },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Events", href: "/events", icon: Calendar },
        { name: "About", href: "/about", icon: Info },
      ]

  const isActive = (href: string) => pathname === href

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Ffabc43030bfc4ff6a60efabdca8137fc%2Fd9f1846c5b2646e5a193351263ff9dd2?format=webp&width=800"
                  alt="SKConnect Logo"
                  className="h-10 w-10 rounded-lg"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">SKConnect</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ffabc43030bfc4ff6a60efabdca8137fc%2Fd9f1846c5b2646e5a193351263ff9dd2?format=webp&width=800"
                alt="SKConnect Logo"
                className="h-10 w-10 rounded-lg"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">SKConnect</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {item.name === "Admin Dashboard" && <Badge className="ml-2 bg-red-100 text-red-800">Admin</Badge>}
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.firstName} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {user.role === "admin" && (
                            <Badge className="bg-red-100 text-red-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.role === "sk_official" && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              SK Official
                            </Badge>
                          )}
                          {user.role === "youth" && (
                            <Badge className="bg-green-100 text-green-800">
                              <Users className="w-3 h-3 mr-1" />
                              Youth
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* User info in mobile */}
                    {user && (
                      <div className="pb-4 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={user.firstName} />
                            <AvatarFallback>
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <div className="flex items-center mt-1">
                              {user.role === "admin" && (
                                <Badge className="bg-red-100 text-red-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {user.role === "sk_official" && (
                                <Badge className="bg-blue-100 text-blue-800">SK Official</Badge>
                              )}
                              {user.role === "youth" && <Badge className="bg-green-100 text-green-800">Youth</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation links */}
                    {navigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isActive(item.href)
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                          {item.name === "Admin Dashboard" && (
                            <Badge className="ml-2 bg-red-100 text-red-800">Admin</Badge>
                          )}
                        </Link>
                      )
                    })}

                    {/* Auth links */}
                    <div className="pt-4 border-t">
                      {user ? (
                        <Button
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Logout
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              <LogIn className="h-5 w-5 mr-3" />
                              Login
                            </Button>
                          </Link>
                          <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                            <Button className="w-full justify-start">
                              <UserPlus className="h-5 w-5 mr-3" />
                              Register
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
