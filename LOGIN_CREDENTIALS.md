# SKConnect Login Credentials

## Backend Connected ✅
Your frontend is now connected to your deployed backend:
**Backend URL**: https://sk-connect-backend-production.up.railway.app

## How to Login
Use the existing accounts in your backend database, or register new accounts through the registration form.

### If you have existing accounts:
Use your existing email and password from your backend database.

### If you need to create accounts:
1. Go to the registration page
2. Fill out the registration form
3. Your account will be created in your MongoDB database
4. Login with your new credentials

### Admin Setup (if needed):
If you need to create an admin account, you can use the admin promotion endpoint or create one directly in your database.

## Backend Features
- **Authentication**: Login/Register with JWT tokens
- **User Management**: Admin can manage users and roles
- **Event Management**: Create and manage events
- **Registration System**: Users can register for events
- **Database**: All data stored in your MongoDB database

---

**Note**: Since you're using your deployed backend, all authentication and data management goes through your Railway deployment. Check your backend logs if you encounter any issues.
