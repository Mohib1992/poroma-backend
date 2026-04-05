# Backend Development Instructions

## পরমা (Poroma) - Backend Team

This document provides step-by-step instructions for building the backend API service.

---

## Prerequisites

- Node.js 18+ installed
- Docker installed and running
- PostgreSQL running (Docker or local)

### Quick PostgreSQL Setup (if needed)

```bash
# Run PostgreSQL container
docker run --name poroma-postgres \
  -e POSTGRES_USER=poroma \
  -e POSTGRES_PASSWORD=poroma123 \
  -e POSTGRES_DB=poroma \
  -p 5432:5432 \
  -v poroma-data:/var/lib/postgresql/data \
  -d postgres:15
```

---

## Step 1: Project Setup

Navigate to the backend directory:

```bash
cd poroma-backend
```

Copy the example environment file:

```bash
cp .env.example .env
```

**Verify `.env` contains:**
```env
DATABASE_URL="postgresql://poroma:poroma123@localhost:5432/poroma?schema=public"
JWT_SECRET="poroma-super-secret-jwt-key-at-least-32-characters-long-here"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CLIENT_URL="exp://localhost:8081"
```

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## Step 2: Create Project Structure

Create the following directory structure:

```bash
mkdir -p src/{config,controllers,services,routes,middleware,validators,utils,types,jobs}
```

---

## Step 3: Configuration Files

### 3.1 Create `src/config/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8081',
  },
};
```

### 3.2 Create `src/utils/logger.ts`

```typescript
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date().toISOString() }));
  },
};
```

### 3.3 Create `src/utils/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  phone: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};
```

### 3.4 Create `src/types/index.ts`

```typescript
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
  };
}
```

---

## Step 4: Validation Schemas

### 4.1 Create `src/validators/auth.validator.ts`

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### 4.2 Create `src/validators/medication.validator.ts`

```typescript
import { z } from 'zod';

export const addMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  name_bn: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times', 'four_times', 'as_needed', 'weekly']),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')),
  duration: z.number().int().positive().optional(),
  start_date: z.string(),
  notes: z.string().optional(),
  pharmacy_id: z.string().uuid().optional(),
  stock_count: z.number().int().min(0).optional(),
  refill_alert_days: z.number().int().min(1).max(30).default(7),
});

export const updateMedicationSchema = addMedicationSchema.partial();

export const markLogSchema = z.object({
  medication_id: z.string().uuid(),
  scheduled_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  status: z.enum(['taken', 'skipped']),
});

export type AddMedicationInput = z.infer<typeof addMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type MarkLogInput = z.infer<typeof markLogSchema>;
```

---

## Step 5: Middleware

### 5.1 Create `src/middleware/error.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
```

### 5.2 Create `src/middleware/validate.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors,
      });
    }
    
    req.body = result.data;
    next();
  };
};
```

### 5.3 Create `src/middleware/auth.middleware.ts`

```typescript
import { Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../config';
import { AuthRequest } from '../types';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, phone: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = { userId: user.id, phone: user.phone };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};
```

---

## Step 6: Services

### 6.1 Create `src/services/auth.service.ts`

```typescript
import bcrypt from 'bcryptjs';
import { prisma } from '../config';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: { phone: input.phone },
    });

    if (existingUser) {
      throw new AppError('Phone number already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        phone: input.phone,
        password: hashedPassword,
        name: input.name,
      },
      select: { id: true, phone: true, name: true },
    });

    const tokens = this.generateTokens(user.id, user.phone);

    await prisma.timeline.create({
      data: { user_id: user.id },
    });

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { phone: input.phone },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user.id, user.phone);

    return {
      user: { id: user.id, phone: user.phone, name: user.name },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: storedToken.user_id },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return this.generateTokens(user.id, user.phone);
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private generateTokens(userId: string, phone: string) {
    const payload = { userId, phone };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}

export const authService = new AuthService();
```

### 6.2 Create `src/services/medication.service.ts`

```typescript
import { prisma } from '../config';
import { AddMedicationInput, UpdateMedicationInput } from '../validators/medication.validator';
import { AppError } from '../middleware/error.middleware';

