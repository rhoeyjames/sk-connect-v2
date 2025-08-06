"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users
} from "lucide-react"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  organizer: {
    firstName: string
    lastName: string
  }
  maxParticipants?: number
  currentParticipants: number
  status: string
}

interface EventCalendarProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export default function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get events for the current month
  const monthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
    })
  }, [events, currentMonth, currentYear])

  // Get events for a specific date
  const getEventsForDate = (date: number) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === date
    })
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(clickedDate)
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : []

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <p className="text-sm text-gray-600">
            {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''} this month
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-12"></div>
              }

              const dayEvents = getEventsForDate(day)
              const hasEvents = dayEvents.length > 0

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-12 flex items-center justify-center text-sm rounded cursor-pointer relative
                    ${isToday(day) 
                      ? 'bg-blue-600 text-white font-bold' 
                      : isSelected(day)
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : hasEvents 
                          ? 'bg-green-50 text-green-800 font-medium hover:bg-green-100' 
                          : 'hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                  {hasEvents && (
                    <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                      isToday(day) ? 'bg-white' : 'bg-green-500'
                    }`}></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              Today
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded mr-2"></div>
              Has Events
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Event Indicator
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {selectedDate 
                ? `Events on ${selectedDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}`
                : 'Select a date to view events'
              }
            </h3>

            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={() => onEventClick?.(event)}
                      className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {event.title}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs flex-shrink-0"
                        >
                          {event.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {event.currentParticipants} registered
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No events on this date</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click on a date to see events</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">This Month</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">{monthEvents.length}</div>
                <div className="text-blue-700">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {monthEvents.filter(e => e.status === 'upcoming').length}
                </div>
                <div className="text-blue-700">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
