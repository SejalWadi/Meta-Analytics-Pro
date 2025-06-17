# Meta Analytics Pro - Complete Setup Guide

This comprehensive guide will walk you through setting up the Meta Analytics Pro platform from scratch, including all dependencies, configurations, and deployment options.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Setup](#development-environment-setup)
3. [Facebook Developer Configuration](#facebook-developer-configuration)
4. [Database Setup](#database-setup)
5. [Redis Configuration](#redis-configuration)
6. [Application Installation](#application-installation)
7. [Environment Configuration](#environment-configuration)
8. [Running the Application](#running-the-application)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## 🖥 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or Ubuntu 18.04+
- **Node.js**: v18.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Stable internet connection

### Recommended Development Tools
- **Code Editor**: VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter
- **Database Client**: MySQL Workbench or phpMyAdmin
- **API Testing**: Postman or Insomnia
- **Version Control**: Git

## 🛠 Development Environment Setup

### 1. Install Node.js and npm

#### Windows
```bash
# Download from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

#### Ubuntu/Debian
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install MySQL

#### Windows
```bash
# Download MySQL Installer from https://dev.mysql.com/downloads/installer/
# Or use Chocolatey
choco install mysql

# Start MySQL service
net start mysql
```

#### macOS
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

#### Ubuntu/Debian
```bash
# Install MySQL Server
sudo apt update
sudo apt install mysql-server

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

### 3. Install Redis

#### Windows
```bash
# Download from https://github.com/microsoftarchive/redis/releases
# Or use Docker
docker run -d -p 6379:6379 --name redis redis:alpine
```

#### macOS
```bash
# Using Homebrew
brew install redis

# Start Redis service
brew services start redis
```

#### Ubuntu/Debian
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
```

## 🔧 Facebook Developer Configuration

### 1. Create Facebook Developer Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Get Started" and complete the registration
3. Verify your account with phone number

### 2. Create a New Facebook App

1. **Navigate to Apps Dashboard**:
   - Click "My Apps" → "Create App"
   - Select "Business" as app type
   - Fill in app details:
     - App Name: "Meta Analytics Pro"
     - App Contact Email: your-email@domain.com
     - Business Account: Select or create one

2. **Add Required Products**:
   - **Facebook Login**: For user authentication
   - **Instagram Basic Display**: For Instagram data access

### 3. Configure Facebook Login

1. **Go to Facebook Login Settings**:
   - Products → Facebook Login → Settings
   - Add Valid OAuth Redirect URIs:
     ```
     http://localhost:5173/
     https://yourdomain.com/
     ```

2. **Set App Domains**:
   - Settings → Basic
   - Add App Domains:
     ```
     localhost
     yourdomain.com
     ```

### 4. Configure Instagram Basic Display

1. **Go to Instagram Basic Display**:
   - Products → Instagram Basic Display → Basic Display
   - Add Valid OAuth Redirect URIs:
     ```
     http://localhost:5173/
     https://yourdomain.com/
     ```

2. **Add Instagram Testers**:
   - Roles → Roles
   - Add Instagram Testers (your Instagram account)

### 5. Request Advanced Permissions

For production use, request these permissions:
- `pages_read_engagement`
- `pages_read_user_content`
- `pages_show_list`
- `instagram_basic`
- `instagram_manage_insights`

### 6. Get App Credentials

1. **App ID and Secret**:
   - Settings → Basic
   - Copy App ID and App Secret
   - Keep App Secret secure!

## 🗄 Database Setup

### 1. Create MySQL Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE meta_analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, for security)
CREATE USER 'meta_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON meta_analytics.* TO 'meta_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 2. Import Database Schema

```bash
# Navigate to project directory
cd meta-analytics-platform/server

# Import schema
mysql -u root -p meta_analytics < database/schema.sql

# Verify tables were created
mysql -u root -p meta_analytics -e "SHOW TABLES;"
```

### 3. Configure MySQL for Production

Edit MySQL configuration file:

#### Ubuntu/Debian
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

#### macOS (Homebrew)
```bash
nano /usr/local/etc/my.cnf
```

Add these optimizations:
```ini
[mysqld]
# Performance optimizations
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
query_cache_type = 1

# Security
bind-address = 127.0.0.1
```

Restart MySQL:
```bash
# Ubuntu/Debian
sudo systemctl restart mysql

# macOS
brew services restart mysql
```

## 🔴 Redis Configuration

### 1. Configure Redis

Edit Redis configuration:

#### Ubuntu/Debian
```bash
sudo nano /etc/redis/redis.conf
```

#### macOS (Homebrew)
```bash
nano /usr/local/etc/redis.conf
```

Key configurations:
```conf
# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security (if needed)
requirepass your_redis_password

# Network
bind 127.0.0.1
port 6379
```

### 2. Restart Redis

```bash
# Ubuntu/Debian
sudo systemctl restart redis-server

# macOS
brew services restart redis

# Test connection
redis-cli ping
```

## 📦 Application Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd meta-analytics-platform

# Or if you have the files locally, navigate to the directory
cd path/to/meta-analytics-platform
```

### 2. Install Frontend Dependencies

```bash
# Install frontend dependencies
npm install

# Install additional development tools (optional)
npm install -g @vitejs/plugin-react
```

### 3. Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Install global tools (optional)
npm install -g nodemon pm2
```

## ⚙️ Environment Configuration

### 1. Frontend Environment

Create `.env.local` in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Facebook Configuration
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# Environment
VITE_NODE_ENV=development

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_tracking_id
```

### 2. Backend Environment

Create `.env` in the server directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=meta_analytics

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Facebook/Meta API Configuration
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# RapidAPI Configuration (optional)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=facebook-instagram-api.rapidapi.com

# Email Configuration (for reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Storage
STORAGE_TYPE=local
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
```

### 3. Generate Secure Keys

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64
```

## 🚀 Running the Application

### 1. Development Mode

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend Development Server
```bash
# From root directory
npm run dev
```

### 2. Verify Installation

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Access Frontend**:
   - Open browser to http://localhost:5173
   - You should see the login page

3. **Test Database Connection**:
   ```bash
   # In server directory
   node -e "
   const mysql = require('mysql2/promise');
   mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: 'your_password',
     database: 'meta_analytics'
   }).then(() => console.log('Database connected!')).catch(console.error);
   "
   ```

4. **Test Redis Connection**:
   ```bash
   redis-cli ping
   ```

### 3. First Login

1. Navigate to http://localhost:5173
2. Click "Continue with Facebook"
3. Authorize the app with your Facebook account
4. You should be redirected to the dashboard

## 🌐 Production Deployment

### 1. Build Frontend

```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

### 2. Environment Variables for Production

Update `.env` files with production values:

```env
# Frontend (.env.local)
VITE_API_URL=https://your-api-domain.com/api
VITE_FACEBOOK_APP_ID=your_production_facebook_app_id

# Backend (.env)
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
DB_HOST=your_production_db_host
# ... other production values
```

### 3. Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'meta-analytics-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/meta-analytics
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/meta-analytics-platform/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/meta-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Facebook API Errors

**Error**: "Invalid OAuth access token"
```bash
# Solution: Check token expiration and refresh
# Verify app permissions in Facebook Developer Console
```

**Error**: "Rate limit exceeded"
```bash
# Solution: Implement proper rate limiting
# Check Redis cache configuration
# Review API call frequency
```

#### 2. Database Connection Issues

**Error**: "ER_ACCESS_DENIED_ERROR"
```sql
-- Solution: Check user permissions
GRANT ALL PRIVILEGES ON meta_analytics.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

**Error**: "Connection timeout"
```bash
# Solution: Check MySQL service status
sudo systemctl status mysql

# Check network connectivity
telnet localhost 3306
```

#### 3. Redis Connection Issues

**Error**: "Redis connection refused"
```bash
# Solution: Check Redis service
sudo systemctl status redis-server

# Check Redis configuration
redis-cli ping

# Check port availability
netstat -tlnp | grep 6379
```

#### 4. Frontend Build Issues

**Error**: "Module not found"
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error**: "TypeScript errors"
```bash
# Solution: Check TypeScript configuration
npx tsc --noEmit
```

#### 5. Backend Server Issues

**Error**: "Port already in use"
```bash
# Solution: Find and kill process using port
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Debug Mode

Enable detailed logging:

```env
# Backend .env
LOG_LEVEL=debug
NODE_ENV=development

# Enable SQL query logging
DB_LOGGING=true
```

### Health Checks

Create monitoring endpoints:

```bash
# Check all services
curl http://localhost:3001/health

# Check database
curl http://localhost:3001/health/db

# Check Redis
curl http://localhost:3001/health/redis
```

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check the logs**:
   ```bash
   # Backend logs
   tail -f server/logs/app.log
   
   # PM2 logs (production)
   pm2 logs meta-analytics-api
   ```

2. **Verify environment variables**:
   ```bash
   # Check if all required variables are set
   node -e "console.log(process.env)" | grep -E "(DB_|REDIS_|FACEBOOK_)"
   ```

3. **Test individual components**:
   - Database connection
   - Redis connection
   - Facebook API access
   - File permissions

4. **Create an issue** on GitHub with:
   - Error messages
   - System information
   - Steps to reproduce
   - Log files (without sensitive data)

---

**Congratulations!** 🎉 You should now have Meta Analytics Pro running successfully. The platform is ready to analyze your Facebook and Instagram content performance!