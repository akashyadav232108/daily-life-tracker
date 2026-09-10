# Health Service

> **[← Back to Main Project](../../README.md)** | **[API Docs](../../docs/API.md#health-service-apis-8083)** | **[Architecture](../../docs/ARCHITECTURE.md)**

Tracks daily health logs, custom metrics, exercise plans, and workout logs.

**Port:** 8083

## Architecture

```mermaid
flowchart LR
  Client --> Health[health-service]
  Health --> DB[(MySQL)]
  Health --> Kafka[Kafka: health-events]
```

## Responsibilities

- Daily health logs (mood, sleep, notes)
- Custom health metrics and metric logs
- Exercise plan builder and activation
- Exercise log tracking
- Weekly health summary
- Publishes events on health and exercise activity

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health/logs` | Create health log |
| GET | `/api/health/logs` | List logs |
| GET | `/api/health/logs/today` | Today's log |
| GET | `/api/health/summary/weekly` | Weekly summary |
| POST | `/api/health/metrics` | Create metric |
| GET | `/api/health/metrics` | List metrics |
| POST | `/api/exercises/plans` | Create exercise plan |
| GET | `/api/exercises/plans/active` | Active plan |
| GET | `/api/exercises/plans/today` | Today's workout |
| POST | `/api/exercises/logs` | Log workout |
| GET | `/api/exercises/logs/today` | Today's logs |

Admin routes under `/api/health/admin` and `/api/exercises/admin`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL |
| `JWT_SECRET` | Auth validation |
| `REDIS_HOST`, `REDIS_PORT` | Rate limiting |
| `KAFKA_BOOTSTRAP_SERVERS` | Event publishing |

## Database

Creates tables automatically in `tracker_health`:
- `health_logs` - Daily health tracking
- `custom_health_metrics` - User-defined metrics
- `exercise_plans` - Workout plans
- `plan_exercises` - Exercises in plans
- `exercise_logs` - Completed workouts

**Full Schema**: [docs/DATABASE-SCHEMA.md](../../docs/DATABASE-SCHEMA.md#health-service-database-tracker_health)

## Run

```bash
# From backend/health-service directory
mvn spring-boot:run
```

## Troubleshooting

**Common issues:**
- Database not found: Create `tracker_health` database
- Kafka errors: Ensure Kafka is running on port 9092

**More help**: [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)

## Documentation

- [Complete API Reference](../../docs/API.md#health-service-apis-8083)
- [Kafka Events Published](../../docs/KAFKA-EVENTS.md#health-events)
