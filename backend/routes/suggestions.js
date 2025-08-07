const express = require("express")
const Suggestion = require("../models/Suggestion")
const Vote = require("../models/Vote")
const { auth, adminAuth } = require("../middleware/auth")
const { upload, handleMulterError } = require("../middleware/upload")

const router = express.Router()

// Get all suggestions with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      barangay,
      municipality,
      province,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    // Build filter object
    const filter = {}
    if (category) filter.category = category
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (barangay) filter.barangay = new RegExp(barangay, "i")
    if (municipality) filter.municipality = new RegExp(municipality, "i")
    if (province) filter.province = new RegExp(province, "i")

    // Add search functionality
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    if (sortBy === "votes") {
      sort["votes.upvotes"] = sortOrder === "desc" ? -1 : 1
    } else {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1
    }

    const suggestions = await Suggestion.find(filter)
      .populate("author", "firstName lastName barangay municipality province")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await Suggestion.countDocuments(filter)

    res.json({
      suggestions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get suggestions error:", error)
    res.status(500).json({
      message: "Failed to fetch suggestions",
      error: error.message,
    })
  }
})

// Get single suggestion
router.get("/:id", async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id)
      .populate("author", "firstName lastName barangay municipality province profilePicture")
      .populate("adminResponse.respondedBy", "firstName lastName role")
      .populate("implementationDetails.assignedTo", "firstName lastName role")
      .populate("implementationDetails.updates.updatedBy", "firstName lastName role")

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    res.json({ suggestion })
  } catch (error) {
    console.error("Get suggestion error:", error)
    res.status(500).json({
      message: "Failed to fetch suggestion",
      error: error.message,
    })
  }
})

// Create suggestion
router.post("/", auth, upload.array("attachments", 5), handleMulterError, async (req, res) => {
  try {
    const suggestionData = {
      ...req.body,
      author: req.body.isAnonymous === "true" ? null : req.user.userId,
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      suggestionData.attachments = req.files.map((file) => ({
        filename: `/uploads/attachments/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }))
    }

    // Parse arrays if they come as strings
    if (typeof suggestionData.tags === "string") {
      suggestionData.tags = JSON.parse(suggestionData.tags)
    }

    const suggestion = new Suggestion(suggestionData)
    await suggestion.save()

    const populatedSuggestion = await Suggestion.findById(suggestion._id).populate(
      "author",
      "firstName lastName barangay municipality province",
    )

    res.status(201).json({
      message: "Suggestion submitted successfully",
      suggestion: populatedSuggestion,
    })
  } catch (error) {
    console.error("Create suggestion error:", error)
    res.status(400).json({
      message: "Failed to submit suggestion",
      error: error.message,
    })
  }
})

// Update suggestion (author only, before admin review)
router.put("/:id", auth, upload.array("attachments", 5), handleMulterError, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id)

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user is the author
    if (suggestion.author && suggestion.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this suggestion" })
    }

    // Check if suggestion is still editable
    if (suggestion.status !== "pending") {
      return res.status(400).json({
        message: "Cannot edit suggestion after admin review has started",
      })
    }

    const updateData = { ...req.body }

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        filename: `/uploads/attachments/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }))

      updateData.attachments = [...(suggestion.attachments || []), ...newAttachments]
    }

    // Parse arrays if they come as strings
    if (typeof updateData.tags === "string") {
      updateData.tags = JSON.parse(updateData.tags)
    }

    const updatedSuggestion = await Suggestion.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "firstName lastName barangay municipality province")

    res.json({
      message: "Suggestion updated successfully",
      suggestion: updatedSuggestion,
    })
  } catch (error) {
    console.error("Update suggestion error:", error)
    res.status(400).json({
      message: "Failed to update suggestion",
      error: error.message,
    })
  }
})

// Vote on suggestion
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { voteType } = req.body // 'upvote' or 'downvote'

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" })
    }

    const suggestion = await Suggestion.findById(req.params.id)
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user.userId,
      suggestion: req.params.id,
    })

    if (existingVote) {
      // Update existing vote if different
      if (existingVote.voteType !== voteType) {
        // Remove old vote count
        if (existingVote.voteType === "upvote") {
          suggestion.votes.upvotes -= 1
        } else {
          suggestion.votes.downvotes -= 1
        }

        // Add new vote count
        if (voteType === "upvote") {
          suggestion.votes.upvotes += 1
        } else {
          suggestion.votes.downvotes += 1
        }

        existingVote.voteType = voteType
        await existingVote.save()
      } else {
        return res.status(400).json({ message: "You have already voted this way" })
      }
    } else {
      // Create new vote
      const vote = new Vote({
        user: req.user.userId,
        suggestion: req.params.id,
        voteType,
      })
      await vote.save()

      // Update suggestion vote count
      if (voteType === "upvote") {
        suggestion.votes.upvotes += 1
      } else {
        suggestion.votes.downvotes += 1
      }
    }

    await suggestion.save()

    res.json({
      message: "Vote recorded successfully",
      votes: suggestion.votes,
    })
  } catch (error) {
    console.error("Vote error:", error)
    res.status(400).json({
      message: "Failed to record vote",
      error: error.message,
    })
  }
})

