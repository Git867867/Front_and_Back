const jwt = require('jsonwebtoken');
const { User, users } = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const ACCESS_EXPIRES_IN = '15m';

class AuthController {
  // Регистрация пользователя
  async register(req, res) {
    try {
      const { email, first_name, last_name, password } = req.body;

      // Валидация
      if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ 
          error: 'Все поля обязательны: email, first_name, last_name, password' 
        });
      }

      // Проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Неверный формат email' });
      }

      // Проверка длины пароля
      if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
      }

      // Проверка, существует ли пользователь
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      }

      // Создание пользователя
      const user = new User(email, first_name, last_name, password);
      await user.setPassword(password);
      users.push(user);

      // Возвращаем данные пользователя (без пароля)
      res.status(201).json(user.toJSON());
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Ошибка при регистрации' });
    }
  }

  // Вход в систему
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
      }

      // Поиск пользователя
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      // Проверка пароля
      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      // Создание access-токена
      const accessToken = jwt.sign(
        { 
          sub: user.id, 
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
      );

      res.json({
        accessToken,
        user: user.toJSON()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка при входе' });
    }
  }

  // Получение текущего пользователя
  async getMe(req, res) {
    try {
      const userId = req.user.sub;
      const user = users.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user.toJSON());
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
  }
}

module.exports = new AuthController();