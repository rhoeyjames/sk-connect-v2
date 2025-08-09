const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [15, "Must be at least 15 years old"],
      max: [30, "Must be 30 years old or younger"],
    },
    barangay: {
      type: String,
      required: [true, "Barangay is required"],
      trim: true,
    },
    municipality: {
      type: String,
      required: [true, "Municipality is required"],
      trim: true,
    },
    province: {
      type: String,
      required: [true, "Province is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^(\+63|0)[0-9]{10}$/, "Please enter a valid Philippine phone number"],
    },
    role: {
      type: String,
      enum: ["youth", "sk_official", "admin"],
      default: "youth",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Hash and set reset token
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Set expiry time (10 minutes)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

// Check if reset token is valid
userSchema.methods.isResetTokenValid = function (token) {
  if (!this.resetPasswordToken || !this.resetPasswordExpires) {
    return false
  }

  // Hash the provided token and compare
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Check if token matches and hasn't expired
  return this.resetPasswordToken === hashedToken && this.resetPasswordExpires > Date.now()
}

// Clear reset token
userSchema.methods.clearResetToken = function () {
  this.resetPasswordToken = null
  this.resetPasswordExpires = null
}

// Remove password and reset token from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.resetPasswordToken
  delete user.resetPasswordExpires
  return user
}

module.exports = mongoose.model("User", userSchema)
