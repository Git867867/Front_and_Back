const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

// Разрешить запросы с React (порт 3001)
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// База данных товаров (10 штук)
let products = [
    {
        id: nanoid(6),
        name: "Игровой ноутбук ASUS ROG",
        category: "Ноутбуки",
        description: "Intel Core i7, RAM 16GB, SSD 512GB, RTX 3060",
        price: 89990,
        stock: 5,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: "Смартфон iPhone 15 Pro",
        category: "Смартфоны",
        description: "6.1 дюйма, A17 Pro, камера 48MP, 256GB",
        price: 99990,
        stock: 8,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: "Наушники Sony WH-1000XM5",
        category: "Аудио",
        description: "Беспроводные наушники с шумоподавлением",
        price: 24990,
        stock: 15,
        rating: 4.7
    },
    {
        id: nanoid(6),
        name: "Монитор Samsung Odyssey G7",
        category: "Мониторы",
        description: "27 дюймов, 240Hz, 1ms, QLED",
        price: 45990,
        stock: 3,
        rating: 4.6
    },
    {
        id: nanoid(6),
        name: "Клавиатура Logitech G Pro X",
        category: "Периферия",
        description: "Механическая, переключатели GX Blue",
        price: 12990,
        stock: 12,
        rating: 4.5
    },
    {
        id: nanoid(6),
        name: "Мышь Razer DeathAdder V3",
        category: "Периферия",
        description: "Оптическая, 30000 DPI, 59g",
        price: 8990,
        stock: 20,
        rating: 4.8
    },
    {
        id: nanoid(6),
        name: "Планшет iPad Pro 12.9",
        category: "Планшеты",
        description: "M2 чип, 128GB, Liquid Retina XDR",
        price: 89990,
        stock: 4,
        rating: 4.9
    },
    {
        id: nanoid(6),
        name: "Умные часы Galaxy Watch 6",
        category: "Гаджеты",
        description: "47mm, LTE, мониторинг здоровья",
        price: 29990,
        stock: 7,
        rating: 4.4
    },
    {
        id: nanoid(6),
        name: "Веб-камера Logitech StreamCam",
        category: "Периферия",
        description: "1080p 60fps, автофокус, USB-C",
        price: 12990,
        stock: 9,
        rating: 4.3
    },
    {
        id: nanoid(6),
        name: "SSD Samsung 980 Pro 1TB",
        category: "Комплектующие",
        description: "NVMe M.2, чтение 7000MB/s",
        price: 10990,
        stock: 25,
        rating: 4.9
    }
];

// ПОЛУЧИТЬ ВСЕ ТОВАРЫ
app.get('/products', (req, res) => {
    res.json(products);
});

// ПОЛУЧИТЬ ОДИН ТОВАР ПО ID
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    res.json(product);
});

// СОЗДАТЬ НОВЫЙ ТОВАР
app.post('/products', (req, res) => {
    const { name, category, description, price, stock, rating } = req.body;
    
    const newProduct = {
        id: nanoid(6),
        name: name,
        category: category,
        description: description,
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// ОБНОВИТЬ ТОВАР
app.patch('/products/:id', (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    
    products[productIndex] = {
        ...products[productIndex],
        ...req.body,
        price: req.body.price ? Number(req.body.price) : products[productIndex].price,
        stock: req.body.stock ? Number(req.body.stock) : products[productIndex].stock,
        rating: req.body.rating ? Number(req.body.rating) : products[productIndex].rating
    };
    
    res.json(products[productIndex]);
});

// УДАЛИТЬ ТОВАР
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Товары доступны по адресу: http://localhost:${port}/products`);
});