const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const users = [];
let refreshTokens = new Set();
let products = [];
let currentId = 1;

// Роли: admin, seller, user

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      sub: user.id, 
      username: user.username,
      role: user.role
    },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      sub: user.id, 
      username: user.username,
      role: user.role
    },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки ролей
const roleMiddleware = (allowedRoles) => (req, res, next) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  }
  next();
};

// Создание администратора при старте (если нет)
const createAdminIfNotExists = async () => {
  const adminExists = users.find(u => u.username === 'admin');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      id: users.length + 1,
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user created: admin / admin123');
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role === 'seller' ? 'seller' : 'user' // По умолчанию user, можно seller только через админа или явно
    };

    users.push(newUser);
    
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    
    refreshTokens.add(refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    refreshTokens.add(refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const tokenFromCookie = req.cookies?.refreshToken;
  const token = refreshToken || tokenFromCookie;

  if (!token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  if (!refreshTokens.has(token)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    refreshTokens.delete(token);
    
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    refreshTokens.add(newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    refreshTokens.delete(token);
    return res.status(401).json({ 
      error: 'Invalid or expired refresh token',
      refresh_expired: true 
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// ============== ТОВАРЫ (с ролями) ==============

// Создать товар - только seller и admin
app.post('/api/products', authenticateToken, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newProduct = {
    id: currentId++,
    name,
    price: parseFloat(price),
    description: description || '',
    userId: req.user.sub,
    createdAt: new Date()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Получить список товаров - все авторизованные пользователи
app.get('/api/products', authenticateToken, (req, res) => {
  res.json(products);
});

// Получить товар по id - все авторизованные пользователи
app.get('/api/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Обновить товар - только seller и admin (и только свои для seller)
app.put('/api/products/:id', authenticateToken, roleMiddleware(['seller', 'admin']), (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const product = products[productIndex];
  const currentUser = users.find(u => u.id === req.user.sub);
  
  // seller может редактировать только свои товары, admin - любые
  if (currentUser.role === 'seller' && product.userId !== req.user.sub) {
    return res.status(403).json({ error: 'You can only edit your own products' });
  }

  const { name, price, description } = req.body;
  
  products[productIndex] = {
    ...product,
    name: name || product.name,
    price: price ? parseFloat(price) : product.price,
    description: description !== undefined ? description : product.description,
    updatedAt: new Date()
  };

  res.json(products[productIndex]);
});

// Удалить товар - только admin
app.delete('/api/products/:id', authenticateToken, roleMiddleware(['admin']), (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.status(204).send();
});

// ============== ПОЛЬЗОВАТЕЛИ (только admin) ==============

// Получить всех пользователей
app.get('/api/users', authenticateToken, roleMiddleware(['admin']), (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role
  }));
  res.json(safeUsers);
});

// Получить пользователя по id
app.get('/api/users/:id', authenticateToken, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

// Обновить пользователя (роль)
app.put('/api/users/:id', authenticateToken, roleMiddleware(['admin']), async (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { role } = req.body;
  if (!role || !['user', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  users[userIndex].role = role;
  res.json({
    id: users[userIndex].id,
    username: users[userIndex].username,
    role: users[userIndex].role
  });
});

// Удалить (заблокировать) пользователя
app.delete('/api/users/:id', authenticateToken, roleMiddleware(['admin']), (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

// Запуск сервера
app.listen(PORT, async () => {
  await createAdminIfNotExists();
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});