export class MedicationService {
  async addMedication(userId: string, input: AddMedicationInput) {
    const startDate = new Date(input.start_date);
    const endDate = input.duration
      ? new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000)
      : null;

    return prisma.medication.create({
      data: {
        user_id: userId,
        name: input.name,
        name_bn: input.name_bn,
        dosage: input.dosage,
        frequency: input.frequency,
        times: input.times,
        duration: input.duration,
        start_date: startDate,
        end_date: endDate,
        notes: input.notes,
        pharmacy_id: input.pharmacy_id,
        stock_count: input.stock_count,
        refill_alert_days: input.refill_alert_days,
      },
    });
  }

  async getMedications(userId: string, includeInactive = false) {
    return prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: includeInactive ? undefined : true,
      },
      include: {
        pharmacy: {
          select: { id: true, name: true, has_delivery: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getMedication(userId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
      include: {
        pharmacy: true,
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          orderBy: { scheduled_time: 'asc' },
        },
      },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return medication;
  }

  async updateMedication(userId: string, medicationId: string, input: UpdateMedicationInput) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const startDate = input.start_date ? new Date(input.start_date) : medication.start_date;
    const endDate = input.duration
      ? new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000)
      : input.start_date && medication.duration
      ? new Date(startDate.getTime() + medication.duration * 24 * 60 * 60 * 1000)
      : null;

    return prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...input,
        start_date: startDate,
        end_date: endDate,
      },
    });
  }

  async deleteMedication(userId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return prisma.medication.update({
      where: { id: medicationId },
      data: { is_active: false },
    });
  }

  async getMedicationsNeedingRefill(userId: string) {
    const medications = await prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: true,
        stock_count: { not: null },
      },
    });

    return medications.filter((med) => {
      if (!med.stock_count || !med.refill_alert_days) return false;
      const dailyDoses = med.times.length;
      const daysLeft = Math.floor(med.stock_count / dailyDoses);
      return daysLeft <= med.refill_alert_days;
    });
  }

  async updateStock(userId: string, medicationId: string, stockCount: number) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return prisma.medication.update({
      where: { id: medicationId },
      data: { stock_count: stockCount },
    });
  }
}

export const medicationService = new MedicationService();
```

### 6.3 Create `src/services/log.service.ts`

```typescript
import { prisma } from '../config';
import { MarkLogInput } from '../validators/medication.validator';
import { AppError } from '../middleware/error.middleware';

export class LogService {
  async markMedication(userId: string, input: MarkLogInput) {
    const medication = await prisma.medication.findFirst({
      where: { id: input.medication_id, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.medicationLog.findFirst({
      where: {
        medication_id: input.medication_id,
        user_id: userId,
        scheduled_time: input.scheduled_time,
        date: { gte: today },
      },
    });

    if (existingLog) {
      return prisma.medicationLog.update({
        where: { id: existingLog.id },
        data: {
          status: input.status,
          taken_at: input.status === 'taken' ? new Date() : null,
          skipped_at: input.status === 'skipped' ? new Date() : null,
        },
      });
    }

    return prisma.medicationLog.create({
      data: {
        medication_id: input.medication_id,
        user_id: userId,
        scheduled_time: input.scheduled_time,
        status: input.status,
        taken_at: input.status === 'taken' ? new Date() : null,
        skipped_at: input.status === 'skipped' ? new Date() : null,
        date: new Date(),
      },
    });
  }

  async getTimeline(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const medications = await prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: true,
        start_date: { lte: endOfDay },
        OR: [
          { end_date: null },
          { end_date: { gte: targetDate } },
        ],
      },
      include: {
        logs: {
          where: {
            date: { gte: targetDate, lte: endOfDay },
          },
        },
      },
    });

    const timeline: any[] = [];

    for (const med of medications) {
      for (const time of med.times) {
        const log = med.logs.find((l) => l.scheduled_time === time);
        timeline.push({
          id: med.id,
          medication_id: med.id,
          name: med.name,
          dosage: med.dosage,
          scheduled_time: time,
          status: log?.status || 'pending',
          taken_at: log?.taken_at,
        });
      }
    }

    timeline.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

    const summary = {
      total: timeline.length,
      taken: timeline.filter((t) => t.status === 'taken').length,
      skipped: timeline.filter((t) => t.status === 'skipped').length,
      pending: timeline.filter((t) => t.status === 'pending').length,
    };

    return { date: targetDate.toISOString().split('T')[0], summary, medications: timeline };
  }

