const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());

// товары
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


app.get('/products', (req, res) => {
    res.json(products);
});


app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    res.json(product);
});


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


app.listen(port, () => {
    console.log(`СЕРВЕР ЗАПУЩЕН!`);
    console.log(`Адрес: http://localhost:${port}`);
    console.log(`Список товаров: http://localhost:${port}/products`);
});