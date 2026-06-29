# Task Service

Manages user tasks with filtering, completion tracking, and admin oversight.

**Port:** 8082

## Architecture

```mermaid
flowchart LR
  Client --> Task[task-service]
  Task --> DB[(MySQL)]
  Task --> Redis[(Redis)]
  Task --> Kafka[Kafka: task-events]
```

## Responsibilities

- CRUD for tasks
- Mark complete / reopen
- Filter by status, priority, due date
- Publishes events on task create and complete
- Admin task lookup and platform stats

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks (filterable) |
| GET | `/api/tasks/{id}` | Get task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Complete task |
| PATCH | `/api/tasks/{id}/reopen` | Reopen task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/admin/users/{userId}` | User tasks (admin) |
| GET | `/api/tasks/admin/stats` | Platform stats (admin) |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL |
| `JWT_SECRET` | Auth validation |
| `REDIS_HOST`, `REDIS_PORT` | Rate limiting |
| `KAFKA_BOOTSTRAP_SERVERS` | Event publishing |

## Run

```bash
mvn spring-boot:run
```
