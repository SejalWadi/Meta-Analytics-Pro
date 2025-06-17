import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get analytics metrics
router.get('/metrics', async (req, res) => {
  try {
    const { accounts, dateRange } = req.query;
    const db = req.app.locals.db;
    const redis = req.app.locals.redis;
    
    // Check cache first
    const cacheKey = `metrics:${req.user.userId}:${JSON.stringify({ accounts, dateRange })}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Get user's connected accounts
    const [userAccounts] = await db.execute(
      'SELECT * FROM connected_accounts WHERE user_id = ? AND is_active = 1',
      [req.user.userId]
    );

    const metricsData = {
      totalReach: 0,
      totalEngagement: 0,
      totalImpressions: 0,
      engagementRate: 0,
      followerGrowth: 0,
      topPosts: [],
      demographicsData: {},
      engagementByTime: [],
      contentPerformance: []
    };

    // Fetch data from Facebook/Instagram APIs for each account
    for (const account of userAccounts) {
      try {
        if (account.platform === 'facebook') {
          const pageData = await fetchFacebookPageInsights(account.platform_account_id, account.access_token);
          aggregateMetrics(metricsData, pageData);
        } else if (account.platform === 'instagram') {
          const instagramData = await fetchInstagramInsights(account.platform_account_id, account.access_token);
          aggregateMetrics(metricsData, instagramData);
        }
      } catch (error) {
        console.error(`Error fetching data for account ${account.id}:`, error);
      }
    }

    // Calculate derived metrics
    metricsData.engagementRate = metricsData.totalReach > 0 
      ? (metricsData.totalEngagement / metricsData.totalReach * 100).toFixed(2)
      : 0;

    // Cache the results for 15 minutes
    await redis.setEx(cacheKey, 900, JSON.stringify(metricsData));

    res.json(metricsData);

  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics metrics' });
  }
});

// Get content performance
router.get('/content-performance', async (req, res) => {
  try {
    const { platform, dateRange } = req.query;
    const db = req.app.locals.db;

    const [posts] = await db.execute(`
      SELECT p.*, ca.platform, ca.platform_account_id
      FROM posts p
      JOIN connected_accounts ca ON p.account_id = ca.id
      WHERE ca.user_id = ? 
      AND (? = 'all' OR ca.platform = ?)
      AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY p.engagement_count DESC
      LIMIT 50
    `, [req.user.userId, platform, platform, parseInt(dateRange) || 30]);

    res.json(posts);

  } catch (error) {
    console.error('Content performance error:', error);
    res.status(500).json({ error: 'Failed to fetch content performance' });
  }
});

// Helper function to fetch Facebook Page Insights
async function fetchFacebookPageInsights(pageId, accessToken) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}/insights`,
      {
        params: {
          metric: 'page_impressions,page_reach,page_engaged_users,page_fans',
          period: 'day',
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0],
          access_token: accessToken
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Facebook API error:', error);
    throw error;
  }
}

// Helper function to fetch Instagram Insights
async function fetchInstagramInsights(accountId, accessToken) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${accountId}/insights`,
      {
        params: {
          metric: 'impressions,reach,profile_views,follower_count',
          period: 'day',
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0],
          access_token: accessToken
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Instagram API error:', error);
    throw error;
  }
}

// Helper function to aggregate metrics
function aggregateMetrics(metricsData, apiData) {
  if (!apiData || !apiData.data) return;

  apiData.data.forEach(metric => {
    switch (metric.name) {
      case 'page_impressions':
      case 'impressions':
        metricsData.totalImpressions += metric.values.reduce((sum, val) => sum + (val.value || 0), 0);
        break;
      case 'page_reach':
      case 'reach':
        metricsData.totalReach += metric.values.reduce((sum, val) => sum + (val.value || 0), 0);
        break;
      case 'page_engaged_users':
        metricsData.totalEngagement += metric.values.reduce((sum, val) => sum + (val.value || 0), 0);
        break;
    }
  });
}

export default router;