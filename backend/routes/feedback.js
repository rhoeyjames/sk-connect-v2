const express = require("express")
const Feedback = require("../models/Feedback")
const Event = require("../models/Event")
const Registration = require("../models/Registration")
const { auth, adminAuth } = require("../middleware/auth")
const { upload, handleMulterError } = require("../middleware/upload")
const User = require("../models/User") // Import User model
const mongoose = require("mongoose") // Import mongoose

const router = express.Router()

// Submit feedback
router.post("/", auth, upload.array("attachments", 3), handleMulterError, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      author: req.body.isAnonymous === "true" ? null : req.user.userId,
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      feedbackData.attachments = req.files.map((file) => ({
        filename: `/uploads/attachments/${file.filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }))
    }

    const feedback = new Feedback(feedbackData)
    await feedback.save()

    const populatedFeedback = await Feedback.findById(feedback._id).populate("author", "firstName lastName email")

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: populatedFeedback,
    })
  } catch (error) {
    console.error("Submit feedback error:", error)
    res.status(400).json({
      message: "Failed to submit feedback",
      error: error.message,
    })
  }
})

// Get all feedback (admin only)
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, priority, category, search } = req.query

    // Build filter object
    const filter = {}
    if (type) filter.type = type
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (category) filter.category = category

    // Add search functionality
    if (search) {
      filter.$text = { $search: search }
    }

    const feedback = await Feedback.find(filter)
      .populate("author", "firstName lastName email")
      .populate("adminResponse.respondedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Feedback.countDocuments(filter)

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get feedback error:", error)
    res.status(500).json({
      message: "Failed to fetch feedback",
      error: error.message,
    })
  }
})

// Get single feedback by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("author", "firstName lastName email profilePicture")
      .populate("adminResponse.respondedBy", "firstName lastName role")
      .populate("resolvedBy", "firstName lastName role")

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" })
    }

    // Check if user has permission to view this feedback
    const canView = req.user.role === "admin" || (feedback.author && feedback.author._id.toString() === req.user.userId)

    if (!canView) {
      return res.status(403).json({ message: "Not authorized to view this feedback" })
    }

    res.json({ feedback })
  } catch (error) {
    console.error("Get feedback error:", error)
    res.status(500).json({
      message: "Failed to fetch feedback",
      error: error.message,
    })
  }
})

// Get user's feedback
router.get("/my-feedback", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const filter = { author: req.user.userId }
    if (status) filter.status = status

    const feedback = await Feedback.find(filter)
      .populate("adminResponse.respondedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Feedback.countDocuments(filter)

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get user feedback error:", error)
    res.status(500).json({
      message: "Failed to fetch user feedback",
      error: error.message,
    })
  }
})

// Update feedback status (admin only)
router.put("/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body
    const validStatuses = ["open", "in_progress", "resolved", "closed"]

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

    if (status === "resolved") {
      updateData.resolved = true
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = req.user.userId
    }

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate("author", "firstName lastName email")
      .populate("adminResponse.respondedBy", "firstName lastName")

    res.json({
      message: "Feedback status updated successfully",
      feedback,
    })
  } catch (error) {
    console.error("Update feedback status error:", error)
    res.status(400).json({
      message: "Failed to update feedback status",
      error: error.message,
    })
  }
})

// Delete feedback (admin only)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id)

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" })
    }

    res.json({ message: "Feedback deleted successfully" })
  } catch (error) {
    console.error("Delete feedback error:", error)
    res.status(500).json({
      message: "Failed to delete feedback",
      error: error.message,
    })
  }
})

module.exports = router
