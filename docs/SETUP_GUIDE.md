# Hospital Management System - Setup Guide

This guide provides detailed instructions for setting up the Hospital Management System from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Database Setup](#database-setup)
3. [Redis Setup](#redis-setup)
4. [Backend Setup](#backend-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB free space
- **OS**: Linux, macOS, or Windows 10+

### Recommended Requirements
- **CPU**: 4 cores or more
- **RAM**: 8 GB or more
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 20.04 LTS or later

### Software Dependencies
- Node.js v20.x or later
- npm v9.x or later
- PostgreSQL v14.x or later
- Redis v7.x or later
- Git

## Database Setup

### Installing PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

### Creating the Database

1. Switch to postgres user:
```bash
sudo -u postgres psql
```

2. Create database and user:
```sql
CREATE DATABASE hospital_management;
CREATE USER hospital_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hospital_management TO hospital_admin;
\q
```

3. Run the schema:
```bash
cd backend
psql -U hospital_admin -d hospital_management -f src/database/schema.sql
```

4. (Optional) Load seed data:
```bash
psql -U hospital_admin -d hospital_management -f src/database/seed.sql
```

### Verifying Database Setup

```bash
psql -U hospital_admin -d hospital_management -c "\dt"
```

You should see a list of tables including users, patients, visits, etc.

## Redis Setup

### Installing Redis

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Windows
Download from: https://github.com/microsoftarchive/redis/releases

### Verifying Redis

```bash
redis-cli ping
```

Should return: `PONG`

### Redis Configuration (Optional)

Edit `/etc/redis/redis.conf`:

```conf
# Set password
requirepass your_redis_password

# Memory limit
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
sudo systemctl restart redis
```

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Create Logs Directory

```bash
mkdir -p logs
```

## Environment Configuration

### 1. Create Environment File

```bash
cd backend
cp .env.example .env
```

### 2. Edit Environment Variables

Open `.env` and configure:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_management
DB_USER=hospital_admin
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # Leave empty if no password

# JWT Configuration
JWT_SECRET=generate_a_strong_random_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
```

### 3. Generate JWT Secret

Use a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

## Running the Application

### Development Mode

```bash
# From backend directory
npm run dev
```

The server will start with hot-reload enabled at http://localhost:5000

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Verify Server is Running

```bash
curl http://localhost:5000/api/v1/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Testing the API

### 1. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "Admin@123"
  }'
```

Save the returned `accessToken`.

### 2. Test Protected Endpoint

```bash
curl http://localhost:5000/api/v1/patients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Database Connection Error

**Error**: `connection refused`

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database credentials in `.env`

3. Check PostgreSQL is listening on the correct port:
   ```bash
   sudo netstat -plnt | grep 5432
   ```

### Redis Connection Error

**Error**: `Redis connection failed`

**Solution**:
1. Check Redis is running:
   ```bash
   sudo systemctl status redis
   ```

2. Test connection:
   ```bash
   redis-cli ping
   ```

3. Verify Redis password in `.env` if configured

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
1. Find and kill the process:
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. Or change the PORT in `.env`:
   ```env
   PORT=5001
   ```

### Permission Denied for Logs

**Error**: `EACCES: permission denied, mkdir 'logs'`

**Solution**:
```bash
mkdir -p logs
chmod 755 logs
```

### JWT Token Invalid

**Error**: `Invalid or expired token`

**Solution**:
1. Verify JWT_SECRET is set in `.env`
2. Ensure token is sent in correct format: `Bearer <token>`
3. Check token hasn't expired (default: 24h)

### TypeScript Compilation Error

**Error**: `Cannot find module`

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. **Create Admin User**:
   - Use seed data, or
   - Register via API: `POST /api/v1/auth/register`

2. **Test Key Workflows**:
   - Register a patient
   - Check-in patient
   - Start consultation
   - Issue prescription
   - Order lab tests

3. **Configure Notifications**:
   - Test WebSocket connection
   - Verify real-time notifications

4. **Set Up Monitoring**:
   - Check logs in `logs/` directory
   - Monitor database queries
   - Track Redis memory usage

5. **Security Hardening**:
   - Change default passwords
   - Enable HTTPS
   - Configure firewall rules
   - Set up rate limiting

## Production Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## Support

If you encounter issues not covered here:
- Check GitHub Issues
- Review application logs in `logs/` directory
- Enable debug logging: `LOG_LEVEL=debug` in `.env`
