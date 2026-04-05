# পরমা (Poroma) - Backend API

> Medication Reminder App Backend - Healthcare Data Platform MVP

## Overview

This is the backend API service for পরমা (Poroma), a medication reminder application designed for the Bangladesh market. The backend is built with Node.js, Express, TypeScript, and PostgreSQL.

## Quick Links

- [Setup Guide](./SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18.x+ |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x |
| ORM | Prisma 5.x |
| Database | PostgreSQL |
| Authentication | JWT + bcryptjs |
| Validation | Zod |

## Project Status

```
Phase: Development
Current: Backend Foundation
Target: MVP - Medication Alert + Refill Alert
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp package.example.json package.json
# Or create .env file with your configuration
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The server will run at `http://localhost:3000/api`

### Build for Production

```bash
# Build
npm run build

# Start production server
npm run start
```

## Project Structure

```
poroma-backend/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma   # Database models
│   ├── seed.ts         # Database seeding
│   └── create-admin.ts # Admin user creation
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware (auth, validation, error)
│   ├── routes/         # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Utilities (JWT, logger)
│   └── validators/    # Zod validators
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get current user |

### Medications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medications` | List all medications |
| POST | `/api/medications` | Create medication |
| GET | `/api/medications/:id` | Get medication |
| PUT | `/api/medications/:id` | Update medication |
| DELETE | `/api/medications/:id` | Delete medication |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Get activity logs |
| POST | `/api/logs` | Create log entry |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get medication summary |
| GET | `/api/analytics/adherence` | Get adherence stats |

## Key Features (MVP)

- [x] User Authentication (Phone + Password)
- [x] Medication CRUD
- [x] Medication Logs (Mark taken/skipped)
- [x] Timeline Data
- [ ] Push Notifications (Scheduled)
- [ ] Timeline Sharing (Family/Caregiver)
- [ ] Pharmacy Integration
- [ ] Refill Alerts

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Complete setup instructions |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Full API reference |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guidelines |

## Related Projects

- [Frontend App](../poroma-frontend/) - React Native mobile application

## License

Proprietary - All rights reserved