const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface ApiError extends Error {
  status?: number
  data?: any
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        console.log('API Client - Error response status:', response.status)
        console.log('API Client - Error data received:', errorData)

        // Extract specific error message
        let errorMessage = `HTTP error! status: ${response.status}`

        if (errorData.message) {
          console.log('API Client - Found message in errorData:', errorData.message)
          errorMessage = errorData.message
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          console.log('API Client - Found errors array:', errorData.errors)
          errorMessage = errorData.errors.join(', ')
        } else if (errorData.error) {
          console.log('API Client - Found error field:', errorData.error)
          errorMessage = errorData.error
        } else {
          console.log('API Client - No recognized error message field found')
        }

        console.log('API Client - Final error message:', errorMessage)

        const error = new Error(errorMessage) as ApiError
        error.status = response.status
        error.data = errorData
        throw error
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
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
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  async updateProfile(userData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async verifyToken() {
    return this.request('/auth/verify')
  }

  // Events endpoints
  async getEvents(params?: {
    page?: number
    limit?: number
    category?: string
    barangay?: string
    municipality?: string
    province?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/events${query ? `?${query}` : ''}`)
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`)
  }

  async createEvent(eventData: FormData) {
    return this.request('/events', {
      method: 'POST',
      body: eventData,
      headers: {}, // Don't set Content-Type for FormData
    })
  }

  async updateEvent(id: string, eventData: FormData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: eventData,
      headers: {}, // Don't set Content-Type for FormData
    })
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  async getEventStats(id: string) {
    return this.request(`/events/${id}/stats`)
  }

  // Registrations endpoints
  async registerForEvent(eventId: string, registrationData?: any) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, ...registrationData }),
    })
  }

  async getRegistrations(params?: {
    eventId?: string
    userId?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/registrations${query ? `?${query}` : ''}`)
  }

  async updateRegistrationStatus(id: string, status: string) {
    return this.request(`/registrations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard')
  }

  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/admin/users${query ? `?${query}` : ''}`)
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async toggleUserStatus(userId: string) {
    return this.request(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
    })
  }

  // Feedback endpoints
  async submitFeedback(feedbackData: {
    type: string
    content: string
    eventId?: string
    rating?: number
  }) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    })
  }

  async getFeedback(params?: { eventId?: string; type?: string }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/feedback${query ? `?${query}` : ''}`)
  }

  // Suggestions endpoints
  async submitSuggestion(suggestionData: {
    title: string
    description: string
    category: string
  }) {
    return this.request('/suggestions', {
      method: 'POST',
      body: JSON.stringify(suggestionData),
    })
  }

  async getSuggestions(params?: { category?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request(`/suggestions${query ? `?${query}` : ''}`)
  }

  async voteSuggestion(suggestionId: string, voteType: 'upvote' | 'downvote') {
    return this.request(`/suggestions/${suggestionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

// Create and export a default instance
const apiClient = new ApiClient()

export default apiClient
export { ApiClient }
export type { ApiError }
