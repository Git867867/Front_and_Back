const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';

  // Bearer <token>
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ 
      error: 'Отсутствует или неверный Authorization header' 
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истек' });
    }
    return res.status(401).json({ error: 'Неверный или истекший токен' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };