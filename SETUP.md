# Property Management Suite - Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb property_management

# Or using psql
psql -c "CREATE DATABASE property_management;"
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run build
npm run migrate  # Run database migrations
npm run dev      # Start backend server (port 5000)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start       # Start frontend server (port 3000)
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📁 Project Structure

```
propertyManagementAPP/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── database/        # Database setup
│   ├── dist/                # Compiled TypeScript
│   └── uploads/             # File storage
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── public/
└── docs/                    # Documentation
```

## 🔐 Authentication

The application uses JWT-based authentication with role-based access control:

- **Landlord**: Full access to all properties and features
- **Property Manager**: Manage properties assigned to them
- **Tenant**: Access to their own leases and payments
- **Agent**: Limited access for showing properties

## 🗄️ Database Schema

The application includes 12 main tables:
- `users` - User authentication and profiles
- `properties` - Property information
- `units` - Individual rental units
- `tenants` - Tenant information and screening
- `leases` - Lease agreements and terms
- `rent_payments` - Payment tracking
- `maintenance_requests` - Maintenance tracking
- `expenses` - Property expenses
- `documents` - File storage
- `notifications` - User notifications
- `audit_trail` - Activity logging

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev      # Development mode with hot reload
npm run build    # Compile TypeScript
npm test         # Run tests
```

### Frontend Development
```bash
cd frontend
npm start       # Development server
npm run build   # Production build
npm test         # Run tests
```

### Database Migrations
```bash
cd backend
npm run migrate  # Run all migrations
npm run seed     # Seed with sample data (optional)
```

## 🌟 Features

### ✅ Completed
- User authentication with JWT
- Role-based access control
- Database schema design
- Modern UI with React + TypeScript
- API endpoints structure
- File upload system

### 🚧 In Progress
- Property management module
- Tenant management system
- Lease management with e-signatures
- Payment tracking
- Maintenance requests

### 📋 Planned
- Financial dashboard
- Reporting system
- Email notifications
- Mobile responsiveness
- Advanced search and filtering

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/property_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Property Endpoints
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

## 🚀 Deployment

### Zeabur Deployment
1. Connect your GitHub repository
2. Set environment variables
3. Deploy both backend and frontend services
4. Configure database (PostgreSQL add-on)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue on GitHub

---

**Built with ❤️ using modern web technologies**
