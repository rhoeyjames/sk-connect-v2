const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select("-password")
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token or user deactivated." })
    }

    req.user = decoded
    req.userDoc = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Invalid token." })
  }
}

// Admin authorization middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." })
  }
  next()
}

// SK Official authorization middleware
const skOfficialAuth = (req, res, next) => {
  if (req.user.role !== "sk_official" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. SK Official privileges required." })
  }
  next()
}

module.exports = { auth, adminAuth, skOfficialAuth }
