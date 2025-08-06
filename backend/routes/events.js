const express = require("express")
const Event = require("../models/Event")
const Registration = require("../models/Registration")
const { auth, skOfficialAuth } = require("../middleware/auth")
const { upload, handleMulterError } = require("../middleware/upload")
const User = require("../models/User") // Import User model

const router = express.Router()

// Get all events with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      barangay,
      municipality,
      province,
      status = "upcoming",
      search,
      sortBy = "date",
      sortOrder = "asc",
    } = req.query

    // Build filter object
    const filter = {}
    if (category) filter.category = category
    if (barangay) filter.barangay = new RegExp(barangay, "i")
    if (municipality) filter.municipality = new RegExp(municipality, "i")
    if (province) filter.province = new RegExp(province, "i")
    if (status) filter.status = status

    // Add search functionality
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const events = await Event.find(filter)
      .populate("organizer", "firstName lastName email role")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await Event.countDocuments(filter)

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    })
  }
})

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "firstName lastName email role profilePicture",
    )

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({ event })
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({
      message: "Failed to fetch event",
      error: error.message,
    })
  }
})

// Create event (admin only)
router.post("/", auth, skOfficialAuth, upload.single("eventImage"), handleMulterError, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user.userId,
    }

    // Add image path if uploaded
    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`
    }

    // Combine date and time into a proper Date object
    if (eventData.date && eventData.time) {
      eventData.date = new Date(eventData.date + "T" + eventData.time)
    }

    // Handle registration deadline
    if (eventData.registrationDeadline && eventData.registrationDeadlineTime) {
      eventData.registrationDeadline = new Date(eventData.registrationDeadline + "T" + eventData.registrationDeadlineTime)
    }

    // Parse arrays if they come as strings
    if (typeof eventData.requirements === "string") {
      eventData.requirements = JSON.parse(eventData.requirements)
    }
    if (typeof eventData.tags === "string") {
      eventData.tags = JSON.parse(eventData.tags)
    }

    const event = new Event(eventData)
    await event.save()

    const populatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName email role")

    res.status(201).json({
      message: "Event created successfully",
      event: populatedEvent,
    })
  } catch (error) {
    console.error("Create event error:", error)

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = {}
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message
      })

      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        details: error.message,
      })
    }

    res.status(400).json({
      message: "Failed to create event",
      error: error.message,
    })
  }
})

// Update event
router.put("/:id", auth, skOfficialAuth, upload.single("eventImage"), handleMulterError, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is organizer or admin
    const user = await User.findById(req.user.userId)
    if (event.organizer.toString() !== req.user.userId && user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" })
    }

    const updateData = { ...req.body }

    // Add image path if uploaded
    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`
    }

    // Combine date and time into a proper Date object
    if (updateData.date && updateData.time) {
      updateData.date = new Date(updateData.date + "T" + updateData.time)
    }

    // Handle registration deadline
    if (updateData.registrationDeadline && updateData.registrationDeadlineTime) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline + "T" + updateData.registrationDeadlineTime)
    }

    // Parse arrays if they come as strings
    if (typeof updateData.requirements === "string") {
      updateData.requirements = JSON.parse(updateData.requirements)
    }
    if (typeof updateData.tags === "string") {
      updateData.tags = JSON.parse(updateData.tags)
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("organizer", "firstName lastName email role")

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    })
  } catch (error) {
    console.error("Update event error:", error)
    res.status(400).json({
      message: "Failed to update event",
      error: error.message,
    })
  }
})

// Delete event
router.delete("/:id", auth, skOfficialAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is organizer or admin
    const user = await User.findById(req.user.userId)
    if (event.organizer.toString() !== req.user.userId && user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this event" })
    }

    // Check if event has registrations
    const registrationCount = await Registration.countDocuments({ event: req.params.id })
    if (registrationCount > 0) {
      return res.status(400).json({
        message: "Cannot delete event with existing registrations. Cancel the event instead.",
      })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    })
  }
})

// Get events by organizer
router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.params.organizerId })
      .populate("organizer", "firstName lastName email role")
      .sort({ createdAt: -1 })

    res.json({ events })
  } catch (error) {
    console.error("Get organizer events error:", error)
    res.status(500).json({
      message: "Failed to fetch organizer events",
      error: error.message,
    })
  }
})

// Get event statistics
router.get("/:id/stats", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    const registrations = await Registration.find({ event: req.params.id })

    const stats = {
      totalRegistrations: registrations.length,
      confirmedRegistrations: registrations.filter((r) => r.status === "confirmed").length,
      pendingRegistrations: registrations.filter((r) => r.status === "pending").length,
      cancelledRegistrations: registrations.filter((r) => r.status === "cancelled").length,
      attendedCount: registrations.filter((r) => r.status === "attended").length,
      noShowCount: registrations.filter((r) => r.status === "no_show").length,
      spotsRemaining: event.maxParticipants - event.currentParticipants,
      registrationRate: event.maxParticipants > 0 ? (event.currentParticipants / event.maxParticipants) * 100 : 0,
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get event stats error:", error)
    res.status(500).json({
      message: "Failed to fetch event statistics",
      error: error.message,
    })
  }
})

module.exports = router
