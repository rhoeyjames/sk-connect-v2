const express = require("express")
const Registration = require("../models/Registration")
const Event = require("../models/Event")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register for an event
router.post("/", auth, async (req, res) => {
  try {
    const { eventId, emergencyContact, specialRequirements, notes } = req.body

    // Check if event exists
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if event is still accepting registrations
    if (!event.isRegistrationOpen) {
      return res.status(400).json({
        message: "Registration is closed for this event",
      })
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      user: req.user.userId,
      event: eventId,
    })

    if (existingRegistration) {
      return res.status(400).json({
        message: "You are already registered for this event",
      })
    }

    // Create registration
    const registration = new Registration({
      user: req.user.userId,
      event: eventId,
      emergencyContact,
      specialRequirements,
      notes,
      status: "pending",
    })

    await registration.save()

    // Update event participant count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentParticipants: 1 },
    })

    const populatedRegistration = await Registration.findById(registration._id)
      .populate("user", "firstName lastName email phoneNumber")
      .populate("event", "title date time location")

    res.status(201).json({
      message: "Registration successful",
      registration: populatedRegistration,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(400).json({
      message: "Registration failed",
      error: error.message,
    })
  }
})

// Get user's registrations
router.get("/my-registrations", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter = { user: req.user.userId }
    if (status) filter.status = status

    const registrations = await Registration.find(filter)
      .populate(
        "event",
        "title description date time location category status maxParticipants currentParticipants image",
      )
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Registration.countDocuments(filter)

    res.json({
      registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get registrations error:", error)
    res.status(500).json({
      message: "Failed to fetch registrations",
      error: error.message,
    })
  }
})

// Get registrations for an event
router.get("/event/:eventId", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    // Check if user has permission to view registrations
    const event = await Event.findById(req.params.eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    if (event.organizer.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view registrations for this event",
      })
    }

    const filter = { event: req.params.eventId }
    if (status) filter.status = status

    const registrations = await Registration.find(filter)
      .populate("user", "firstName lastName email phoneNumber age barangay municipality province")
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Registration.countDocuments(filter)

    res.json({
      registrations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get event registrations error:", error)
    res.status(500).json({
      message: "Failed to fetch event registrations",
      error: error.message,
    })
  }
})

// Update registration status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "cancelled", "attended", "no_show"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const registration = await Registration.findById(req.params.id).populate("event")

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Check permissions
    const canUpdate =
      registration.user.toString() === req.user.userId || // User can cancel their own registration
      registration.event.organizer.toString() === req.user.userId || // Organizer can update
      req.user.role === "admin" // Admin can update

    if (!canUpdate) {
      return res.status(403).json({
        message: "Not authorized to update this registration",
      })
    }

    // Handle participant count changes
    const oldStatus = registration.status
    const newStatus = status

    if (oldStatus !== "cancelled" && newStatus === "cancelled") {
      // Decrease participant count when cancelling
      await Event.findByIdAndUpdate(registration.event._id, {
        $inc: { currentParticipants: -1 },
      })
    } else if (oldStatus === "cancelled" && newStatus !== "cancelled") {
      // Increase participant count when un-cancelling
      await Event.findByIdAndUpdate(registration.event._id, {
        $inc: { currentParticipants: 1 },
      })
    }

    // Mark attendance time if status is 'attended'
    const updateData = { status }
    if (status === "attended") {
      updateData.attendanceMarked = true
      updateData.attendanceTime = new Date()
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("user", "firstName lastName email")
      .populate("event", "title date time location")

    res.json({
      message: "Registration status updated successfully",
      registration: updatedRegistration,
    })
  } catch (error) {
    console.error("Update registration status error:", error)
    res.status(400).json({
      message: "Failed to update registration status",
      error: error.message,
    })
  }
})

// Cancel registration
router.delete("/:id", auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized to cancel this registration",
      })
    }

    // Update status to cancelled instead of deleting
    registration.status = "cancelled"
    await registration.save()

    // Decrease participant count
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { currentParticipants: -1 },
    })

    res.json({ message: "Registration cancelled successfully" })
  } catch (error) {
    console.error("Cancel registration error:", error)
    res.status(500).json({
      message: "Failed to cancel registration",
      error: error.message,
    })
  }
})

// Submit feedback for attended event
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body

    const registration = await Registration.findById(req.params.id)

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized to submit feedback for this registration",
      })
    }

    // Check if user attended the event
    if (registration.status !== "attended") {
      return res.status(400).json({
        message: "Can only submit feedback for attended events",
      })
    }

    // Update registration with feedback
    registration.feedback = {
      rating,
      comment,
      submittedAt: new Date(),
    }

    await registration.save()

    res.json({
      message: "Feedback submitted successfully",
      feedback: registration.feedback,
    })
  } catch (error) {
    console.error("Submit feedback error:", error)
    res.status(400).json({
      message: "Failed to submit feedback",
      error: error.message,
    })
  }
})

module.exports = router
