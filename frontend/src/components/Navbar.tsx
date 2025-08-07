"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            SKConnect
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/events" className="hover:text-primary-200 transition-colors">
              Events
            </Link>
            <Link to="/suggestions" className="hover:text-primary-200 transition-colors">
              Suggestions
            </Link>

            {user ? (
              <>
                <Link to="/my-events" className="hover:text-primary-200 transition-colors">
                  My Events
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="hover:text-primary-200 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-primary-200 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary-600 hover:bg-secondary-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-500">
            <div className="flex flex-col space-y-4">
              <Link
                to="/events"
                className="hover:text-primary-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/suggestions"
                className="hover:text-primary-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Suggestions
              </Link>

              {user ? (
                <>
                  <Link
                    to="/my-events"
                    className="hover:text-primary-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Events
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="hover:text-primary-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="pt-4 border-t border-primary-500">
                    <p className="text-sm mb-2">Welcome, {user.name}</p>
                    <button
                      onClick={handleLogout}
                      className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-primary-500">
                  <Link
                    to="/login"
                    className="hover:text-primary-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-secondary-600 hover:bg-secondary-700 px-4 py-2 rounded-lg transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
