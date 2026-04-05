# Contributing Guidelines

## পরমা (Poroma) - Backend Development

Thank you for contributing to পরমা! Please follow these guidelines for consistent and efficient development.

---

## Code Style

### TypeScript Guidelines

1. **Use strict TypeScript**
   - Enable strict mode in `tsconfig.json`
   - Avoid `any` type - use `unknown` when type is unclear
   - Use proper interfaces and types

2. **Naming Conventions**
   ```typescript
   // Interfaces and Types - PascalCase
   interface UserResponse { ... }
   type AuthTokens = { ... }

   // Functions and Methods - camelCase
   function getUserById() { ... }
   
   // Constants - UPPER_SNAKE_CASE
   const MAX_RETRY_COUNT = 3;
   
   // Files - kebab-case
   // auth.service.ts, medication-log.controller.ts
   ```

3. **File Structure**
   ```
   src/
   ├── config/           # Configuration files
   ├── controllers/      # Route handlers
   ├── services/         # Business logic
   ├── routes/           # Express routes
   ├── middleware/       # Express middleware
   ├── utils/            # Utility functions
   ├── validators/       # Zod schemas
   ├── types/            # TypeScript types
   └── app.ts           # Express app entry
   ```

### Code Formatting

- Use 2 spaces for indentation
- Semicolons at end of statements
- Single quotes for strings
- Trailing commas in multiline

**Example:**

```typescript
interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
}

export class MedicationService {
  private readonly repository: MedicationRepository;

  constructor(repository: MedicationRepository) {
    this.repository = repository;
  }

  async getMedications(userId: string): Promise<Medication[]> {
    return this.repository.findMany({
      where: { user_id: userId },
    });
  }
}
```

---

## Git Workflow

### Branch Naming

```
feature/feature-name        # New features
bugfix/bug-description      # Bug fixes
hotfix/critical-fix         # Urgent production fixes
refactor/refactor-name      # Code refactoring
docs/documentation          # Documentation updates
```

### Commit Messages

Follow conventional commits:

```
feat: add medication logging feature
fix: resolve authentication token expiry issue
docs: update API documentation
refactor: simplify error handling middleware
test: add unit tests for auth service
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear, atomic commits
3. Write/update tests
4. Update documentation if needed
5. Submit PR with description
6. Address review comments
7. Squash and merge

---

## Project Structure

### Source Code Organization

```
src/
├── config/
│   ├── index.ts          # Export all config
│   ├── database.ts       # Prisma client
│   └── index.ts         # Environment variables
│
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── medication.controller.ts
│   ├── log.controller.ts
│   └── analytics.controller.ts
│
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── medication.service.ts
│   ├── log.service.ts
│   └── analytics.service.ts
│
├── routes/
│   ├── index.ts         # Route aggregator
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── medication.routes.ts
│   └── log.routes.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   ├── error.middleware.ts
│   └── rateLimit.middleware.ts
│
├── validators/
│   ├── auth.validator.ts
│   ├── medication.validator.ts
│   └── common.validator.ts
│
├── types/
│   └── index.ts         # Shared types
│
└── utils/
    ├── logger.ts
    └── jwt.ts
```

### Class-Based Pattern

Use classes for services and controllers:

```typescript
// Good
export class MedicationService {
  async addMedication(userId: string, input: MedicationInput) {
    // implementation
  }
}

// Avoid
export const addMedication = async (userId: string, input: MedicationInput) => {
  // implementation
};
```

---

## Error Handling

### Custom Error Classes

```typescript
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
```

### Error Handling in Controllers

```typescript
export class MedicationController {
  async addMedication(req: Request, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.addMedication(
        req.user!.userId,
        req.body
      );
      res.status(201).json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## Database (Prisma)

### Schema Guidelines

1. Use meaningful names
2. Add comments for complex fields
3. Use appropriate field types
4. Index frequently queried fields

```prisma
model Medication {
  id              String    @id @default(uuid())
  user_id         String
  name            String
  dosage          String
  frequency       String
  times           String[]
  is_active       Boolean   @default(true)
  
  // Relations
  user            User      @relation(fields: [user_id], references: [id])
  logs            MedicationLog[]

  // Indexes
  @@index([user_id])
  @@map("medications")
}
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name add_medication_notes

# Apply migration
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

---

## Testing

### Test Structure

```
tests/
├── unit/
│   ├── auth.service.test.ts
│   └── medication.service.test.ts
└── integration/
    └── api.test.ts
```

### Writing Tests

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should register new user with valid data', async () => {
      // Arrange
      const input = {
        phone: '+8801712345678',
        password: 'password123',
        name: 'Test User'
      };

      // Act
      const result = await authService.register(input);

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe(input.phone);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error for duplicate phone', async () => {
      // ...
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- auth.service.test.ts
```

---

## Security Guidelines

1. **Never commit secrets** - Use environment variables
2. **Hash passwords** - Use bcrypt with cost factor 12+
3. **Validate input** - Use Zod for all request validation
4. **Sanitize output** - Prevent XSS attacks
5. **Rate limiting** - Implement on sensitive endpoints
6. **HTTPS only** - Enforce TLS in production

---

## Performance Guidelines

1. **Database queries**
   - Use `select` to limit returned fields
   - Add indexes for frequently queried columns
   - Use pagination for list endpoints

2. **Response optimization**
   - Enable compression
   - Use CDN for static assets

3. **Caching**
   - Cache expensive queries with Redis
   - Use appropriate TTL values

---

## Documentation

### Code Documentation

```typescript
/**
 * Retrieves all active medications for a user.
 * 
 * @param userId - The UUID of the user
 * @param includeInactive - Whether to include inactive medications
 * @returns Array of medications
 * @throws {NotFoundError} If user doesn't exist
 */
async getMedications(userId: string, includeInactive = false): Promise<Medication[]> {
  // ...
}
```

### API Documentation

Update `API_DOCUMENTATION.md` when:
- Adding new endpoints
- Modifying request/response formats
- Adding new error codes

---

## Environment Variables

Never commit `.env` files. Use `.env.example`:

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
CLIENT_URL="http://localhost:8081"
```

---

## Questions?

For questions or clarifications, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [System Architecture](../SYSTEM_ARCHITECTURE.md)
- [Business Plan](../BUSINESS_PLAN.md)

---

## License

Proprietary - All rights reserved
