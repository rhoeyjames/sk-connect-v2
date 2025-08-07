const express = require("express")
const User = require("../models/User")

const router = express.Router()

// Promote user to admin (for initial setup only)
router.post("/promote-admin", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user role to admin
    user.role = "admin"
    await user.save()

    res.json({
      message: "User promoted to admin successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        barangay: user.barangay,
        municipality: user.municipality,
        province: user.province,
      },
    })
  } catch (error) {
    console.error("Promote admin error:", error)
    res.status(500).json({
      message: "Failed to promote user to admin",
      error: error.message,
    })
  }
})

module.exports = router
