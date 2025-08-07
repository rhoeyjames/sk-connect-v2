# SKConnect Portal

**SKConnect** is a comprehensive Youth Development & Sangguniang Kabataan (SK) Portal built with modern web technologies. It provides a platform for youth engagement, event management, project suggestions, and community feedback.

## 🎯 Project Overview

SKConnect bridges the gap between youth and local government by providing:
- **Event Management** - Create and manage community events
- **Online Registration** - Streamlined event registration process
- **Project Suggestions** - Community-driven project ideas
- **Voting System** - Democratic decision making
- **Feedback Collection** - Event ratings and comments
- **Admin Dashboard** - Comprehensive analytics and management

## 🏗️ Project Structure

\`\`\`
skconnect/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File storage
│   └── server.js           # Main server file
├── app/                    # Next.js frontend pages
├── components/             # React components
├── lib/                    # Utility functions
└── public/                 # Static assets
\`\`\`

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Data visualization
- **React Hook Form** - Form handling

## 👥 User Roles

### Youth (Users)
- Register and login
- View and join events
- Submit project suggestions
- Vote on community projects
- Provide event feedback
- Track registration status

### SK Admin
- Full event management (CRUD)
- Approve/reject registrations
- Review project suggestions
- View analytics dashboard
- Export registration data
- Manage user accounts

## ✅ Core Features

### 1. Event Management
- Create events with images, dates, venues
- Set participant limits
- Track registrations
- Event categorization (workshop, seminar, sports, etc.)

### 2. Registration System
- Online event registration
- File upload (ID, waivers)
- Status tracking (pending, approved, rejected)
- Admin approval workflow

### 3. Project Suggestions
- Submit community project ideas
- File attachments support
- Admin review and comments
- Status management

### 4. Voting & Feedback
- Vote on project suggestions
- Rate events (1-5 stars)
- Anonymous feedback option
- Analytics and reporting

### 5. Admin Dashboard
- User statistics
- Event analytics
- Registration management
- Export functionality

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/your-username/skconnect.git
cd skconnect
\`\`\`

### 2. Backend Setup
\`\`\`bash
# Install backend dependencies
npm run backend:install

# Configure environment
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm run backend
\`\`\`

### 3. Frontend Setup
\`\`\`bash
# Install frontend dependencies (from root)
npm install

# Start frontend development server
npm run dev
\`\`\`

### 4. Database Setup
Make sure MongoDB is running and accessible via the connection string in your `.env` file.

## 📱 Mobile Responsive

SKConnect is built with a mobile-first approach:
- Responsive navigation
- Touch-friendly interfaces
- Optimized for mobile devices
- Works great in Termux environment

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Server-side validation with express-validator
- **File Upload Security** - Type and size restrictions
- **Role-based Access Control** - Protected admin routes

## 📊 Database Schema

### Collections
- **users** - User accounts and profiles
- **events** - Event information and details
- **registrations** - Event registrations with status
- **suggestions** - Community project suggestions
- **votes** - User votes on suggestions
- **feedbacks** - Event ratings and comments

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the Next.js application
2. Deploy to Vercel, Netlify, or similar platform
3. Configure API endpoints

## 📝 API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth`)
- Events (`/api/events`)
- Registrations (`/api/registrations`)
- Suggestions (`/api/suggestions`)
- Feedback (`/api/feedback`)
- Admin (`/api/admin`)

See `backend/README.md` for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Filipino youth and SK communities
- Inspired by the need for better youth engagement platforms
- Thanks to all contributors and supporters

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**SKConnect** - Empowering Youth, Building Communities 🇵🇭