// Remove vote
router.delete("/:id/vote", auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      user: req.user.userId,
      suggestion: req.params.id,
    })

    if (!vote) {
      return res.status(404).json({ message: "Vote not found" })
    }

    const suggestion = await Suggestion.findById(req.params.id)
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    // Remove vote count
    if (vote.voteType === "upvote") {
      suggestion.votes.upvotes -= 1
    } else {
      suggestion.votes.downvotes -= 1
    }

    await suggestion.save()
    await Vote.findByIdAndDelete(vote._id)

    res.json({
      message: "Vote removed successfully",
      votes: suggestion.votes,
    })
  } catch (error) {
    console.error("Remove vote error:", error)
    res.status(500).json({
      message: "Failed to remove vote",
      error: error.message,
    })
  }
})

// Get user's vote for a suggestion
router.get("/:id/my-vote", auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      user: req.user.userId,
      suggestion: req.params.id,
    })

    res.json({ vote: vote ? vote.voteType : null })
  } catch (error) {
    console.error("Get user vote error:", error)
    res.status(500).json({
      message: "Failed to fetch user vote",
      error: error.message,
    })
  }
})

// Admin: Update suggestion status
router.put("/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body
    const validStatuses = ["pending", "under_review", "approved", "rejected", "implemented"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updateData = { status }

    if (adminResponse) {
      updateData.adminResponse = {
        message: adminResponse,
        respondedBy: req.user.userId,
        respondedAt: new Date(),
      }
    }

    const suggestion = await Suggestion.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate("author", "firstName lastName barangay municipality province")
      .populate("adminResponse.respondedBy", "firstName lastName role")

    res.json({
      message: "Suggestion status updated successfully",
      suggestion,
    })
  } catch (error) {
    console.error("Update suggestion status error:", error)
    res.status(400).json({
      message: "Failed to update suggestion status",
      error: error.message,
    })
  }
})

// Admin: Add implementation details
router.put("/:id/implementation", auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, budget, assignedTo, progress } = req.body

    const suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      {
        implementationDetails: {
          startDate,
          endDate,
          budget,
          assignedTo,
          progress: progress || 0,
        },
      },
      { new: true, runValidators: true },
    ).populate("implementationDetails.assignedTo", "firstName lastName role")

    res.json({
      message: "Implementation details added successfully",
      suggestion,
    })
  } catch (error) {
    console.error("Add implementation details error:", error)
    res.status(400).json({
      message: "Failed to add implementation details",
      error: error.message,
    })
  }
})

// Admin: Add implementation update
router.post("/:id/implementation/update", auth, adminAuth, async (req, res) => {
  try {
    const { message, progress } = req.body

    const suggestion = await Suggestion.findById(req.params.id)
    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" })
    }

    if (!suggestion.implementationDetails) {
      return res.status(400).json({
        message: "Implementation details must be added first",
      })
    }

    const update = {
      message,
      date: new Date(),
      updatedBy: req.user.userId,
    }

    suggestion.implementationDetails.updates.push(update)

    if (progress !== undefined) {
      suggestion.implementationDetails.progress = progress
    }

    await suggestion.save()

    const populatedSuggestion = await Suggestion.findById(suggestion._id).populate(
      "implementationDetails.updates.updatedBy",
      "firstName lastName role",
    )

    res.json({
      message: "Implementation update added successfully",
      suggestion: populatedSuggestion,
    })
  } catch (error) {
    console.error("Add implementation update error:", error)
    res.status(400).json({
      message: "Failed to add implementation update",
      error: error.message,
    })
  }
})

// Get suggestions by user
router.get("/user/:userId", async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ author: req.params.userId }).sort({ createdAt: -1 })

    res.json({ suggestions })
  } catch (error) {
    console.error("Get user suggestions error:", error)
    res.status(500).json({
      message: "Failed to fetch user suggestions",
      error: error.message,
    })
  }
})

module.exports = router
