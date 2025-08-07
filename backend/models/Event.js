const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: (value) => value > new Date(),
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time format (HH:MM)"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
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
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["sports", "education", "health", "environment", "culture", "livelihood", "other"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants is required"],
      min: [1, "Must allow at least 1 participant"],
      max: [1000, "Cannot exceed 1000 participants"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    image: {
      type: String,
      default: null,
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    contactInfo: {
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for searching
eventSchema.index({ title: "text", description: "text", tags: "text" })
eventSchema.index({ date: 1, barangay: 1, category: 1 })

// Virtual for registration status
eventSchema.virtual("isRegistrationOpen").get(function () {
  return (
    new Date() < this.registrationDeadline &&
    this.currentParticipants < this.maxParticipants &&
    this.status === "upcoming"
  )
})

// Virtual for spots remaining
eventSchema.virtual("spotsRemaining").get(function () {
  return this.maxParticipants - this.currentParticipants
})

module.exports = mongoose.model("Event", eventSchema)
