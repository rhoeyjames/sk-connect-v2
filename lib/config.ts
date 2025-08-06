// API Configuration for different environments
export const API_CONFIG = {
  // Backend URL configuration
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 
               process.env.BACKEND_URL || 
               'http://localhost:5000',
  
  // API URL configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // App URL configuration
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 
           process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
           'http://localhost:3000',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_VERCEL: Boolean(process.env.VERCEL),
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/skconnect',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
  
  // File upload configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
}

// Helper functions
export const getApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.API_URL
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export const getBackendUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.BACKEND_URL
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export const isValidFileType = (mimeType: string) => {
  return API_CONFIG.ALLOWED_FILE_TYPES.includes(mimeType)
}

export const isValidFileSize = (size: number) => {
  return size <= API_CONFIG.MAX_FILE_SIZE
}
