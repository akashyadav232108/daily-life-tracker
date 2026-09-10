# API Documentation

Complete API reference for all Daily Life Tracker services.

## Table of Contents

- [Authentication](#authentication)
- [Auth Service APIs](#auth-service-apis-8081)
- [Task Service APIs](#task-service-apis-8082)
- [Health Service APIs](#health-service-apis-8083)
- [Expense Service APIs](#expense-service-apis-8084)
- [Notification Service APIs](#notification-service-apis-8085)
- [Common Response Formats](#common-response-formats)
- [Error Codes](#error-codes)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting Tokens

1. Register or login to get `accessToken` and `refreshToken`
2. Use `accessToken` for API calls (expires in 1 hour)
3. Use `refreshToken` to get a new `accessToken` when it expires (valid for 7 days)

---

## Auth Service APIs (8081)

Base URL: `http://localhost:8081`

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2026-09-10T12:00:00"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json
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
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json
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
  "message": "Logout successful"
}
```

### Password Reset Flow

#### Forgot Password (Send OTP)

```http
POST /api/auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### Verify OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Profile Endpoints

#### Get Profile

```http
GET /api/users/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-09-10T12:00:00"
  }
}
```

#### Update Profile

```http
PUT /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

#### Change Password

```http
PUT /api/users/me/password
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Delete Account

```http
DELETE /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "password": "currentPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Admin Endpoints

#### Get All Users

```http
GET /api/users/admin/all?page=0&size=10
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2026-09-10T12:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0
  }
}
```

#### Get User Statistics

```http
GET /api/users/admin/stats
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "admins": 2,
    "newUsersThisMonth": 25
  }
}
```

---

## Task Service APIs (8082)

Base URL: `http://localhost:8082`

### Task Endpoints

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write README and API docs",
  "priority": "HIGH",
  "dueDate": "2026-09-15T18:00:00",
  "status": "TODO"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write README and API docs",
    "priority": "HIGH",
    "status": "TODO",
    "dueDate": "2026-09-15T18:00:00",
    "createdAt": "2026-09-10T12:00:00",
    "completedAt": null
  }
}
```

#### Get All Tasks

```http
GET /api/tasks?status=TODO&priority=HIGH&page=0&size=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): TODO, IN_PROGRESS, COMPLETED
- `priority` (optional): LOW, MEDIUM, HIGH
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Complete project documentation",
        "description": "Write README and API docs",
        "priority": "HIGH",
        "status": "TODO",
        "dueDate": "2026-09-15T18:00:00",
        "createdAt": "2026-09-10T12:00:00"
      }
    ],
    "totalElements": 15,
    "totalPages": 2
  }
}
```

#### Get Task by ID

```http
GET /api/tasks/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write README and API docs",
    "priority": "HIGH",
    "status": "TODO",
    "dueDate": "2026-09-15T18:00:00"
  }
}
```

#### Update Task

```http
PUT /api/tasks/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete project documentation - Updated",
  "description": "Write comprehensive README and API docs",
  "priority": "MEDIUM",
  "dueDate": "2026-09-16T18:00:00"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { /* updated task */ }
}
```

#### Mark Task as Complete

```http
PATCH /api/tasks/{id}/complete
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task marked as complete",
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "completedAt": "2026-09-10T15:30:00"
  }
}
```

#### Reopen Task

```http
PATCH /api/tasks/{id}/reopen
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task reopened successfully",
  "data": {
    "id": 1,
    "status": "TODO",
    "completedAt": null
  }
}
```

#### Delete Task

```http
DELETE /api/tasks/{id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Admin Task Endpoints

#### Get User's Tasks (Admin)

```http
GET /api/tasks/admin/users/{userId}?page=0&size=10
Authorization: Bearer <admin_access_token>
```

**Response:** Same as Get All Tasks

#### Get Platform Task Statistics

```http
GET /api/tasks/admin/stats
Authorization: Bearer <admin_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalTasks": 1500,
    "completedTasks": 900,
    "activeTasks": 600,
    "tasksByPriority": {
      "HIGH": 300,
      "MEDIUM": 700,
      "LOW": 500
    }
  }
}
```

---

## Health Service APIs (8083)

Base URL: `http://localhost:8083`

### Health Log Endpoints

#### Create Health Log

```http
POST /api/health/logs
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2026-09-10",
  "mood": "HAPPY",
  "sleepHours": 7.5,
  "notes": "Feeling energetic today"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Health log created successfully",
  "data": {
    "id": 1,
    "date": "2026-09-10",
    "mood": "HAPPY",
    "sleepHours": 7.5,
    "notes": "Feeling energetic today",
    "createdAt": "2026-09-10T12:00:00"
  }
}
```

#### Get All Health Logs

```http
GET /api/health/logs?startDate=2026-09-01&endDate=2026-09-10
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2026-09-10",
      "mood": "HAPPY",
      "sleepHours": 7.5,
      "notes": "Feeling energetic today"
    }
  ]
}
```

#### Get Today's Health Log

```http
GET /api/health/logs/today
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2026-09-10",
    "mood": "HAPPY",
    "sleepHours": 7.5
  }
}
```

#### Get Weekly Summary

```http
GET /api/health/summary/weekly
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "averageSleep": 7.2,
    "totalLogs": 6,
    "moodDistribution": {
      "HAPPY": 4,
      "NEUTRAL": 1,
      "SAD": 1
    }
  }
}
```

### Custom Health Metrics

#### Create Metric

```http
POST /api/health/metrics
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Water Intake",
  "unit": "liters",
  "targetValue": 3.0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Metric created successfully",
  "data": {
    "id": 1,
    "name": "Water Intake",
    "unit": "liters",
    "targetValue": 3.0
  }
}
```

#### Get All Metrics

```http
GET /api/health/metrics
Authorization: Bearer <access_token>
```

### Exercise Plan Endpoints

#### Create Exercise Plan

```http
POST /api/exercises/plans
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Morning Workout",
  "description": "Full body workout routine",
  "startDate": "2026-09-10",
  "endDate": "2026-10-10",
  "daysOfWeek": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": 15,
      "duration": null
    },
    {
      "name": "Running",
      "sets": 1,
      "reps": null,
      "duration": 30
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Exercise plan created successfully",
  "data": {
    "id": 1,
    "name": "Morning Workout",
    "status": "ACTIVE",
    "startDate": "2026-09-10",
    "endDate": "2026-10-10"
  }
}
```

#### Get Active Plan

```http
GET /api/exercises/plans/active
Authorization: Bearer <access_token>
```

#### Get Today's Workout

```http
GET /api/exercises/plans/today
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "planId": 1,
    "planName": "Morning Workout",
    "date": "2026-09-10",
    "exercises": [
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": 15
      }
    ],
    "completed": false
  }
}
```

#### Log Exercise

```http
POST /api/exercises/logs
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": 1,
  "date": "2026-09-10",
  "exerciseName": "Push-ups",
  "setsCompleted": 3,
  "repsCompleted": 15,
  "notes": "Felt good"
}
```

#### Get Today's Exercise Logs

```http
GET /api/exercises/logs/today
Authorization: Bearer <access_token>
```

---

## Expense Service APIs (8084)

Base URL: `http://localhost:8084`

### Expense Endpoints

#### Create Expense

```http
POST /api/expenses
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50.00,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2026-09-10"
}
```

**Categories:** `FOOD`, `TRANSPORT`, `ENTERTAINMENT`, `UTILITIES`, `HEALTHCARE`, `SHOPPING`, `OTHER`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 1,
    "amount": 50.00,
    "category": "FOOD",
    "description": "Lunch at restaurant",
    "date": "2026-09-10",
    "createdAt": "2026-09-10T12:00:00"
  }
}
```

#### Get All Expenses

```http
GET /api/expenses?category=FOOD&startDate=2026-09-01&endDate=2026-09-30&page=0&size=10
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "amount": 50.00,
        "category": "FOOD",
        "description": "Lunch at restaurant",
        "date": "2026-09-10"
      }
    ],
    "totalElements": 25,
    "totalPages": 3
  }
}
```

#### Update Expense

```http
PUT /api/expenses/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Delete Expense

