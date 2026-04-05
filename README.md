# পরমা (Poroma) - Backend API

> Medication Reminder App Backend - Healthcare Data Platform MVP

## Overview

This is the backend API service for পরমা (Poroma), a medication reminder application designed for the Bangladesh market. The backend is built with Node.js, Express, and PostgreSQL.

## Quick Links

- [Setup Guide](./SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [System Architecture Reference](../SYSTEM_ARCHITECTURE.md)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20.x LTS |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x |
| ORM | Prisma 5.x |
| Database | PostgreSQL 15.x |
| Authentication | JWT + Refresh Tokens |

## Project Status

```
Phase: Development
Current: Backend Foundation
Target: MVP - Medication Alert + Refill Alert
```

## Getting Started

```bash
# Clone and setup
cd poroma-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## API Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.poroma.app/api/v1` (TBD)

## Key Features (MVP)

- [x] User Authentication (Phone + Password)
- [x] Medication CRUD
- [x] Medication Logs (Mark taken/skipped)
- [x] Timeline Data
- [ ] Push Notifications (Scheduled)
- [ ] Timeline Sharing (Family/Caregiver)
- [ ] Pharmacy Integration
- [ ] Refill Alerts

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Complete setup instructions |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Full API reference |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guidelines |

## Related Projects

- [Frontend App](../poroma-frontend/) - React Native mobile application
- [Business Plan](../BUSINESS_PLAN.md) - Project vision and strategy

## License

Proprietary - All rights reserved