  async getMedicationLogs(userId: string, medicationId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return prisma.medicationLog.findMany({
      where: {
        medication_id: medicationId,
        user_id: userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });
  }
}

export const logService = new LogService();
```

### 6.4 Create `src/services/analytics.service.ts`

```typescript
import { prisma } from '../config';

export class AnalyticsService {
  async trackEvent(userId: string | null, eventType: string, eventData: any, deviceInfo?: any) {
    return prisma.analyticsEvent.create({
      data: {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        device_info: deviceInfo,
      },
    });
  }

  async getUserStats(userId: string) {
    const [totalMedications, totalLogs, takenLogs, skippedLogs] = await Promise.all([
      prisma.medication.count({ where: { user_id: userId } }),
      prisma.medicationLog.count({ where: { user_id: userId } }),
      prisma.medicationLog.count({ where: { user_id: userId, status: 'taken' } }),
      prisma.medicationLog.count({ where: { user_id: userId, status: 'skipped' } }),
    ]);

    return {
      total_medications: totalMedications,
      total_logs: totalLogs,
      taken: takenLogs,
      skipped: skippedLogs,
      adherence_rate: totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
```

---

## Step 7: Controllers

### 7.1 Create `src/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { analyticsService } from '../services/analytics.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      
      await analyticsService.trackEvent(result.user.id, 'user_registered', {
        phone: result.user.phone,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      await analyticsService.trackEvent(result.user.id, 'user_logged_in', {
        phone: result.user.phone,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

### 7.2 Create `src/controllers/medication.controller.ts`

```typescript
import { Response, NextFunction } from 'express';
import { medicationService } from '../services/medication.service';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class MedicationController {
  async addMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.addMedication(req.user!.userId, req.body);

      await analyticsService.trackEvent(req.user!.userId, 'medication_added', {
        medication_id: medication.id,
        medication_name: medication.name,
        frequency: medication.frequency,
      });

      res.status(201).json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async getMedications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const medications = await medicationService.getMedications(req.user!.userId, includeInactive);
      res.json({ success: true, data: { medications } });
    } catch (error) {
      next(error);
    }
  }

  async getMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.getMedication(req.user!.userId, req.params.id);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async updateMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.updateMedication(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.deleteMedication(req.user!.userId, req.params.id);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async getRefillPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medications = await medicationService.getMedicationsNeedingRefill(req.user!.userId);
      res.json({ success: true, data: { medications } });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { stockCount } = req.body;
      const medication = await medicationService.updateStock(req.user!.userId, req.params.id, stockCount);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }
}

export const medicationController = new MedicationController();
```

### 7.3 Create `src/controllers/log.controller.ts`

```typescript
import { Response, NextFunction } from 'express';
import { logService } from '../services/log.service';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class LogController {
  async markMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await logService.markMedication(req.user!.userId, req.body);

      await analyticsService.trackEvent(req.user!.userId, `medication_${req.body.status}`, {
        medication_id: req.body.medication_id,
        scheduled_time: req.body.scheduled_time,
        status: req.body.status,
      });

      res.status(201).json({ success: true, data: { log } });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const timeline = await logService.getTimeline(req.user!.userId, date as string);
      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }

  async getMedicationLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { days } = req.query;
      const logs = await logService.getMedicationLogs(
        req.user!.userId,
        req.params.id,
        days ? parseInt(days as string) : 7
      );
      res.json({ success: true, data: { logs } });
    } catch (error) {
      next(error);
    }
  }
}

export const logController = new LogController();
```

### 7.4 Create `src/controllers/analytics.controller.ts`

```typescript
import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class AnalyticsController {
  async trackEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { event_type, event_data } = req.body;
      const deviceInfo = req.headers['user-agent'];

      const event = await analyticsService.trackEvent(
        req.user?.userId || null,
        event_type,
        event_data,
        { userAgent: deviceInfo }
      );

      res.status(201).json({ success: true, data: { event } });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getUserStats(req.user!.userId);
      res.json({ success: true, data: { stats } });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
```

---

## Step 8: Routes

### 8.1 Create `src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
```

### 8.2 Create `src/routes/medication.routes.ts`

```typescript
import { Router } from 'express';
import { medicationController } from '../controllers/medication.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addMedicationSchema, updateMedicationSchema } from '../validators/medication.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(addMedicationSchema), medicationController.addMedication.bind(medicationController));
router.get('/', medicationController.getMedications.bind(medicationController));
router.get('/refill-pending', medicationController.getRefillPending.bind(medicationController));
router.get('/:id', medicationController.getMedication.bind(medicationController));
router.put('/:id', validate(updateMedicationSchema), medicationController.updateMedication.bind(medicationController));
router.delete('/:id', medicationController.deleteMedication.bind(medicationController));
router.put('/:id/stock', medicationController.updateStock.bind(medicationController));

export default router;
```

### 8.3 Create `src/routes/log.routes.ts`

```typescript
import { Router } from 'express';
import { logController } from '../controllers/log.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { markLogSchema } from '../validators/medication.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(markLogSchema), logController.markMedication.bind(logController));
router.get('/timeline', logController.getTimeline.bind(logController));
router.get('/medication/:id', logController.getMedicationLogs.bind(logController));

export default router;
```

### 8.4 Create `src/routes/analytics.routes.ts`

```typescript
import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/event', authMiddleware, analyticsController.trackEvent.bind(analyticsController));
router.get('/stats', authMiddleware, analyticsController.getUserStats.bind(analyticsController));

export default router;
```

### 8.5 Create `src/routes/index.ts`

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import medicationRoutes from './medication.routes';
import logRoutes from './log.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medications', medicationRoutes);
router.use('/logs', logRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
```

---

## Step 9: Express App

### Create `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { config } from './config';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;
```

---

## Step 10: Test the Backend

Start the development server:

```bash
npm run dev
```

Test the health endpoint:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-05T12:00:00.000Z"}
```

### Test Registration:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+8801712345678","password":"password123","name":"Test User"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {"id": "...", "phone": "+8801712345678", "name": "Test User"},
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Register new user |
| POST | /api/v1/auth/login | No | Login user |
| POST | /api/v1/auth/refresh | No | Refresh token |
| POST | /api/v1/auth/logout | No | Logout user |
| GET | /api/v1/medications | Yes | List medications |
| POST | /api/v1/medications | Yes | Add medication |
| GET | /api/v1/medications/:id | Yes | Get medication |
| PUT | /api/v1/medications/:id | Yes | Update medication |
| DELETE | /api/v1/medications/:id | Yes | Delete medication |
| GET | /api/v1/medications/refill-pending | Yes | Get refill alerts |
| PUT | /api/v1/medications/:id/stock | Yes | Update stock |
| POST | /api/v1/logs | Yes | Mark medication |
| GET | /api/v1/logs/timeline | Yes | Get timeline |
| GET | /api/v1/logs/medication/:id | Yes | Get medication logs |
| POST | /api/v1/analytics/event | Yes | Track event |
| GET | /api/v1/analytics/stats | Yes | Get user stats |

---

## Files to Create

```
poroma-backend/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── medication.controller.ts
│   │   ├── log.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── medication.service.ts
│   │   ├── log.service.ts
│   │   └── analytics.service.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── medication.routes.ts
│   │   ├── log.routes.ts
│   │   └── analytics.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── medication.validator.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── jwt.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── prisma/
│   └── schema.prisma (already created)
└── package.json (already created)
```

---

## Notes

- All controllers, services follow class-based pattern
- Use proper error handling with AppError class
- Validate all inputs using Zod schemas
- Include analytics tracking for all user actions
- The `AuthRequest` interface is in `src/types/index.ts`

---

## Reference Documents

- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [System Architecture Reference](../SYSTEM_ARCHITECTURE.md)
