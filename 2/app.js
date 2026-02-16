const express = require('express');
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Начальные данные
let products = [
    { id: 1, name: 'Смартфон XYZ Pro', price: 24990 },
    { id: 2, name: 'Ноутбук UltraBook 15', price: 54990 },
    { id: 3, name: 'Планшет Tab S8', price: 35990 },
    { id: 4, name: 'Наушники AirSound', price: 4990 }
];

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <h1>API управления товарами</h1>
        <p>Доступные endpoints:</p>
        <ul>
            <li><strong>GET /products</strong> - получить все товары</li>
            <li><strong>GET /products/:id</strong> - получить товар по ID</li>
            <li><strong>POST /products</strong> - добавить новый товар (JSON: {name, price})</li>
            <li><strong>PUT /products/:id</strong> - полностью обновить товар (JSON: {name, price})</li>
            <li><strong>PATCH /products/:id</strong> - частично обновить товар (JSON: {name?, price?})</li>
            <li><strong>DELETE /products/:id</strong> - удалить товар</li>
        </ul>
        <p>Пример использования: <a href="/products">/products</a></p>
    `);
});

// CREATE
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'Необходимо указать название и стоимость товара' 
        });
    }
    
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
            error: 'Стоимость должна быть положительным числом' 
        });
    }
    
    const newProduct = {
        id: Date.now(),
        name: name.trim(),
        price: price
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ ALL
app.get('/products', (req, res) => {
    const { minPrice, maxPrice } = req.query;
    
    let filteredProducts = [...products];
    
    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }
    
    res.json(filteredProducts);
});

// READ ONE
app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    res.json(product);
});

// UPDATE FULL
app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ 
            error: 'При полном обновлении необходимо указать название и стоимость' 
        });
    }
    
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
            error: 'Стоимость должна быть положительным числом' 
        });
    }
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    products[productIndex] = {
        id: id,
        name: name.trim(),
        price: price
    };
    
    res.json(products[productIndex]);
});

// UPDATE PARTIAL
app.patch('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    if (name !== undefined) {
        product.name = name.trim();
    }
    
    if (price !== undefined) {
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ 
                error: 'Стоимость должна быть положительным числом' 
            });
        }
        product.price = price;
    }
    
    res.json(product);
});

// DELETE
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const productExists = products.some(p => p.id === id);
    
    if (!productExists) {
        return res.status(404).json({ 
            error: 'Товар не найден' 
        });
    }
    
    products = products.filter(p => p.id !== id);
    res.json({ 
        message: 'Товар успешно удален',
        deletedId: id 
    });
});

// 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не найден' 
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log('Доступные endpoints:');
    console.log(`- GET    http://localhost:${port}/products`);
    console.log(`- GET    http://localhost:${port}/products/:id`);
    console.log(`- POST   http://localhost:${port}/products`);
    console.log(`- PUT    http://localhost:${port}/products/:id`);
    console.log(`- PATCH  http://localhost:${port}/products/:id`);
    console.log(`- DELETE http://localhost:${port}/products/:id`);
});