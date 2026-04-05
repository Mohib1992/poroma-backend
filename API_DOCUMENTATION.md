# API Documentation

## পরমা (Poroma) - Backend API Reference

> Version: 1.0  
> Base URL: `/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User](#user)
3. [Medications](#medications)
4. [Medication Logs](#medication-logs)
5. [Analytics](#analytics)
6. [Error Handling](#error-handling)

---

## Authentication

### Register

Register a new user with phone number and password.

```
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "phone": "+88017XXXXXXXX",
  "password": "securePassword123",
  "name": "Rahim Ahmed"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | Bangladesh phone number (+8801XXXXXXXXX) |
| password | string | Yes | Minimum 6 characters |
| name | string | No | User's full name |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+88017XXXXXXXX",
      "name": "Rahim Ahmed"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Phone number already registered |
| 400 | Invalid phone format |
| 400 | Password too short |

---

### Login

Authenticate user and receive tokens.

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "phone": "+88017XXXXXXXX",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+88017XXXXXXXX",
      "name": "Rahim Ahmed"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 401 | Invalid credentials |

---

### Refresh Token

Get new access token using refresh token.

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### Logout

Invalidate refresh token.

```
POST /api/v1/auth/logout
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

---

## User

> Requires Authentication

### Get Current User

```
GET /api/v1/user
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+88017XXXXXXXX",
      "name": "Rahim Ahmed",
      "email": "rahim@example.com",
      "gender": "male",
      "age_range": "26-35",
      "district": "Dhaka",
      "created_at": "2026-04-05T12:00:00Z"
    }
  }
}
```

---

### Update User

```
PUT /api/v1/user
```

**Request Body:**

```json
{
  "name": "Rahim Ahmed",
  "email": "rahim@example.com",
  "gender": "male",
  "age_range": "26-35",
  "district": "Dhaka"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+88017XXXXXXXX",
      "name": "Rahim Ahmed",
      "email": "rahim@example.com",
      "gender": "male",
      "age_range": "26-35",
      "district": "Dhaka"
    }
  }
}
```

---

## Medications

> Requires Authentication

### Add Medication

```
POST /api/v1/medications
```

**Request Body:**

```json
{
  "name": "Metformin 500mg",
  "dosage": "1 tablet",
  "frequency": "twice_daily",
  "times": ["08:00", "20:00"],
  "duration": 30,
  "start_date": "2026-04-05",
  "notes": "Take after food",
  "pharmacy_id": "uuid",
  "stock_count": 60,
  "refill_alert_days": 7
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Medication name |
| dosage | string | Yes | e.g., "1 tablet", "2 capsules" |
| frequency | enum | Yes | once_daily, twice_daily, three_times, four_times, as_needed, weekly |
| times | string[] | Yes | Array of times in HH:MM format |
| duration | number | No | Duration in days (null = ongoing) |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| notes | string | No | Additional instructions |
| pharmacy_id | string | No | Preferred pharmacy UUID |
| stock_count | number | No | Current pills in stock |
| refill_alert_days | number | No | Days before stock runs out (default: 7) |

**Frequency Values:**

| Value | Description |
|-------|-------------|
| once_daily | Once per day |
| twice_daily | Two times per day |
| three_times | Three times per day |
| four_times | Four times per day |
| as_needed | As needed |
| weekly | Once per week |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "medication": {
      "id": "uuid",
      "name": "Metformin 500mg",
      "dosage": "1 tablet",
      "frequency": "twice_daily",
      "times": ["08:00", "20:00"],
      "duration": 30,
      "start_date": "2026-04-05T00:00:00Z",
      "end_date": "2026-05-05T00:00:00Z",
      "notes": "Take after food",
      "is_active": true,
      "stock_count": 60,
      "refill_alert_days": 7
    }
  }
}
```

---

### List Medications

```
GET /api/v1/medications
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| includeInactive | boolean | false | Include inactive medications |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "id": "uuid",
        "name": "Metformin 500mg",
        "dosage": "1 tablet",
        "frequency": "twice_daily",
        "times": ["08:00", "20:00"],
        "is_active": true,
        "pharmacy": {
          "id": "uuid",
          "name": "ABC Pharmacy",
          "has_delivery": true
        }
      }
    ]
  }
}
```

---

### Get Medication

```
GET /api/v1/medications/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medication": {
      "id": "uuid",
      "name": "Metformin 500mg",
      "dosage": "1 tablet",
      "frequency": "twice_daily",
      "times": ["08:00", "20:00"],
      "start_date": "2026-04-05T00:00:00Z",
      "end_date": "2026-05-05T00:00:00Z",
      "notes": "Take after food",
      "is_active": true,
      "pharmacy": {
        "id": "uuid",
        "name": "ABC Pharmacy",
        "address": "123 Main St, Dhaka",
        "phone": "+8801XXXXXXXXX",
        "has_delivery": true
      },
      "logs": [
        {
          "id": "uuid",
          "scheduled_time": "08:00",
          "status": "taken",
          "taken_at": "2026-04-05T08:05:00Z"
        }
      ]
    }
  }
}
```

---

### Update Medication

```
PUT /api/v1/medications/:id
```

**Request Body:** Same as Add Medication (all fields optional)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medication": { ... }
  }
}
```

