const mongoose = require("mongoose")

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    suggestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suggestion",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate votes
voteSchema.index({ user: 1, suggestion: 1 }, { unique: true })

// Index for queries
voteSchema.index({ suggestion: 1, voteType: 1 })
voteSchema.index({ user: 1, votedAt: -1 })

module.exports = mongoose.model("Vote", voteSchema)
