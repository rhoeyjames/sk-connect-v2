"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  type: string
  venue: string
  image: string
  registrationCount?: number
}

const Home: React.FC = () => {
  const { user } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get("/api/events?upcoming=true&limit=3")
        setUpcomingEvents(response.data.slice(0, 3))
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingEvents()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to SKConnect</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your gateway to youth development and community engagement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Events
            </Link>
            <Link
              to="/suggestions/create"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Suggest a Project
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="card-body">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Event Management</h3>
            <p className="text-gray-600">Discover and register for youth development events in your community</p>
          </div>
        </div>

        <div className="card text-center">
          <div className="card-body">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Project Suggestions</h3>
            <p className="text-gray-600">Share your ideas for community projects and vote on others' suggestions</p>
          </div>
        </div>

        <div className="card text-center">
          <div className="card-body">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Feedback System</h3>
            <p className="text-gray-600">Rate events and provide feedback to help improve future activities</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
          <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Events →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="card hover:shadow-lg transition-shadow">
                {event.image && (
                  <img src={`/${event.image}`} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
                )}
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge bg-primary-100 text-primary-800">
                      {event.type.replace("-", " ").toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>📍 {event.venue}</p>
                      <p>🕒 {event.time}</p>
                    </div>
                    <Link to={`/events/${event._id}`} className="btn-primary text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No upcoming events at the moment.</p>
            {user?.role === "admin" && (
              <Link to="/admin" className="btn-primary mt-4 inline-block">
                Create Event
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="bg-gray-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the SKConnect Community</h2>
          <p className="text-gray-600 mb-6">
            Register now to participate in events, share project ideas, and connect with fellow youth in your community.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started Today
          </Link>
        </section>
      )}
    </div>
  )
}

export default Home
