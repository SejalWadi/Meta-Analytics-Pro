# Meta Analytics Pro - Content Performance Analyzer

A comprehensive Facebook and Instagram analytics platform that provides deep insights, audience intelligence, and optimization recommendations for social media content.

## 🚀 Features

### Core Analytics
- **Cross-Platform Integration**: Unified dashboard for Facebook Pages and Instagram Business accounts
- **Real-time Metrics**: Live tracking of reach, engagement, impressions, and follower growth
- **Content Performance**: Detailed analysis of posts, reels, stories, and carousels
- **Audience Intelligence**: Demographics, behavior patterns, and engagement insights

### Optimization Engine
- **AI-Powered Recommendations**: Content type suggestions and posting time optimization
- **Hashtag Analysis**: Performance tracking and trending hashtag identification
- **A/B Testing**: Compare different content strategies and formats
- **Best Time Calculator**: Data-driven posting schedule recommendations

### Advanced Features
- **Automated Reports**: Scheduled PDF, CSV, and Excel report generation
- **Multi-Account Management**: Connect and manage multiple Facebook/Instagram accounts
- **Competitor Analysis**: Benchmark against industry standards
- **ROI Tracking**: Monitor content performance and business impact

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Chart.js & Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MySQL** for data storage
- **Redis** for caching and queue management
- **JWT** for authentication
- **Bull Queue** for background jobs

### APIs & Integrations
- **Facebook Graph API** for Facebook data
- **Instagram Basic Display API** for Instagram data
- **Meta Business SDK** for advanced features
- **RapidAPI** for additional endpoints

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis server
- Facebook Developer Account
- Facebook App with required permissions

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd meta-analytics-platform
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE meta_analytics;

# Import schema
mysql -u root -p meta_analytics < database/schema.sql
```

### 5. Redis Setup
```bash
# Start Redis server (Ubuntu/Debian)
sudo systemctl start redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

## ⚙️ Configuration

### Facebook App Setup

1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app with "Business" type
   - Add "Facebook Login" and "Instagram Basic Display" products

2. **Configure App Permissions**:
   ```
   pages_read_engagement
   pages_read_user_content
   pages_show_list
   instagram_basic
   instagram_manage_insights
   ```

3. **Set Redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```

### Environment Variables

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meta_analytics

REDIS_URL=redis://localhost:6379

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
JWT_SECRET=your_super_secret_jwt_key
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**:
```bash
cd server
npm run dev
```

2. **Start Frontend Development Server**:
```bash
npm run dev
```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Production Mode

1. **Build Frontend**:
```bash
npm run build
```

2. **Start Production Server**:
```bash
cd server
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/facebook` - Facebook OAuth login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Analytics
- `GET /api/analytics/metrics` - Get analytics metrics
- `GET /api/analytics/content-performance` - Content performance data

### Accounts
- `GET /api/accounts` - Get connected accounts
- `POST /api/accounts/connect` - Connect new account
- `PUT /api/accounts/:id/status` - Update account status
- `POST /api/accounts/:id/sync` - Sync account data

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/scheduled` - Get scheduled reports
- `POST /api/reports/schedule` - Create scheduled report

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization
- **SQL Injection Protection** with parameterized queries

## 📈 Performance Optimization

- **Redis Caching** for frequently accessed data
- **Database Indexing** for optimized queries
- **Compression** for API responses
- **Lazy Loading** for frontend components
- **Image Optimization** for better loading times

## 🧪 Testing

### Run Frontend Tests
```bash
npm test
```

### Run Backend Tests
```bash
cd server
npm test
```

### API Testing with Postman
Import the provided Postman collection for comprehensive API testing.

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔄 Data Synchronization

### Automatic Sync
- Real-time data updates every 15 minutes
- Background jobs for heavy data processing
- Queue system for handling API rate limits

### Manual Sync
- On-demand account synchronization
- Bulk data refresh capabilities
- Error handling and retry mechanisms

## 📋 Troubleshooting

### Common Issues

1. **Facebook API Errors**:
   - Verify app permissions and access tokens
   - Check rate limiting status
   - Ensure proper webhook configuration

2. **Database Connection Issues**:
   - Verify MySQL service is running
   - Check database credentials
   - Ensure database exists and schema is imported

3. **Redis Connection Issues**:
   - Verify Redis server is running
   - Check Redis URL configuration
   - Test connection with Redis CLI

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced competitor analysis
- [ ] AI-powered content suggestions
- [ ] Influencer identification tools
- [ ] Advanced ROI calculations
- [ ] WhatsApp Business integration
- [ ] TikTok analytics support

### Performance Improvements
- [ ] GraphQL API implementation
- [ ] Advanced caching strategies
- [ ] Real-time WebSocket updates
- [ ] Progressive Web App features

---

**Meta Analytics Pro** - Transform your social media strategy with data-driven insights! 🚀