// server/middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to enforce authentication.
 * Checks for JWT token in Authorization header,
 * verifies it, and attaches user info to req.user.
 * Returns 401 if no token, 403 if invalid or expired.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware.
 * If JWT token is present and valid, attaches user info to req.user.
 * Otherwise continues without error.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      // Regardless of error, proceed to next middleware
      next();
    });
  } else {
    next();
  }
};
