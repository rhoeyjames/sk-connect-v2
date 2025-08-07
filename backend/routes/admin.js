const express = require("express")
const User = require("../models/User")
const Event = require("../models/Event")
const Registration = require("../models/Registration")
const Suggestion = require("../models/Suggestion")
const Feedback = require("../models/Feedback")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard", auth, adminAuth, async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Registration.countDocuments(),
      Suggestion.countDocuments(),
      Feedback.countDocuments(),
      Event.countDocuments({ status: "upcoming" }),
      Event.countDocuments({ status: "completed" }),
      Suggestion.countDocuments({ status: "pending" }),
      Feedback.countDocuments({ status: "open" }),
    ])

    const dashboardStats = {
      totalUsers: stats[0],
      totalEvents: stats[1],
      totalRegistrations: stats[2],
      totalSuggestions: stats[3],
      totalFeedback: stats[4],
      upcomingEvents: stats[5],
      completedEvents: stats[6],
      pendingSuggestions: stats[7],
      openFeedback: stats[8],
    }

    // Get recent activities
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt")

    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("organizer", "firstName lastName")
      .select("title date status organizer createdAt")

    const recentSuggestions = await Suggestion.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "firstName lastName")
      .select("title status author createdAt")

    res.json({
      stats: dashboardStats,
      recentActivities: {
        users: recentUsers,
        events: recentEvents,
        suggestions: recentSuggestions,
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    })
  }
})

// Get all users with filtering
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, barangay, municipality, province, search } = req.query

    // Build filter object
    const filter = {}
    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === "true"
    if (barangay) filter.barangay = new RegExp(barangay, "i")
    if (municipality) filter.municipality = new RegExp(municipality, "i")
    if (province) filter.province = new RegExp(province, "i")

    // Add search functionality
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ]
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    })
  }
})

// Update user role
router.put("/users/:id/role", auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body
    const validRoles = ["youth", "sk_official", "admin"]

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "User role updated successfully",
      user,
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(400).json({
      message: "Failed to update user role",
      error: error.message,
    })
  }
})

// Toggle user active status
router.put("/users/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(400).json({
      message: "Failed to update user status",
      error: error.message,
    })
  }
})

// Get system analytics
router.get("/analytics", auth, adminAuth, async (req, res) => {
  try {
    const { period = "30" } = req.query // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ])

    // Event creation trends
    const eventCreations = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ])

    // Popular event categories
    const eventCategories = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    // Suggestion status distribution
    const suggestionStatus = await Suggestion.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // User distribution by location
    const usersByLocation = await User.aggregate([
      {
        $group: {
          _id: {
            province: "$province",
            municipality: "$municipality",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ])

    res.json({
      userRegistrations,
      eventCreations,
      eventCategories,
      suggestionStatus,
      usersByLocation,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    })
  }
})

// Export data (CSV format)
router.get("/export/:type", auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.params
    let data = []
    let filename = ""

    switch (type) {
      case "users":
        data = await User.find().select("-password").lean()
        filename = "users.json"
        break
      case "events":
        data = await Event.find().populate("organizer", "firstName lastName email").lean()
        filename = "events.json"
        break
      case "registrations":
        data = await Registration.find()
          .populate("user", "firstName lastName email")
          .populate("event", "title date location")
          .lean()
        filename = "registrations.json"
        break
      case "suggestions":
        data = await Suggestion.find().populate("author", "firstName lastName email").lean()
        filename = "suggestions.json"
        break
      case "feedback":
        data = await Feedback.find().populate("author", "firstName lastName email").lean()
        filename = "feedback.json"
        break
      default:
        return res.status(400).json({ message: "Invalid export type" })
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
    res.json(data)
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({
      message: "Failed to export data",
      error: error.message,
    })
  }
})

module.exports = router
