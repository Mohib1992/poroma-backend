# Backend Setup Guide

## Prerequisites

- Node.js 20.x LTS or higher
- PostgreSQL 15.x or higher
- npm or yarn package manager

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd poroma-backend
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/poroma?schema=public"

# JWT (generate a secure key)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Client URL (for CORS)
CLIENT_URL="exp://localhost:8081"
```

### Generating JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE poroma;

# Exit psql
\q
```

### Option B: Cloud PostgreSQL (Recommended for Production)

Use services like:
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Railway](https://railway.app) - Simple hosting

Get the connection string and update `DATABASE_URL` in `.env`.

## Step 5: Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run initial migration
npx prisma migrate dev --name init
```

This will create all necessary tables in the database.

## Step 6: (Optional) Seed Database

```bash
# Seed with sample data
npx prisma db seed
```

## Step 7: Start Development Server

```bash
npm run dev
```

Server should start at `http://localhost:3000`

## Step 8: Verify Installation

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-05T12:00:00.000Z"}
```

## Common Issues

### Database Connection Failed

```
Error: P1001: Can't reach database server
```

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database exists
4. Check firewall settings

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution:**
1. Change PORT in `.env` to a different value
2. Or kill the process using port 3000

### Prisma Client Generation Failed

```bash
# Clean and regenerate
npx prisma generate --force
```

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma generate` | Generate Prisma client |

## Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/poroma"
JWT_SECRET="production-secret-key"
PORT=3000
CLIENT_URL="https://app.poroma.app"
```

### Recommended Platforms

- [Railway](https://railway.app) - Simple Node.js hosting
- [Render](https://render.com) - Managed cloud platform
- [Vercel](https://vercel.com) - Serverless functions
- [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) - Enterprise

## Next Steps

1. Read [API Documentation](./API_DOCUMENTATION.md)
2. Review [Contributing Guidelines](./CONTRIBUTING.md)
3. Start implementing features

## Support

For questions, refer to:
- [System Architecture](../SYSTEM_ARCHITECTURE.md)
- [Business Plan](../BUSINESS_PLAN.md)
