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
      this.transporter = nodemailer.createTransport({
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
      this.transporter = nodemailer.createTransport({
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