---

### Delete Medication

Soft delete - marks medication as inactive.

```
DELETE /api/v1/medications/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medication": {
      "id": "uuid",
      "is_active": false
    }
  }
}
```

---

### Get Refill Pending

Get medications that need refill soon.

```
GET /api/v1/medications/refill-pending
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "id": "uuid",
        "name": "Metformin 500mg",
        "stock_count": 5,
        "refill_alert_days": 7,
        "times": ["08:00", "20:00"]
      }
    ]
  }
}
```

---

### Update Stock

Update medication stock count.

```
PUT /api/v1/medications/:id/stock
```

**Request Body:**

```json
{
  "stockCount": 60
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "medication": {
      "id": "uuid",
      "stock_count": 60
    }
  }
}
```

---

## Medication Logs

> Requires Authentication

### Mark Medication

Record medication taken or skipped.

```
POST /api/v1/logs
```

**Request Body:**

```json
{
  "medication_id": "uuid",
  "scheduled_time": "08:00",
  "status": "taken"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medication_id | string | Yes | Medication UUID |
| scheduled_time | string | Yes | Time in HH:MM format |
| status | enum | Yes | "taken" or "skipped" |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "log": {
      "id": "uuid",
      "medication_id": "uuid",
      "scheduled_time": "08:00",
      "status": "taken",
      "taken_at": "2026-04-05T08:05:00Z",
      "date": "2026-04-05T00:00:00Z"
    }
  }
}
```

---

### Get Timeline

Get daily medication timeline.

```
GET /api/v1/logs/timeline
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| date | string | today | Date in YYYY-MM-DD format |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "date": "2026-04-05",
    "summary": {
      "total": 4,
      "taken": 2,
      "skipped": 0,
      "pending": 2
    },
    "medications": [
      {
        "id": "log-uuid",
        "medication_id": "med-uuid",
        "name": "Metformin 500mg",
        "dosage": "1 tablet",
        "scheduled_time": "08:00",
        "status": "taken",
        "taken_at": "2026-04-05T08:05:00Z"
      },
      {
        "id": "log-uuid",
        "medication_id": "med-uuid",
        "name": "Amlodipine 5mg",
        "dosage": "1 tablet",
        "scheduled_time": "08:00",
        "status": "pending",
        "taken_at": null
      }
    ]
  }
}
```

---

### Get Medication Logs

Get historical logs for a specific medication.

```
GET /api/v1/logs/medication/:id
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | number | 7 | Number of past days |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "scheduled_time": "08:00",
        "status": "taken",
        "taken_at": "2026-04-05T08:05:00Z",
        "date": "2026-04-05T00:00:00Z"
      }
    ]
  }
}
```

---

## Analytics

> Requires Authentication

### Track Event

Track user analytics event.

```
POST /api/v1/analytics/event
```

**Request Body:**

```json
{
  "event_type": "medication_taken",
  "event_data": {
    "medication_id": "uuid",
    "scheduled_time": "08:00"
  }
}
```

**Event Types:**

| Event | Description |
|-------|-------------|
| user_registered | New user registration |
| user_logged_in | User login |
| medication_added | New medication added |
| medication_updated | Medication updated |
| medication_deleted | Medication deleted |
| medication_taken | Medication marked as taken |
| medication_skipped | Medication marked as skipped |
| medication_missed | Medication missed |
| reminder_sent | Reminder notification sent |
| reminder_opened | Reminder notification opened |
| refill_alert_shown | Refill alert displayed |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "event_type": "medication_taken"
    }
  }
}
```

---

### Get User Stats

Get user statistics.

```
GET /api/v1/analytics/stats
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_medications": 5,
      "total_logs": 120,
      "taken": 110,
      "skipped": 10,
      "adherence_rate": 91.67
    }
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Validation failed | Invalid request data |
| 400 | Phone number already registered | Duplicate phone |
| 400 | Invalid phone format | Wrong phone pattern |
| 400 | Password must be at least 6 characters | Password too short |
| 401 | No token provided | Missing Authorization header |
| 401 | Invalid token | Invalid or expired JWT |
| 401 | Invalid credentials | Wrong phone/password |
| 404 | Medication not found | UUID not found |
| 500 | Internal server error | Server error |

---

## Authentication Header

Include JWT access token in all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Token expires after 15 minutes. Use `/auth/refresh` to get a new token.

---

## Rate Limiting

Default: 100 requests per minute per IP

---

## API Versioning

API is versioned via URL path: `/api/v1/`

Breaking changes will be released in new versions.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial MVP API |
