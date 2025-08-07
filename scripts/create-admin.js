const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// User Schema (matching your backend model)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  barangay: { type: String, required: true },
  municipality: { type: String, default: "Sample Municipality" },
  province: { type: String, default: "Sample Province" },
  role: { type: String, enum: ["youth", "sk_official", "admin"], default: "youth" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

async function createAdminUser() {
  try {
    // Connect to MongoDB with database name
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://jamesrowi:jamesrhoey@mernapp.zomz5.mongodb.net/skconnect?retryWrites=true&w=majority&appName=MERNapp"

    console.log("Connecting to MongoDB...")
    await mongoose.connect(mongoUri)
    console.log("Connected to MongoDB successfully!")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@skconnect.com" })
    if (existingAdmin) {
      console.log("Admin user already exists!")
      console.log("Email: admin@skconnect.com")
      console.log("You can reset the password if needed.")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123456", 12)

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@skconnect.com",
      password: hashedPassword,
      age: 25,
      barangay: "Admin Barangay",
      municipality: "Admin Municipality",
      province: "Admin Province",
      role: "admin",
      isActive: true,
    })

    await adminUser.save()
    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@skconnect.com")
    console.log("🔑 Password: admin123456")
    console.log("⚠️  Please change the password after first login!")
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

createAdminUser()
