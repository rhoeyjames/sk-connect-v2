const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Feedback type is required"],
      enum: ["general", "bug_report", "feature_request", "complaint", "compliment", "suggestion"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    category: {
      type: String,
      enum: ["website", "events", "registration", "suggestions", "general", "technical"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    adminResponse: {
      message: {
        type: String,
        trim: true,
        maxlength: [500, "Admin response cannot exceed 500 characters"],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: {
        type: Date,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Index for searching and filtering
feedbackSchema.index({ subject: "text", message: "text" })
feedbackSchema.index({ type: 1, status: 1, priority: 1 })
feedbackSchema.index({ createdAt: -1 })
feedbackSchema.index({ author: 1, createdAt: -1 })

module.exports = mongoose.model("Feedback", feedbackSchema)