```http
DELETE /api/expenses/{id}
Authorization: Bearer <access_token>
```

#### Import Expenses from CSV

```http
POST /api/expenses/import
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: CSV file

**CSV Format:**
```csv
date,amount,category,description
2026-09-01,30.00,FOOD,Grocery shopping
2026-09-02,15.00,TRANSPORT,Uber ride
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Imported 50 expenses successfully",
  "data": {
    "imported": 50,
    "failed": 0
  }
}
```

#### Get Monthly Summary

```http
GET /api/expenses/summary/monthly?year=2026&month=9
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 1500.00,
    "byCategory": {
      "FOOD": 500.00,
      "TRANSPORT": 300.00,
      "ENTERTAINMENT": 200.00,
      "UTILITIES": 400.00,
      "OTHER": 100.00
    },
    "transactionCount": 45
  }
}
```

### Budget Endpoints

#### Create Budget

```http
POST /api/budgets
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "FOOD",
  "amount": 500.00,
  "month": "2026-09"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "id": 1,
    "category": "FOOD",
    "amount": 500.00,
    "month": "2026-09",
    "spent": 0.00,
    "remaining": 500.00
  }
}
```

#### Get All Budgets

```http
GET /api/budgets?month=2026-09
Authorization: Bearer <access_token>
```

#### Get Budget Status

```http
GET /api/budgets/status?month=2026-09
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "category": "FOOD",
      "budget": 500.00,
      "spent": 450.00,
      "remaining": 50.00,
      "percentageUsed": 90,
      "status": "WARNING"
    },
    {
      "category": "TRANSPORT",
      "budget": 300.00,
      "spent": 150.00,
      "remaining": 150.00,
      "percentageUsed": 50,
      "status": "ON_TRACK"
    }
  ]
}
```

**Status Types:** `ON_TRACK` (<80%), `WARNING` (80-100%), `EXCEEDED` (>100%)

#### Update Budget

```http
PUT /api/budgets/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Delete Budget

