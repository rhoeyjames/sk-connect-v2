const mongoose = require("mongoose")

const suggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Suggestion title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Suggestion description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["infrastructure", "programs", "events", "services", "policy", "other"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "implemented"],
      default: "pending",
    },
    votes: {
      upvotes: {
        type: Number,
        default: 0,
        min: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
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
    implementationDetails: {
      startDate: Date,
      endDate: Date,
      budget: Number,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      updates: [
        {
          message: String,
          date: {
            type: Date,
            default: Date.now,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for searching and filtering
suggestionSchema.index({ title: "text", description: "text", tags: "text" })
suggestionSchema.index({ barangay: 1, category: 1, status: 1 })
suggestionSchema.index({ createdAt: -1 })
suggestionSchema.index({ "votes.upvotes": -1 })

// Virtual for total votes
suggestionSchema.virtual("totalVotes").get(function () {
  return this.votes.upvotes - this.votes.downvotes
})

// Virtual for vote ratio
suggestionSchema.virtual("voteRatio").get(function () {
  const total = this.votes.upvotes + this.votes.downvotes
  return total > 0 ? (this.votes.upvotes / total) * 100 : 0
})

module.exports = mongoose.model("Suggestion", suggestionSchema)
