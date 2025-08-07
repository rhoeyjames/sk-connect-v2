const mongoose = require("mongoose")

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended", "no_show"],
      default: "pending",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, "Emergency contact name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Emergency contact phone is required"],
        match: [/^(\+63|0)[0-9]{10}$/, "Please enter a valid Philippine phone number"],
      },
      relationship: {
        type: String,
        required: [true, "Relationship to emergency contact is required"],
        trim: true,
      },
    },
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: [300, "Special requirements cannot exceed 300 characters"],
    },
    attendanceMarked: {
      type: Boolean,
      default: false,
    },
    attendanceTime: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, "Feedback comment cannot exceed 500 characters"],
      },
      submittedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true })

// Index for queries
registrationSchema.index({ event: 1, status: 1 })
registrationSchema.index({ user: 1, registrationDate: -1 })

// Virtual for registration age
registrationSchema.virtual("registrationAge").get(function () {
  return Math.floor((new Date() - this.registrationDate) / (1000 * 60 * 60 * 24))
})

module.exports = mongoose.model("Registration", registrationSchema)