```http
DELETE /api/budgets/{id}
Authorization: Bearer <access_token>
```

---

## Notification Service APIs (8085)

Base URL: `http://localhost:8085`

### Notification Endpoints

#### Get All Notifications

```http
GET /api/notifications?page=0&size=20
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Task Completed",
        "message": "You completed: Complete project documentation",
        "type": "TASK",
        "read": false,
        "createdAt": "2026-09-10T15:30:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  }
}
```

#### Get Unread Notifications

```http
GET /api/notifications/unread
Authorization: Bearer <access_token>
```

#### Get Unread Count

```http
GET /api/notifications/unread/count
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### Mark as Read

```http
PATCH /api/notifications/{id}/read
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark All as Read

```http
PATCH /api/notifications/read-all
Authorization: Bearer <access_token>
```

#### Delete Notification

```http
DELETE /api/notifications/{id}
Authorization: Bearer <access_token>
```

### Insights Endpoints

#### Get Today's Insights

```http
GET /api/insights/today
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-09-10",
    "tasksCompleted": 5,
    "exercisesCompleted": 1,
    "totalExpenses": 150.00,
    "healthLogRecorded": true,
    "message": "Great job! You completed 5 tasks today."
  }
}
```

#### Get Activity Streaks

```http
GET /api/insights/streaks
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "taskStreak": {
      "current": 7,
      "longest": 15,
      "lastActivity": "2026-09-10"
    },
    "exerciseStreak": {
      "current": 3,
      "longest": 10,
      "lastActivity": "2026-09-10"
    },
    "healthLogStreak": {
      "current": 14,
      "longest": 30,
      "lastActivity": "2026-09-10"
    }
  }
}
```

#### Get Weekly Insights

```http
GET /api/insights/weekly
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "week": "2026-09-04 to 2026-09-10",
    "tasksCompleted": 25,
    "exercisesDone": 4,
    "totalExpenses": 800.00,
    "averageSleep": 7.2,
    "productivityScore": 85
  }
}
```

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "content": [ /* items */ ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "size": 10
  }
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### Common Error Messages

- `"Invalid credentials"` - Wrong email/password
- `"Token expired"` - Access token expired, use refresh token
- `"User already exists"` - Email already registered
- `"Resource not found"` - Task/Expense/etc. doesn't exist
- `"Access denied"` - Admin-only endpoint
- `"Rate limit exceeded"` - Too many requests
- `"Validation error"` - Invalid input data

---

## Testing with curl

### Example: Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the accessToken from response

# 3. Create Task
curl -X POST http://localhost:8082/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"HIGH","status":"TODO"}'

# 4. Get Tasks
curl -X GET "http://localhost:8082/api/tasks" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Postman Collection

For easier testing, import the Postman collection (if available) which includes:
- Pre-configured requests
- Environment variables
- Authentication flow
- Example requests for all endpoints

---

**Need Help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or service-specific READMEs.
