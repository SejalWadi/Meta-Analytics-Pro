import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get connected accounts
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const [accounts] = await db.execute(`
      SELECT 
        id,
        platform,
        platform_account_id,
        account_name,
        follower_count,
        is_active,
        last_sync,
        created_at
      FROM connected_accounts 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.userId]);

    res.json(accounts);

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Connect new account
router.post('/connect', async (req, res) => {
  try {
    const { platform, accessToken } = req.body;
    const db = req.app.locals.db;

    let accountData;
    
    if (platform === 'facebook') {
      // Get Facebook pages
      const pagesResponse = await axios.get(
        `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
      );
      
      accountData = pagesResponse.data.data;
    } else if (platform === 'instagram') {
      // Get Instagram business accounts
      const accountResponse = await axios.get(
        `https://graph.facebook.com/me?fields=instagram_business_account&access_token=${accessToken}`
      );
      
      if (accountResponse.data.instagram_business_account) {
        const instagramResponse = await axios.get(
          `https://graph.facebook.com/${accountResponse.data.instagram_business_account.id}?fields=name,followers_count&access_token=${accessToken}`
        );
        
        accountData = [instagramResponse.data];
      }
    }

    const connectedAccounts = [];

    for (const account of accountData || []) {
      // Check if account already exists
      const [existing] = await db.execute(
        'SELECT id FROM connected_accounts WHERE user_id = ? AND platform_account_id = ?',
        [req.user.userId, account.id]
      );

      if (existing.length === 0) {
        const [result] = await db.execute(`
          INSERT INTO connected_accounts 
          (user_id, platform, platform_account_id, account_name, access_token, follower_count, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
        `, [
          req.user.userId,
          platform,
          account.id,
          account.name,
          account.access_token || accessToken,
          account.followers_count || 0
        ]);

        connectedAccounts.push({
          id: result.insertId,
          platform,
          platform_account_id: account.id,
          account_name: account.name,
          follower_count: account.followers_count || 0,
          is_active: true
        });
      }
    }

    res.json({ 
      message: 'Accounts connected successfully',
      accounts: connectedAccounts
    });

  } catch (error) {
    console.error('Connect account error:', error);
    res.status(500).json({ error: 'Failed to connect account' });
  }
});

// Update account status
router.put('/:accountId/status', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { isActive } = req.body;
    const db = req.app.locals.db;

    await db.execute(
      'UPDATE connected_accounts SET is_active = ? WHERE id = ? AND user_id = ?',
      [isActive, accountId, req.user.userId]
    );

    res.json({ message: 'Account status updated successfully' });

  } catch (error) {
    console.error('Update account status error:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
});

// Delete account
router.delete('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const db = req.app.locals.db;

    await db.execute(
      'DELETE FROM connected_accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user.userId]
    );

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Sync account data
router.post('/:accountId/sync', async (req, res) => {
  try {
    const { accountId } = req.params;
    const db = req.app.locals.db;

    // Get account details
    const [accounts] = await db.execute(
      'SELECT * FROM connected_accounts WHERE id = ? AND user_id = ?',
      [accountId, req.user.userId]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accounts[0];

    // Sync data based on platform
    if (account.platform === 'facebook') {
      await syncFacebookData(account, db);
    } else if (account.platform === 'instagram') {
      await syncInstagramData(account, db);
    }

    // Update last sync time
    await db.execute(
      'UPDATE connected_accounts SET last_sync = NOW() WHERE id = ?',
      [accountId]
    );

    res.json({ message: 'Account synced successfully' });

  } catch (error) {
    console.error('Sync account error:', error);
    res.status(500).json({ error: 'Failed to sync account' });
  }
});

// Helper function to sync Facebook data
async function syncFacebookData(account, db) {
  try {
    // Fetch recent posts
    const postsResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${account.platform_account_id}/posts`,
      {
        params: {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit: 50,
          access_token: account.access_token
        }
      }
    );

    // Store posts in database
    for (const post of postsResponse.data.data) {
      const [existing] = await db.execute(
        'SELECT id FROM posts WHERE platform_post_id = ?',
        [post.id]
      );

      if (existing.length === 0) {
        await db.execute(`
          INSERT INTO posts 
          (account_id, platform_post_id, content, created_at, likes_count, comments_count, shares_count, engagement_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          account.id,
          post.id,
          post.message || '',
          post.created_time,
          post.likes?.summary?.total_count || 0,
          post.comments?.summary?.total_count || 0,
          post.shares?.count || 0,
          (post.likes?.summary?.total_count || 0) + (post.comments?.summary?.total_count || 0) + (post.shares?.count || 0)
        ]);
      }
    }
  } catch (error) {
    console.error('Facebook sync error:', error);
    throw error;
  }
}

// Helper function to sync Instagram data
async function syncInstagramData(account, db) {
  try {
    // Fetch recent media
    const mediaResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${account.platform_account_id}/media`,
      {
        params: {
          fields: 'id,caption,media_type,timestamp,like_count,comments_count',
          limit: 50,
          access_token: account.access_token
        }
      }
    );

    // Store media in database
    for (const media of mediaResponse.data.data) {
      const [existing] = await db.execute(
        'SELECT id FROM posts WHERE platform_post_id = ?',
        [media.id]
      );

      if (existing.length === 0) {
        await db.execute(`
          INSERT INTO posts 
          (account_id, platform_post_id, content, post_type, created_at, likes_count, comments_count, engagement_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          account.id,
          media.id,
          media.caption || '',
          media.media_type,
          media.timestamp,
          media.like_count || 0,
          media.comments_count || 0,
          (media.like_count || 0) + (media.comments_count || 0)
        ]);
      }
    }
  } catch (error) {
    console.error('Instagram sync error:', error);
    throw error;
  }
}

export default router;