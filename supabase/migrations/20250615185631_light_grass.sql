-- Meta Analytics Platform Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  facebook_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  picture_url TEXT,
  access_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_facebook_id (facebook_id),
  INDEX idx_email (email)
);

-- Connected accounts table (Facebook Pages, Instagram accounts)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  platform ENUM('facebook', 'instagram') NOT NULL,
  platform_account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  access_token TEXT,
  follower_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_account (user_id, platform, platform_account_id),
  INDEX idx_user_platform (user_id, platform),
  INDEX idx_active (is_active)
);

-- Posts/Media table
CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  platform_post_id VARCHAR(255) NOT NULL,
  content TEXT,
  post_type VARCHAR(50) DEFAULT 'post',
  media_url TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  reach_count INT DEFAULT 0,
  impressions_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_post (account_id, platform_post_id),
  INDEX idx_account_date (account_id, created_at),
  INDEX idx_engagement (engagement_count),
  INDEX idx_post_type (post_type)
);

-- Analytics metrics table (for storing aggregated data)
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_metric (account_id, metric_date, metric_type),
  INDEX idx_account_date_type (account_id, metric_date, metric_type)
);

-- Audience demographics table
CREATE TABLE IF NOT EXISTS audience_demographics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  demographic_type ENUM('age', 'gender', 'location', 'interest') NOT NULL,
  demographic_value VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0,
  count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_demographic (account_id, demographic_type, demographic_value),
  INDEX idx_account_type (account_id, demographic_type)
);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  report_type ENUM('overview', 'audience', 'content', 'engagement') NOT NULL,
  frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
  format ENUM('pdf', 'csv', 'excel') NOT NULL,
  accounts JSON,
  recipients JSON,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated TIMESTAMP NULL,
  next_generation TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_next_generation (next_generation)
);

-- API rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  requests_count INT DEFAULT 0,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rate_limit (account_id, endpoint, window_start),
  INDEX idx_window_start (window_start)
);

-- Optimization recommendations table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recommendation_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_level ENUM('low', 'medium', 'high') NOT NULL,
  effort_level ENUM('low', 'medium', 'high') NOT NULL,
  is_implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_implemented),
  INDEX idx_impact (impact_level),
  INDEX idx_expires (expires_at)
);

-- Hashtag performance table
CREATE TABLE IF NOT EXISTS hashtag_performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  usage_count INT DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  last_used TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hashtag (account_id, hashtag),
  INDEX idx_account_performance (account_id, avg_engagement_rate),
  INDEX idx_hashtag (hashtag)
);

-- Content calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  account_id INT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  post_type VARCHAR(50),
  scheduled_time TIMESTAMP NOT NULL,
  status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
  platform_post_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE SET NULL,
  INDEX idx_user_scheduled (user_id, scheduled_time),
  INDEX idx_status (status)
);

-- Create indexes for better performance
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_engagement_desc ON posts(engagement_count DESC);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(metric_date);
CREATE INDEX idx_users_last_login ON users(last_login);