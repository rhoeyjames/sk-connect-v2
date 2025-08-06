import mongoose from 'mongoose'
import { API_CONFIG } from './config'

if (!API_CONFIG.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global cache to prevent multiple connections in serverless environments
declare global {
  var mongoose: MongooseCache | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    }

    cached.promise = mongoose.connect(API_CONFIG.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
