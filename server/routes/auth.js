import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const router = express.Router();

// Facebook App credentials
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify Facebook token and get user info
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Verify token with Facebook
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
    );

    const { id, name, email, picture } = tokenResponse.data;

    const db = req.app.locals.db;
    
    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE facebook_id = ?',
      [id]
    );

    let user;
    if (existingUsers.length > 0) {
      // Update existing user
      user = existingUsers[0];
      await db.execute(
        'UPDATE users SET name = ?, email = ?, picture_url = ?, access_token = ?, last_login = NOW() WHERE facebook_id = ?',
        [name, email, picture.data.url, accessToken, id]
      );
    } else {
      // Create new user
      const [result] = await db.execute(
        'INSERT INTO users (facebook_id, name, email, picture_url, access_token, created_at, last_login) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [id, name, email, picture.data.url, accessToken]
      );
      
      user = {
        id: result.insertId,
        facebook_id: id,
        name,
        email,
        picture_url: picture.data.url
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, facebookId: id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture_url
      }
    });

  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(401).json({ error: 'Invalid Facebook token' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = req.app.locals.db;
    
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, facebookId: user.facebook_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture_url
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

export default router;