const express = require("express")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const emailService = require("../services/emailService")

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

// Forgot password - Send reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Return success even if user doesn't exist (security practice)
      return res.json({
        message: "If an account with that email exists, we've sent a password reset link."
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated" })
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Send reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken
    )

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error)
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later."
      })
    }

    // Log for development
    if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
      console.log(`📧 Password reset email preview: ${emailResult.previewUrl}`)
    }

    res.json({
      message: "If an account with that email exists, we've sent a password reset link.",
      ...(process.env.NODE_ENV !== 'production' && emailResult.previewUrl && {
        previewUrl: emailResult.previewUrl
      })
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    // Hash the token to find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Update password and clear reset token
    user.password = password
    user.clearResetToken()
    await user.save()

    res.json({ message: "Password reset successful. You can now log in with your new password." })

  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      message: "Failed to reset password. Please try again.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Verify reset token (optional - for frontend to check if token is valid)
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Hash the token to find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token"
      })
    }

    res.json({
      valid: true,
      email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") // Partially hide email
    })

  } catch (error) {
    console.error("Verify reset token error:", error)
    res.status(500).json({
      valid: false,
      message: "Failed to verify token"
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
