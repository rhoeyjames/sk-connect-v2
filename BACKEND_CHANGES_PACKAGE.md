# 📦 SKConnect Backend Changes - Forgot Password Feature

## 🚀 **Quick Deploy Option**: Use Git Integration
Since you have GitHub connected, you can:
1. **Push these changes** to your repo using the top-right button
2. **Create a PR** with all the backend changes
3. **Download the files** directly from GitHub
4. **Deploy to Railway** from your updated repo

---

## 📁 **Manual File Copy Option**

### **File 1: backend/models/User.js**
```javascript
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [15, "Must be at least 15 years old"],
      max: [30, "Must be 30 years old or younger"],
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
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^(\+63|0)[0-9]{10}$/, "Please enter a valid Philippine phone number"],
    },
    role: {
      type: String,
      enum: ["youth", "sk_official", "admin"],
      default: "youth",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex')
  
  // Hash and set reset token
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  
  // Set expiry time (10 minutes)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000
  
  return resetToken
}

// Check if reset token is valid
userSchema.methods.isResetTokenValid = function (token) {
  if (!this.resetPasswordToken || !this.resetPasswordExpires) {
    return false
  }
  
  // Hash the provided token and compare
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  
  // Check if token matches and hasn't expired
  return this.resetPasswordToken === hashedToken && this.resetPasswordExpires > Date.now()
}

// Clear reset token
userSchema.methods.clearResetToken = function () {
  this.resetPasswordToken = null
  this.resetPasswordExpires = null
}

// Remove password and reset token from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.resetPasswordToken
  delete user.resetPasswordExpires
  return user
}

module.exports = mongoose.model("User", userSchema)
```

---

### **File 2: backend/services/emailService.js** (NEW FILE)
```javascript
const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    this.transporter = null
    this.initializeTransporter()
  }

  initializeTransporter() {
    // Create transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use SMTP service (Gmail, SendGrid, etc.)
      this.transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
        }
      })
    } else {
      // Development: Use Ethereal for testing
      this.createTestAccount()
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount()
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
      console.log('✅ Test email account created:', testAccount.user)
    } catch (error) {
      console.error('❌ Failed to create test email account:', error.message)
    }
  }

  async sendPasswordResetEmail(email, firstName, resetToken) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const resetUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`
        : `http://localhost:3000/auth/reset-password?token=${resetToken}`

      const mailOptions = {
        from: {
          name: 'SKConnect',
          address: process.env.EMAIL_FROM || 'noreply@skconnect.com'
        },
        to: email,
        subject: 'Reset Your SKConnect Password',
        html: this.getPasswordResetTemplate(firstName, resetUrl),
        text: `
Hi ${firstName},

You requested to reset your password for your SKConnect account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The SKConnect Team
        `.trim()
      }

      const info = await this.transporter.sendMail(mailOptions)
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Password reset email sent!')
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  getPasswordResetTemplate(firstName, resetUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password - SKConnect</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>SKConnect - Youth Development Portal</p>
        </div>
        
        <div class="content">
            <h2>Hi ${firstName}!</h2>
            
            <p>You requested to reset your password for your SKConnect account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p><strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
            <p>This email was sent by SKConnect<br>
            Youth Development & SK Portal System</p>
            <p>📧 If you need help, contact our support team</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }
      await this.transporter.verify()
      console.log('✅ Email service connection verified')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message)
      return false
    }
  }
}

module.exports = new EmailService()
```

---

### **File 3: backend/package.json** (UPDATED)
```json
{
  "name": "skconnect-backend",
  "version": "1.0.0",
  "description": "SKConnect - Youth Development & SK Portal Backend",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "mongodb-memory-server": "^10.2.0",
    "nodemon": "^3.0.1"
  },
  "keywords": [
    "youth",
    "sk",
    "portal",
    "nodejs",
    "express",
    "mongodb"
  ],
  "author": "SKConnect Team",
  "license": "MIT"
}
```

---

### **File 4: backend/.env.example** (NEW FILE)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/skconnect
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skconnect

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=development
# NODE_ENV=production

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
# FRONTEND_URL=https://your-app-domain.com

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=noreply@skconnect.com

# Alternative email services:
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# For Gmail:
# 1. Enable 2-factor authentication
# 2. Generate an "App Password" for this application
# 3. Use the app password as EMAIL_PASSWORD

# For production, consider using:
# - SendGrid
# - Mailgun
# - Amazon SES
# - Other professional email services
```

---

### **File 5: backend/routes/auth.js** (UPDATED - Only new routes added)

**ADD THESE ROUTES** to your existing `backend/routes/auth.js` file:

```javascript
// ADD THESE IMPORTS at the top:
const crypto = require("crypto")
const emailService = require("../services/emailService")

// ADD THESE ROUTES before the final module.exports:

// Forgot password - Send reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Return success even if user doesn't exist (security practice)
      return res.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated" })
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Send reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email, 
      user.firstName, 
      resetToken
    )

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error)
      return res.status(500).json({ 
        message: "Failed to send reset email. Please try again later." 
      })
    }

    // Log for development
    if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
      console.log(`📧 Password reset email preview: ${emailResult.previewUrl}`)
    }

    res.json({ 
      message: "If an account with that email exists, we've sent a password reset link.",
      ...(process.env.NODE_ENV !== 'production' && emailResult.previewUrl && {
        previewUrl: emailResult.previewUrl
      })
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" })
    }

    // Hash the token to find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Update password and clear reset token
    user.password = password
    user.clearResetToken()
    await user.save()

    res.json({ message: "Password reset successful. You can now log in with your new password." })

  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      message: "Failed to reset password. Please try again.",
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Verify reset token (optional - for frontend to check if token is valid)
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Hash the token to find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ 
        valid: false, 
        message: "Invalid or expired reset token" 
      })
    }

    res.json({ 
      valid: true, 
      email: user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") // Partially hide email
    })

  } catch (error) {
    console.error("Verify reset token error:", error)
    res.status(500).json({
      valid: false,
      message: "Failed to verify token"
    })
  }
})
```

---

## 🚀 **Deployment Steps:**

1. **Copy these 5 files** to your Railway backend
2. **Install dependency**: `npm install nodemailer@^6.9.7`  
3. **Set environment variables** in Railway dashboard:
   - `EMAIL_SERVICE=gmail`
   - `EMAIL_USER=your-email@gmail.com`
   - `EMAIL_PASSWORD=your-app-password`
   - `FRONTEND_URL=https://your-domain.com`
4. **Restart your backend**

## 📧 **Gmail Setup:**
1. Enable 2FA on Gmail
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated password as `EMAIL_PASSWORD`

Your forgot password feature will be fully functional! 🎉
