# Notification Service

> **[← Back to Main Project](../../README.md)** | **[API Docs](../../docs/API.md#notification-service-apis-8085)** | **[Architecture](../../docs/ARCHITECTURE.md)**

Delivers in-app notifications, email alerts, daily insights, and streak tracking.

**Port:** 8085

## Architecture

```mermaid
flowchart LR
  Kafka[Kafka events] --> Notif[notification-service]
  Client --> Notif
  Notif --> DB[(MySQL)]
  Notif --> Mail[SMTP Email]
```

## Responsibilities

- Consumes events from auth, task, health, and expense services
- Stores and serves in-app notifications
- Sends welcome and alert emails
- Daily insights and activity streaks
- Admin broadcast and notification stats

## Kafka Topics Consumed

| Topic | Source | Triggers |
|-------|--------|----------|
| `user-events` | auth-service | Welcome email |
| `task-events` | task-service | Task notifications |
| `health-events` | health-service | Health / exercise alerts |
| `expense-events` | expense-service | Budget exceeded alerts |

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread` | Unread list |
| GET | `/api/notifications/unread/count` | Unread count |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/{id}` | Delete notification |
| GET | `/api/insights/today` | Today's insights |
| GET | `/api/insights/streaks` | Activity streaks |
| GET | `/api/insights/weekly` | Weekly insights |

Admin routes under `/api/notifications/admin`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL |
| `JWT_SECRET` | Auth validation |
| `KAFKA_BOOTSTRAP_SERVERS` | Event consumption |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Email sending |
| `KAFKA_CONSUMER_GROUP` | Consumer group |

## Database

Creates tables automatically in `tracker_notifications`:
- `notifications` - In-app notifications
- `activity_streaks` - User streak tracking

**Full Schema**: [docs/DATABASE-SCHEMA.md](../../docs/DATABASE-SCHEMA.md#notification-service-database-tracker_notifications)

## Run

```bash
# From backend/notification-service directory
mvn spring-boot:run
```

**Note**: Start this service **after** other services as it consumes their events.

## Troubleshooting

**Common issues:**
- Not receiving events: Check Kafka is running and other services are publishing
- Email not sending: Verify SMTP credentials (use Gmail App Password)
- Consumer lag: Check Kafka consumer group status

**More help**: [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)

## Documentation

- [Complete API Reference](../../docs/API.md#notification-service-apis-8085)
- [Kafka Events Consumed](../../docs/KAFKA-EVENTS.md#consumer-services)
