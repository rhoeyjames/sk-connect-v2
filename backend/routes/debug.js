const express = require("express")
const User = require("../models/User")

const router = express.Router()

// Debug endpoint to list all users (remove in production)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, {
      password: 0, // Exclude password field
    }).sort({ createdAt: -1 })

    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        barangay: user.barangay,
        municipality: user.municipality,
        province: user.province,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    console.error("Debug users error:", error)
    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    })
  }
})

module.exports = router
