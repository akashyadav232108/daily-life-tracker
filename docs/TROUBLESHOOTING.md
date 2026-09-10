# Troubleshooting Guide

Common issues and solutions for Daily Life Tracker local development.

## Table of Contents

- [Infrastructure Issues](#infrastructure-issues)
- [Backend Service Issues](#backend-service-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Kafka Issues](#kafka-issues)
- [Redis Issues](#redis-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Email Issues](#email-issues)

---

## Infrastructure Issues

### Port Already in Use

**Problem**: "Address already in use" or "Port xxxx is already in use"

**Solution**:

**Windows:**
```powershell
# Find process using port 8081
netstat -ano | findstr :8081

# Kill the process (use PID from above)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use
sudo kill -9 $(sudo lsof -t -i:8081)
```

**Prevention**: Check if service is already running before starting another instance.

---

### Java Version Mismatch

**Problem**: "Unsupported class file major version" or wrong Java version

**Solution**:

```bash
# Check Java version
java -version

# Should show version 21.x.x
```

**Fix**:
1. Install Java 21 from [Adoptium](https://adoptium.net/)
2. Set JAVA_HOME environment variable
3. Restart terminal/IDE

**Windows:**
```powershell
# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.x.x"
```

**Mac/Linux:**
```bash
# Add to ~/.bash_profile or ~/.zshrc
export JAVA_HOME=/path/to/jdk-21
export PATH=$JAVA_HOME/bin:$PATH
```

---

### Maven Dependency Download Fails

**Problem**: "Could not resolve dependencies" or slow/failing Maven downloads

**Solution**:

1. **Clear Maven cache**:
```bash
# Delete .m2 repository (CAUTION: Removes all cached dependencies)
rm -rf ~/.m2/repository

# Or on Windows
rmdir /s /q %USERPROFILE%\.m2\repository
```

2. **Use a Maven mirror** (add to `~/.m2/settings.xml`):
```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

3. **Force update**:
```bash
mvn clean install -U
```

---

## Backend Service Issues

### Service Won't Start

**Problem**: Service fails to start with no clear error

**Checklist**:
1. ✅ MySQL is running
2. ✅ Redis is running
3. ✅ Kafka is running
4. ✅ All environment variables are set
5. ✅ Port is not in use
6. ✅ Database exists

**Debug**:
```bash
# Run with debug logs
mvn spring-boot:run -Dspring-boot.run.arguments=--logging.level.root=DEBUG

# Check application logs
# Look for errors in console output
```

---

### Connection Pool Exhausted

**Problem**: "HikariPool - Connection is not available" or "Timeout waiting for connection"

**Cause**: Too many unclosed database connections or insufficient pool size

**Solution**:

Add to `application.yml`:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

**Long-term fix**: Review code for unclosed connections or use try-with-resources.

---

### Bean Creation Failed

**Problem**: "Error creating bean with name 'entityManagerFactory'"

**Cause**: Usually a configuration or dependency issue

**Solutions**:

1. **Check database connection**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tracker_auth?useSSL=false
    username: tracker_user
    password: correct_password
```

2. **Verify JPA dependencies** in `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

3. **Check entity classes** for syntax errors

---

### Kafka Connection Failed

**Problem**: "Connection to node -1 could not be established"

**Solution**: See [Kafka Issues](#kafka-issues) section below.

---

## Frontend Issues

### npm install Fails

**Problem**: Permission errors or dependency conflicts

**Solutions**:

1. **Clear npm cache**:
```bash
npm cache clean --force
```

2. **Delete node_modules and package-lock.json**:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Use latest npm**:
```bash
npm install -g npm@latest
```

4. **Windows permission issues**:
```powershell
# Run as Administrator or use:
npm install --no-optional
```

---

### Vite Build Errors

**Problem**: "Failed to parse source" or ES6 syntax errors

**Solution**:

1. **Check Node.js version**:
```bash
node -v  # Should be 18+ or 20+
```

2. **Clear Vite cache**:
```bash
rm -rf node_modules/.vite
npm run dev
```

3. **Check for missing dependencies**:
```bash
npm install
```

---

### CORS Errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Backend not allowing frontend origin

**Solution**:

Check backend CORS configuration (should already be configured):

```java
// CorsConfig.java (Auth Service and others)
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

**If using different port**: Update `allowedOrigins` in all services.

---

### Axios Network Errors

**Problem**: "Network Error" or "Request failed"

**Checklist**:
1. ✅ Backend service is running
2. ✅ Correct base URL in `.env`
3. ✅ No firewall blocking requests

**Debug**:

Check browser console (F12) → Network tab for:
- Request URL
- Status code
- Response body

**Common fixes**:
```bash
# Verify .env file
cat frontend/tracker-app/.env

# Should contain:
VITE_AUTH_SERVICE_URL=http://localhost:8081
VITE_TASK_SERVICE_URL=http://localhost:8082
# etc.
```

**After changing .env**: Restart Vite dev server (`npm run dev`).

---

## Database Issues

### MySQL Connection Refused

**Problem**: "Connection refused" or "Can't connect to MySQL server"

**Solution**:

1. **Check if MySQL is running**:

**Windows:**
```powershell
# Check service status
Get-Service MySQL*

# Start service
Start-Service MySQL80
```

**Mac:**
```bash
# Check status
brew services list

# Start MySQL
brew services start mysql
```

**Linux:**
```bash
# Check status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

2. **Verify port**:
```bash
mysql -u root -p -h localhost -P 3306
```

3. **Check firewall**: Ensure port 3306 is not blocked.

---

### Access Denied for User

**Problem**: "Access denied for user 'tracker_user'@'localhost'"

**Solutions**:

1. **Verify credentials**:
```sql
mysql -u root -p

-- Check user exists
SELECT User, Host FROM mysql.user WHERE User = 'tracker_user';

-- Reset password if needed
ALTER USER 'tracker_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

2. **Grant permissions**:
```sql
GRANT ALL PRIVILEGES ON tracker_*.* TO 'tracker_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update application.yml or .env** with correct password.

---

### Database Does Not Exist

**Problem**: "Unknown database 'tracker_auth'"

**Solution**:
```sql
mysql -u root -p

CREATE DATABASE tracker_auth;
CREATE DATABASE tracker_tasks;
CREATE DATABASE tracker_health;
CREATE DATABASE tracker_expenses;
CREATE DATABASE tracker_notifications;

-- Verify
SHOW DATABASES;
```

---

### Table Already Exists Error

**Problem**: "Table 'users' already exists" during startup

**Cause**: JPA trying to create tables that already exist

**Solution**:

Update `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Use 'update' instead of 'create'
```

Or drop and recreate database (⚠️ **Deletes all data**):
```sql
DROP DATABASE tracker_auth;
CREATE DATABASE tracker_auth;
```

---

## Kafka Issues

### Zookeeper Won't Start

**Problem**: "Address already in use: bind" for Zookeeper

**Solution**:

**Check if already running**:
```bash
# Windows
netstat -ano | findstr :2181

# Mac/Linux
lsof -ti:2181
```

**Kill existing process** or use the running one.

---

### Kafka Server Won't Start

**Problem**: "java.net.BindException: Address already in use"

**Solutions**:

1. **Check if already running**:
```bash
# Windows
netstat -ano | findstr :9092

# Mac/Linux
lsof -ti:9092
```

2. **Check Zookeeper is running first** (Kafka needs Zookeeper).

3. **Clear Kafka logs** (⚠️ deletes all messages):
```bash
# Stop Kafka
# Delete kafka-logs directory
rm -rf /tmp/kafka-logs  # Mac/Linux
# Or C:\tmp\kafka-logs on Windows

# Restart Kafka
```

---

### Producer/Consumer Can't Connect

**Problem**: "Connection to node -1 could not be established"

**Checklist**:
1. ✅ Kafka is running
2. ✅ Correct bootstrap servers URL

**Solution**:

Verify in `application.yml`:
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092  # Check this matches Kafka config
```

Test connection:
```bash
# List topics to verify connection
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

---

### Topics Not Created

**Problem**: "Unknown topic" errors

**Solution**:

Kafka auto-creates topics by default, but you can create manually:

```bash
# Windows
bin\windows\kafka-topics.bat --create --topic user-events --bootstrap-server localhost:9092

# Mac/Linux
bin/kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092
```

---

### Messages Not Being Consumed

**Problem**: Events published but notification service not receiving them

**Debug**:

1. **Check consumer is running** (Notification Service)

2. **Check consumer group**:
```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group notification-service-group
```

Look for high LAG - means messages are not being consumed.

3. **Check topic has messages**:
```bash
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning
```

4. **Check logs** in Notification Service for errors.

---

## Redis Issues

### Redis Connection Refused

**Problem**: "Connection refused" to Redis

**Solution**:

1. **Check if Redis is running**:
```bash
redis-cli ping
# Should return: PONG
```

2. **Start Redis**:

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
# Or:
redis-server
```

3. **Check port**:
```bash
# Default port is 6379
redis-cli -h localhost -p 6379 ping
```

4. **Verify in application**:
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

---

### OTP Not Stored/Retrieved

**Problem**: OTP verification always fails

**Debug**:

```bash
redis-cli

# Check if OTP was stored
KEYS *
# Should see: otp:email@example.com

# Check OTP value
GET otp:email@example.com

# Check TTL (time to live)
TTL otp:email@example.com
# Should be positive number (seconds remaining)
```

**Solution**:
- Verify Redis is connected (see above)
- Check OTP expiration time in code (default: 5 minutes)
- Ensure clock sync between services

---

## Authentication Issues

### JWT Token Expired

**Problem**: "Token expired" errors frequently

**Cause**: Short token expiration time

**Solution**:

Increase token validity in Auth Service:
```properties
JWT_ACCESS_EXPIRATION=3600000   # 1 hour in ms
JWT_REFRESH_EXPIRATION=604800000  # 7 days in ms
```

**Frontend**: Implement token refresh logic (should already be implemented).

---

### Token Invalid or Malformed

**Problem**: "JWT signature does not match" or "Invalid token"

**Causes**:
1. Different JWT_SECRET in different services
2. Token tampering
3. Token from different environment

**Solution**:

**Ensure all services use the same JWT_SECRET**:
```bash
# Check each service's configuration
echo $JWT_SECRET

# Or in application.yml
jwt:
  secret: ${JWT_SECRET}
```

**Generate strong secret** (if needed):
```bash
# Generate 256-bit random string
openssl rand -base64 32
```

---

### Login Returns 401

**Problem**: Valid credentials return "Invalid credentials"

**Debug**:

1. **Check user exists**:
```sql
USE tracker_auth;
SELECT * FROM users WHERE email = 'your.email@example.com';
```

2. **Check password encoding**:
- Passwords should be BCrypt hashed
- Raw passwords won't match

3. **Check logs** in Auth Service for detailed error.

4. **Test with new user**:
- Register new account
- Try logging in with that account

---

### Multi-tab Sync Not Working

**Problem**: Login/logout doesn't sync across tabs

**Cause**: localStorage event listener issue

**Solution**:

Check browser console for errors. The sync logic is in `App.jsx`:

```javascript
// Should see these logs in console when switching tabs
// "Login from another tab → syncing..."
// "Logout from another tab → syncing..."
```

**Debug**: Open DevTools → Application → Local Storage and verify:
- `event` key exists
- Value changes on login/logout

**Workaround**: Manually refresh the other tab.

---

## API Issues

### 404 Not Found

**Problem**: API endpoint returns 404

**Checklist**:
1. ✅ Correct URL (check base URL and endpoint)
2. ✅ Service is running
3. ✅ Endpoint exists in that service

**Common mistakes**:
```javascript
// ❌ Wrong
http://localhost:8081/api/tasks  // Tasks are in 8082!

// ✅ Correct
http://localhost:8082/api/tasks
```

**Verify endpoints**:
```bash
# Check service is running
curl http://localhost:8082/actuator/health

# Test endpoint
curl -X GET http://localhost:8082/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 400 Bad Request

**Problem**: Request fails with validation errors

**Cause**: Missing required fields or invalid data format

**Solution**:

1. **Check API documentation** for required fields
2. **Verify request body** matches expected schema
3. **Check date formats** (should be ISO 8601: `YYYY-MM-DDTHH:mm:ss`)

**Example**:
```json
// ❌ Wrong
{
  "title": "Task"
  // Missing priority, status
}

// ✅ Correct
{
  "title": "Task",
  "priority": "HIGH",
  "status": "TODO"
}
```

---

### 500 Internal Server Error

**Problem**: API returns 500 error

**Debug**:

1. **Check service logs** for stack trace
2. **Common causes**:
   - Database connection lost
   - Null pointer exception
   - Missing environment variable

3. **Restart service** if needed

---

### Rate Limiting 429

**Problem**: "Too many requests" error

**Cause**: Rate limit exceeded (configured in services)

**Solution**:

1. **Wait**: Rate limits reset after time window (e.g., 1 minute)
2. **Increase limits** (for development):

Edit `RateLimitConfig.java` or `application.yml`:
```yaml
rate:
  limit:
    requests: 1000  # Increase this
    duration: 60    # seconds
```

3. **Restart service** after changing config.

---

## Email Issues

### Emails Not Sending

**Problem**: Welcome emails or OTPs not received

**Checklist**:
1. ✅ SMTP configured correctly
2. ✅ Email credentials valid
3. ✅ Less secure apps / App password enabled (Gmail)

**Gmail Setup**:

1. Enable 2-Factor Authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use app password in config:

```properties
SENDER_MAIL=your.email@gmail.com
MAIL_PASSWORD=your_16_character_app_password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

**Test email sending**:

Check logs in Auth Service or Notification Service for:
```
✅ "Email sent successfully to..."
❌ "Failed to send email: Authentication failed"
```

---

### Authentication Failed (Email)

**Problem**: "Authentication failed" for SMTP

**Solutions**:

1. **Gmail**: Use App Password (not account password)
2. **Other providers**: Check SMTP settings
3. **Enable "Less secure apps"** (not recommended, use App Password instead)

**Verify config**:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SENDER_MAIL}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

---

## General Debugging Tips

### Enable Debug Logging

**application.yml**:
```yaml
logging:
  level:
    root: INFO
    com.tracker: DEBUG  # Your package
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### Check Service Health

```bash
# All services expose /actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
# etc.
```

### Monitor All Logs

Use a terminal multiplexer like **tmux** or **iTerm2** to view all service logs simultaneously.

### Use Postman/Insomnia

Test APIs independently of frontend to isolate issues.

### Clear Browser Cache

Sometimes helps with frontend issues:
- Chrome: Ctrl+Shift+Delete
- Clear cache and cookies
- Hard refresh: Ctrl+F5

---

## Still Having Issues?

1. **Check service-specific READMEs** for detailed configuration
2. **Review logs** carefully - error messages usually indicate the problem
3. **Verify environment variables** are set correctly
4. **Restart everything** - sometimes the simplest solution works
5. **Create an issue** with:
   - What you're trying to do
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment (OS, Java version, etc.)

---

## Quick Restart Checklist

When things get messy, restart everything in this order:

1. ✅ **Stop all services** (Ctrl+C in all terminals)
2. ✅ **Restart MySQL**: `brew services restart mysql` (Mac) or restart MySQL service (Windows)
3. ✅ **Restart Redis**: `brew services restart redis` or `redis-server`
4. ✅ **Restart Zookeeper** then **Kafka**
5. ✅ **Start backend services** (Auth → Others → Notification last)
6. ✅ **Start frontend**: `npm run dev`
7. ✅ **Clear browser cache** and reload

---

**Related Documentation**:
- [Setup Guide](SETUP.md)
- [API Documentation](API.md)
- [Database Schema](DATABASE-SCHEMA.md)
- [Kafka Events](KAFKA-EVENTS.md)
