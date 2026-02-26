# Property Management Suite

A comprehensive property management application for landlords, property managers, tenants, and real estate agents.

## Features

- 🏘️ Property & Unit Management
- 👥 Tenant Management & Screening
- 📋 Lease Management with E-Signatures
- 💰 Rent Payment Tracking
- 🔧 Maintenance Request System
- 📊 Financial Dashboard & Reporting
- 💬 Communication Center
- 🔐 Role-Based Access Control

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Email**: Gmail SMTP
- **File Storage**: Local filesystem
- **Deployment**: Zeabur

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/exemic8973/propertyManagementAPP.git
cd propertyManagementAPP
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend .env
DATABASE_URL=postgresql://username:password@localhost:5432/property_management
JWT_SECRET=your-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

4. Run database migrations
```bash
cd backend
npm run migrate
```

5. Start the application
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm start
```

## Project Structure

```
propertyManagementAPP/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── migrations/          # Database migrations
│   └── uploads/             # File storage
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   └── public/
└── docs/                    # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
