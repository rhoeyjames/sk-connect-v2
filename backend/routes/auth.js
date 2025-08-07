const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      barangay,
      municipality,
      province,
      phoneNumber,
      dateOfBirth,
      interests,
    } = req.body

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      age,
      barangay,
      municipality,
      province,
      phoneNumber,
      dateOfBirth,
      interests: interests || [],
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User registered successfully",
      token,
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
    console.error("Registration error:", error)

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        details: error.message,
      })
    }

    res.status(400).json({
      message: "Registration failed",
      error: error.message,
    })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        barangay: user.barangay,
        municipality: user.municipality,
        province: user.province,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    })
  }
})

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phoneNumber",
      "barangay",
      "municipality",
      "province",
      "interests",
      "profilePicture",
    ]

    const updates = {}
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(400).json({
      message: "Failed to update profile",
      error: error.message,
    })
  }
})

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    res.status(400).json({
      message: "Failed to change password",
      error: error.message,
    })
  }
})

// Verify token
router.get("/verify", auth, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
  })
})

module.exports = router
