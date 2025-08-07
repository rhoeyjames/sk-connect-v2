# SKConnect Backend

This is the backend API for the SKConnect Youth Development & Sangguniang Kabataan (SK) Portal.

## Features

- **Authentication System** with JWT
- **User Management** (Youth and SK Admin roles)
- **Event Management** (CRUD operations)
- **Registration System** with file uploads
- **Project Suggestion System** with voting
- **Feedback System** with ratings
- **Admin Dashboard** with analytics
- **File Upload** handling with Multer
- **Input Validation** with express-validator

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Run the Server**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/my-registrations` - Get user's registrations
- `GET /api/registrations/event/:eventId` - Get event registrations (admin)
- `PUT /api/registrations/:id/status` - Update registration status (admin)

### Suggestions
- `POST /api/suggestions` - Create suggestion
- `GET /api/suggestions` - Get all suggestions
- `GET /api/suggestions/:id` - Get single suggestion
- `POST /api/suggestions/:id/vote` - Vote on suggestion
- `PUT /api/suggestions/:id/status` - Update suggestion status (admin)
- `GET /api/suggestions/:id/vote-status` - Check if user voted

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/event/:eventId` - Get event feedback
- `GET /api/feedback/event/:eventId/stats` - Get feedback statistics

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/registrations` - Get all registrations
- `GET /api/admin/export/registrations/:eventId` - Export registrations to CSV

## Database Collections

### Users
- `name` - User's full name
- `email` - Email address (unique)
- `password` - Hashed password
- `age` - User's age (13-30)
- `barangay` - User's barangay
- `role` - user/admin
- `isActive` - Account status

### Events
- `title` - Event title
- `description` - Event description
- `date` - Event date
- `time` - Event time
- `type` - Event category
- `image` - Event poster image
- `venue` - Event location
- `maxParticipants` - Maximum participants
- `createdBy` - Admin who created the event
- `isActive` - Event status

### Registrations
- `userId` - Reference to User
- `eventId` - Reference to Event
- `status` - pending/approved/rejected
- `contactNumber` - User's contact
- `uploadedFiles` - Array of uploaded files
- `adminNotes` - Admin comments

### Suggestions
- `userId` - Reference to User
- `title` - Suggestion title
- `description` - Suggestion description
- `attachments` - Array of attached files
- `status` - pending/approved/rejected/under-review
- `adminComments` - Admin feedback
- `votes` - Vote count

### Votes
- `suggestionId` - Reference to Suggestion
- `userId` - Reference to User

### Feedback
- `eventId` - Reference to Event
- `userId` - Reference to User
- `rating` - 1-5 star rating
- `comment` - Feedback comment
- `anonymous` - Anonymous feedback flag

## File Upload Structure

\`\`\`
uploads/
├── events/          # Event poster images
├── registrations/   # Registration documents
└── suggestions/     # Suggestion attachments
\`\`\`

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - express-validator for data validation
- **File Upload Security** - File type and size restrictions
- **Role-based Access** - Admin-only endpoints protection

## Error Handling

The API returns consistent error responses:

\`\`\`json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
\`\`\`

## Development

1. **Code Structure**
   - `models/` - Database schemas
   - `routes/` - API endpoints
   - `middleware/` - Custom middleware
   - `uploads/` - File storage

2. **Adding New Features**
   - Create model in `models/`
   - Add routes in `routes/`
   - Update server.js if needed
   - Test endpoints

3. **Database Seeding**
   Create sample data for testing:
   \`\`\`bash
   # Add seeding script if needed
   npm run seed
   \`\`\`

## Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB connection
   - Set secure JWT secret

2. **Build and Deploy**
   \`\`\`bash
   npm install --production
   npm start
   \`\`\`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details.
\`\`\`

Now let's update the main package.json to focus on the frontend and update the README:

\`\`\`typescriptreact file="package.json"
[v0-no-op-code-block-prefix]{
  "name": "skconnect-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start",
    "backend": "cd backend && npm run dev",
    "backend:install": "cd backend && npm install"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.25",
    "next-themes": "^0.4.6",
    "react": "^19",
    "react-day-picker": "9.8.0",
    "react-dom": "^19",
    "react-hook-form": "^7.60.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "3.25.67",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.9",
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8.5",
    "tailwindcss": "^4.1.9",
    "tw-animate-css": "1.3.3",
    "typescript": "^5"
  }
}
