# 🔐 Forgot Password Feature - Deployment Guide

## 📋 **Files to Copy to Your Deployed Backend**

### **1. Backend Files (Copy these to your Railway deployment):**

#### **Core Files:**
```
backend/models/User.js                    ← Updated with reset token fields
backend/routes/auth.js                    ← Added password reset endpoints  
backend/services/emailService.js         ← NEW: Email service module
backend/package.json                      ← Updated with nodemailer dependency
backend/.env.example                      ← NEW: Environment variables guide
```

#### **New Dependencies to Install:**
```bash
cd backend
npm install nodemailer@^6.9.7
```

### **2. Frontend Files (Already implemented locally):**
```
app/auth/forgot-password/forgot-password-form.tsx    ← Updated to use real API
app/auth/reset-password/page.tsx                     ← NEW: Reset password page
app/auth/reset-password/reset-password-form.tsx      ← NEW: Reset form component
app/api/auth/forgot-password/route.ts                ← NEW: Frontend API proxy
app/api/auth/reset-password/route.ts                 ← NEW: Frontend API proxy  
app/api/auth/verify-reset-token/[token]/route.ts     ← NEW: Token verification API
```

---

## 🔧 **Backend Deployment Steps**

### **Step 1: Copy Updated Files**
1. Copy `backend/models/User.js` to your deployed backend
2. Copy `backend/routes/auth.js` to your deployed backend  
3. Copy `backend/services/emailService.js` to your deployed backend (NEW FILE)
4. Copy `backend/package.json` to your deployed backend

### **Step 2: Install Dependencies**
```bash
# In your deployed backend directory:
npm install nodemailer@^6.9.7
```

### **Step 3: Environment Variables**
Add these to your Railway environment variables:

```bash
# Email Configuration (Required)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com  
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@skconnect.com

# Frontend URL (Required for reset links)
FRONTEND_URL=https://your-frontend-domain.com

# Optional (already set)
NODE_ENV=production
```

### **Step 4: Restart Backend**
- Railway will auto-restart when you push changes
- Or manually restart via Railway dashboard

---

## 📧 **Email Service Setup**

### **Option A: Gmail (Recommended for testing)**
1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Set Environment Variables**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=generated-app-password
   ```

### **Option B: Professional Email Service (Production)**
- **SendGrid**: Set `EMAIL_SERVICE=sendgrid` + API key
- **Mailgun**: Set appropriate SMTP settings
- **Amazon SES**: Configure AWS credentials

---

## 🚀 **New API Endpoints Added**

Your backend will now have these new endpoints:

```bash
POST /api/auth/forgot-password      # Send reset email
POST /api/auth/reset-password       # Reset password with token  
GET  /api/auth/verify-reset-token/:token  # Verify token validity
```

---

## ✅ **Testing the Feature**

### **1. Test Forgot Password:**
1. Go to `/auth/forgot-password`
2. Enter email address
3. Check email for reset link (or console for preview URL in dev)

### **2. Test Password Reset:**
1. Click reset link from email
2. Enter new password
3. Confirm and submit
4. Should redirect to login

### **3. Development Mode:**
- Email preview URLs will be logged to console
- Uses Ethereal Email for testing

---

## 🔒 **Security Features**

✅ **Token Security:**
- Tokens are hashed before storage
- 10-minute expiration time
- One-time use (cleared after reset)

✅ **User Privacy:**
- Same response for valid/invalid emails
- Email partially hidden in reset form

✅ **Validation:**
- Password strength requirements
- Token verification before reset
- Secure token generation

---

## 📝 **Summary**

**Backend Changes:**
- ✅ User model: Added reset token fields + methods
- ✅ Auth routes: Added 3 new password reset endpoints
- ✅ Email service: Complete email system with templates
- ✅ Dependencies: Added nodemailer

**Frontend Changes:**  
- ✅ Real API integration (no more simulation)
- ✅ Complete reset password flow
- ✅ Token verification and validation
- ✅ Professional UI with password strength indicators

**Deployment:**
- 📁 Copy 4 backend files
- 📦 Install nodemailer dependency  
- ⚙️ Set 4 environment variables
- 🔄 Restart backend service

The forgot password feature is now **fully functional** and ready for production! 🎉
