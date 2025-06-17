import express from 'express';

const router = express.Router();

// Middleware to check auth token
router.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// GET /api/optimization-recommendations
router.get('/', (req, res) => {
  const optimizationData = {
    bestTimeToPost: {
      weekdays: [
        { day: 'Monday', hours: [9, 12, 18] },
        { day: 'Tuesday', hours: [10, 13, 17] },
        { day: 'Wednesday', hours: [11, 14, 19] },
        { day: 'Thursday', hours: [9, 12, 16] },
        { day: 'Friday', hours: [10, 15, 18] },
        { day: 'Saturday', hours: [11, 13, 17] },
        { day: 'Sunday', hours: [12, 14, 19] },
      ],
    },
    contentRecommendations: [
      {
        type: 'Video Content',
        reason: 'Videos get higher engagement on your audience',
        impact: 'High',
        effort: 'Medium',
      },
      {
        type: 'Hashtag Usage',
        reason: 'Using trending hashtags increases reach',
        impact: 'Medium',
        effort: 'Low',
      },
      {
        type: 'Posting Frequency',
        reason: 'Increase posts to at least 3 times per week',
        impact: 'High',
        effort: 'High',
      },
    ],
    hashtagAnalysis: {
      top: ['#marketing', '#growth', '#socialmedia'],
      trending: ['#contentstrategy', '#influencer', '#branding'],
      underused: ['#engagement', '#viral', '#startup'],
    },
  };

  res.json(optimizationData);
});

export default router;
