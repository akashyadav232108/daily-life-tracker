# Expense Service

Manages expenses, monthly budgets, CSV import, and spend summaries.

**Port:** 8084

## Architecture

```mermaid
flowchart LR
  Client --> Exp[expense-service]
  Exp --> DB[(MySQL)]
  Exp --> Redis[(Redis)]
  Exp --> Kafka[Kafka: expense-events]
```

## Responsibilities

- CRUD for expenses
- Monthly budgets per category
- Budget status and threshold alerts (80% / 100%)
- CSV bulk import
- Monthly spend summary (Redis-cached)
- Publishes events on expense add and budget exceeded

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses` | List expenses |
| GET | `/api/expenses/{id}` | Get expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| POST | `/api/expenses/import` | Import CSV |
| GET | `/api/expenses/summary/monthly` | Monthly summary |
| POST | `/api/budgets` | Create budget |
| GET | `/api/budgets` | List budgets |
| GET | `/api/budgets/status` | Budget vs spend |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

Admin routes under `/api/expenses/admin`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL |
| `JWT_SECRET` | Auth validation |
| `REDIS_HOST`, `REDIS_PORT` | Monthly spend cache |
| `KAFKA_BOOTSTRAP_SERVERS` | Event publishing |
| `EXPENSE_EVENTS_TOPIC` | Kafka topic (default: `expense-events`) |

## Run

```bash
mvn spring-boot:run
```
