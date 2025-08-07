const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir

    // Create subdirectories based on file type
    if (file.fieldname === "profilePicture") {
      uploadPath = path.join(uploadsDir, "profiles")
    } else if (file.fieldname === "eventImage") {
      uploadPath = path.join(uploadsDir, "events")
    } else if (file.fieldname === "attachment") {
      uploadPath = path.join(uploadsDir, "attachments")
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + extension)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    profilePicture: /jpeg|jpg|png|gif/,
    eventImage: /jpeg|jpg|png|gif/,
    attachment: /jpeg|jpg|png|gif|pdf|doc|docx|txt/,
  }

  const filetypes = allowedTypes[file.fieldname] || /jpeg|jpg|png|gif|pdf|doc|docx|txt/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${filetypes.source}`))
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
})

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 5MB.",
      })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files uploaded.",
      })
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected file field.",
      })
    }
  }

  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: err.message,
    })
  }

  next(err)
}

module.exports = {
  upload,
  handleMulterError,
}
