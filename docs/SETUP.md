# Setup Guide

Complete guide to setting up the Daily Life Tracker locally.

## Table of Contents
- [Prerequisites Installation](#prerequisites-installation)
- [Database Setup](#database-setup)
- [Kafka Setup](#kafka-setup)
- [Redis Setup](#redis-setup)
- [Service Configuration](#service-configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [First-Time Setup](#first-time-setup)

---

## Prerequisites Installation

### 1. Java 21

**Download:**
- [Eclipse Temurin JDK 21](https://adoptium.net/)
- [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)

**Verify Installation:**
```bash
java -version
# Should show: openjdk version "21.x.x"
```

### 2. Maven 3.8+

**Windows:**
```powershell
# Using Chocolatey
choco install maven

# Or download from https://maven.apache.org/download.cgi
```

**Mac:**
```bash
brew install maven
```

**Verify Installation:**
```bash
mvn -version
```

### 3. Node.js 18+ and npm

**Download:** https://nodejs.org/ (LTS version recommended)

**Verify Installation:**
```bash
node -v  # Should be 18.x or higher
npm -v   # Should be 9.x or higher
```

### 4. MySQL 8.0+

**Windows:**
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use XAMPP/WAMP

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

**Verify Installation:**
```bash
mysql --version
```

### 5. Redis 7.0+

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use Windows Subsystem for Linux (WSL)

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Verify Installation:**
```bash
redis-cli ping
# Should return: PONG
```

### 6. Apache Kafka 3.0+

**Download:** https://kafka.apache.org/downloads

**Extract and Setup:**
```bash
# Extract the downloaded file
tar -xzf kafka_2.13-3.x.x.tgz
cd kafka_2.13-3.x.x

# Or on Windows, extract the zip file
```

---

## Database Setup

### Step 1: Login to MySQL

```bash
mysql -u root -p
# Enter your root password
```

### Step 2: Create Databases

```sql
-- Create databases for each service
CREATE DATABASE tracker_auth;
CREATE DATABASE tracker_tasks;
CREATE DATABASE tracker_health;
CREATE DATABASE tracker_expenses;
CREATE DATABASE tracker_notifications;

-- Verify databases created
SHOW DATABASES;
```

### Step 3: Create User (Optional but Recommended)

```sql
-- Create a dedicated user for the application
CREATE USER 'tracker_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant all privileges on tracker databases
GRANT ALL PRIVILEGES ON tracker_auth.* TO 'tracker_user'@'localhost';
GRANT ALL PRIVILEGES ON tracker_tasks.* TO 'tracker_user'@'localhost';
GRANT ALL PRIVILEGES ON tracker_health.* TO 'tracker_user'@'localhost';
GRANT ALL PRIVILEGES ON tracker_expenses.* TO 'tracker_user'@'localhost';
GRANT ALL PRIVILEGES ON tracker_notifications.* TO 'tracker_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 4: Test Connection

```bash
mysql -u tracker_user -p tracker_auth
# Enter password and verify connection
```

> **Note:** Tables will be created automatically when you run each service for the first time (Spring Boot auto-creates tables based on JPA entities).

---

## Kafka Setup

### Step 1: Start Zookeeper

Open a terminal and navigate to your Kafka directory:

**Windows:**
```powershell
cd C:\kafka_2.13-3.x.x
bin\windows\zookeeper-server-start.bat config\zookeeper.properties
```

**Mac/Linux:**
```bash
cd /path/to/kafka_2.13-3.x.x
bin/zookeeper-server-start.sh config/zookeeper.properties
```

> Keep this terminal open - Zookeeper must run continuously.

### Step 2: Start Kafka Server

Open a **new terminal** in the Kafka directory:

**Windows:**
```powershell
bin\windows\kafka-server-start.bat config\server.properties
```

**Mac/Linux:**
```bash
bin/kafka-server-start.sh config/server.properties
```

> Keep this terminal open - Kafka must run continuously.

### Step 3: Create Topics (Optional)

Kafka will auto-create topics, but you can create them manually:

**Windows:**
```powershell
bin\windows\kafka-topics.bat --create --topic user-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic task-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic health-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic expense-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

**Mac/Linux:**
```bash
bin/kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin/kafka-topics.sh --create --topic task-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin/kafka-topics.sh --create --topic health-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin/kafka-topics.sh --create --topic expense-events --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

### Step 4: Verify Topics

**Windows:**
```powershell
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
```

**Mac/Linux:**
```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

---

## Redis Setup

### Start Redis Server

**Windows:**
```powershell
redis-server
```

**Mac:**
```bash
brew services start redis
# Or run in foreground:
redis-server
```

**Linux:**
```bash
sudo systemctl start redis
# Or run in foreground:
redis-server
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

---

## Service Configuration

Each service needs environment variables. You can:
1. Set them in your IDE (IntelliJ IDEA, VS Code)
2. Create a `.env` file (if using Spring Boot with dotenv library)
3. Set them in `application.yml` (not recommended for sensitive data)

### Auth Service Configuration (Port 8081)

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/tracker_auth?useSSL=false&serverTimezone=UTC
DB_USERNAME=tracker_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_must_be_at_least_256_bits_long_use_strong_random_string
JWT_ACCESS_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Email (Gmail example)
SENDER_MAIL=your.email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

> **Gmail Setup:** Enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords)

### Task Service Configuration (Port 8082)

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/tracker_tasks?useSSL=false&serverTimezone=UTC
DB_USERNAME=tracker_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=same_as_auth_service_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### Health Service Configuration (Port 8083)

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/tracker_health?useSSL=false&serverTimezone=UTC
DB_USERNAME=tracker_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=same_as_auth_service_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### Expense Service Configuration (Port 8084)

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/tracker_expenses?useSSL=false&serverTimezone=UTC
DB_USERNAME=tracker_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=same_as_auth_service_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### Notification Service Configuration (Port 8085)

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/tracker_notifications?useSSL=false&serverTimezone=UTC
DB_USERNAME=tracker_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=same_as_auth_service_secret

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_CONSUMER_GROUP=notification-service-group

# Email (same as auth service)
MAIL_USERNAME=your.email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

### Frontend Configuration

Create `frontend/tracker-app/.env`:

```properties
VITE_AUTH_SERVICE_URL=http://localhost:8081
VITE_TASK_SERVICE_URL=http://localhost:8082
VITE_HEALTH_SERVICE_URL=http://localhost:8083
VITE_EXPENSE_SERVICE_URL=http://localhost:8084
VITE_NOTIFICATION_SERVICE_URL=http://localhost:8085
```

---

## Running the Application

### Order of Starting Services

1. **Infrastructure First:**
   - MySQL (should be running)
   - Redis (start: `redis-server`)
   - Kafka (Zookeeper → Kafka Server)

2. **Backend Services (any order):**
   - Auth Service (8081) - **Start this first** (other services depend on auth)
   - Task Service (8082)
   - Health Service (8083)
   - Expense Service (8084)
   - Notification Service (8085) - **Start this last** (consumes events from others)

3. **Frontend:**
   - Tracker App (5173)

### Running Backend Services

Open a separate terminal for each service:

```bash
# Terminal 1 - Auth Service
cd auth-service
mvn clean install
mvn spring-boot:run

# Terminal 2 - Task Service
cd backend/task-service
mvn clean install
mvn spring-boot:run

# Terminal 3 - Health Service
cd backend/health-service
mvn clean install
mvn spring-boot:run

# Terminal 4 - Expense Service
cd backend/expense-service
mvn clean install
mvn spring-boot:run

# Terminal 5 - Notification Service
cd backend/notification-service
mvn clean install
mvn spring-boot:run
```

> **First-time run:** Use `mvn clean install` to download dependencies. Subsequent runs can use just `mvn spring-boot:run`.

### Running Frontend

```bash
cd frontend/tracker-app

# First time only
npm install

# Start dev server
npm run dev
```

---

## Verification

### 1. Check Service Health

Open your browser or use curl:

```bash
# Auth Service
curl http://localhost:8081/actuator/health

# Task Service
curl http://localhost:8082/actuator/health

# Health Service
curl http://localhost:8083/actuator/health

# Expense Service
curl http://localhost:8084/actuator/health

# Notification Service
curl http://localhost:8085/actuator/health
```

All should return: `{"status":"UP"}`

### 2. Check Frontend

Open: http://localhost:5173

You should see the login page.

### 3. Check Kafka Topics

```bash
# List topics
bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# Check messages in a topic (optional)
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning
```

### 4. Check Redis

```bash
redis-cli
> KEYS *
> EXIT
```

---

## First-Time Setup

### 1. Register Your First User

1. Go to http://localhost:5173
2. Click **Register**
3. Fill in details:
   - Name
   - Email
   - Password
4. Submit

You should receive a welcome email (if SMTP is configured).

### 2. Create Admin User (Optional)

Connect to MySQL and update the user role:

```sql
USE tracker_auth;

-- View all users
SELECT id, name, email, role FROM users;

-- Promote a user to admin
UPDATE users SET role = 'ADMIN' WHERE email = 'your.email@example.com';

-- Verify
SELECT id, name, email, role FROM users WHERE role = 'ADMIN';
```

### 3. Test the Application

1. Login with your account
2. Navigate to Dashboard
3. Create a task
4. Log health data
5. Add an expense
6. Check notifications

---

## Useful Development Commands

### Maven Commands

```bash
# Clean build
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Run tests only
mvn test

# Package as JAR
mvn package
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Commands

```bash
# Backup a database
mysqldump -u tracker_user -p tracker_auth > backup_auth.sql

# Restore a database
mysql -u tracker_user -p tracker_auth < backup_auth.sql

# Drop and recreate database (CAUTION: Deletes all data!)
mysql -u root -p -e "DROP DATABASE tracker_auth; CREATE DATABASE tracker_auth;"
```

### Redis Commands

```bash
# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# Delete all keys (CAUTION!)
FLUSHALL

# Monitor real-time commands
MONITOR
```

### Kafka Commands

```bash
# View topic messages
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning

# Delete a topic
bin/kafka-topics.sh --delete --topic topic-name --bootstrap-server localhost:9092

# Describe a topic
bin/kafka-topics.sh --describe --topic user-events --bootstrap-server localhost:9092
```

---

## Next Steps

- Review [API Documentation](API.md) for endpoint details
- Check [Kafka Events](KAFKA-EVENTS.md) for event flows
- See [Database Schema](DATABASE-SCHEMA.md) for data models
- Visit [Troubleshooting](TROUBLESHOOTING.md) if you encounter issues

---

**Need Help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue.
