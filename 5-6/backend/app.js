const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// База данных
let users = [
  { id: nanoid(6), name: 'Петр', age: 16 },
  { id: nanoid(6), name: 'Иван', age: 18 },
  { id: nanoid(6), name: 'Дарья', age: 20 },
  { id: nanoid(6), name: 'Елена', age: 22 },
  { id: nanoid(6), name: 'Алексей', age: 25 }
];

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API управления пользователями',
      version: '1.0.0',
      description: 'Простое API для управления пользователями с полной документацией Swagger',
      contact: {
        name: 'Разработчик',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер разработки'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'Операции с пользователями'
      }
    ]
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключение Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'User Management API Documentation'
}));

// Доп. функция для поиска пользователя
const findUserOr404 = (id, res) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return null;
  }
  return user;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Имя пользователя
 *           example: "Иван Петров"
 *         age:
 *           type: integer
 *           description: Возраст пользователя
 *           minimum: 0
 *           maximum: 150
 *           example: 25
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *           example: "Пользователь не найден"
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         name:
 *           type: string
 *           description: Имя пользователя
 *           example: "Иван Петров"
 *         age:
 *           type: integer
 *           description: Возраст пользователя
 *           example: 25
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создает нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           examples:
 *             user:
 *               value:
 *                 name: "Мария Смирнова"
 *                 age: 28
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.post('/api/users', (req, res) => {
  try {
    const { name, age } = req.body;
    
    // Валидация
    if (!name || !age) {
      return res.status(400).json({ error: 'Имя и возраст обязательны' });
    }
    
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Имя должно содержать минимум 2 символа' });
    }
    
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({ error: 'Возраст должен быть числом от 0 до 150' });
    }
    
    const newUser = {
      id: nanoid(6),
      name: name.trim(),
      age: ageNum,
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Возвращает список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/users', (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получает пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/users/:id', (req, res) => {
  try {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Полностью обновляет пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: Обновленные данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные запроса
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.put('/api/users/:id', (req, res) => {
  try {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;
    
    const { name, age } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({ error: 'Имя и возраст обязательны' });
    }
    
    user.name = name.trim();
    user.age = Number(age);
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Частично обновляет пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Обновленные данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.patch('/api/users/:id', (req, res) => {
  try {
    const user = findUserOr404(req.params.id, res);
    if (!user) return;
    
    // Проверка на  обновление
    if (req.body?.name === undefined && req.body?.age === undefined) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    const { name, age } = req.body;
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Имя должно содержать минимум 2 символа' });
      }
      user.name = name.trim();
    }
    
    if (age !== undefined) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        return res.status(400).json({ error: 'Возраст должен быть числом от 0 до 150' });
      }
      user.age = ageNum;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удаляет пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно удален (нет тела ответа)
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.delete('/api/users/:id', (req, res) => {
  try {
    const id = req.params.id;
    const exists = users.some(u => u.id === id);
    
    if (!exists) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    users = users.filter(u => u.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// endpoint для проверки работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Обработка ошибок 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint не найден' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger документация доступна на http://localhost:${port}/api-docs`);
});