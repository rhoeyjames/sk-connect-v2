const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://e2f5845bd12a4ed3bcf48b685abe9a17-5bfdffcfac0d4123bb0d065ae.fly.dev",
      /.*\.fly\.dev$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/events", require("./routes/events"))
app.use("/api/registrations", require("./routes/registrations"))
app.use("/api/suggestions", require("./routes/suggestions"))
app.use("/api/feedback", require("./routes/feedback"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/setup", require("./routes/setup"))
app.use("/api/debug", require("./routes/debug"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SKConnect Backend is running",
    timestamp: new Date().toISOString(),
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SKConnect API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events",
      registrations: "/api/registrations",
      suggestions: "/api/suggestions",
      feedback: "/api/feedback",
      admin: "/api/admin",
      health: "/api/health",
    },
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Connect to MongoDB Atlas or local MongoDB
let mongoConnected = false

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/skconnect"

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB:", mongoUri.includes('mongodb.net') ? 'Atlas' : 'Local')
    mongoConnected = true
  } catch (err) {
    console.error("MongoDB connection error:", err)
    console.log("Please check your MongoDB connection string")
    // Don't exit, let the app continue with error handling
  }
}

connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
