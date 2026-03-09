const { Product, products } = require('../models/Product');

class ProductsController {
  // Создание товара
  createProduct(req, res) {
    try {
      const { title, category, description, price } = req.body;

      // Валидация
      if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ 
          error: 'Все поля обязательны: title, category, description, price' 
        });
      }

      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
      }

      const product = new Product(title, category, description, price);
      products.push(product);

      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Ошибка при создании товара' });
    }
  }

  // Получение всех товаров
  getAllProducts(req, res) {
    try {
      const { category, minPrice, maxPrice } = req.query;
      let filteredProducts = [...products];

      // Фильтрация по категории
      if (category) {
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Фильтрация по цене
      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
      }

      res.json(filteredProducts);
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({ error: 'Ошибка при получении списка товаров' });
    }
  }

  // Получение товара по ID
  getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = products.find(p => p.id === id);

      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
      }

      res.json(product);
    } catch (error) {
      console.error('Get product by id error:', error);
      res.status(500).json({ error: 'Ошибка при получении товара' });
    }
  }

  // Обновление товара
  updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { title, category, description, price } = req.body;

      const product = products.find(p => p.id === id);
      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
      }

      // Валидация цены, если она передана
      if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
      }

      product.update({ title, category, description, price });
      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении товара' });
    }
  }

  // Удаление товара
  deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const index = products.findIndex(p => p.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
      }

      const deletedProduct = products[index];
      products.splice(index, 1);

      res.json({ 
        message: 'Товар успешно удален',
        deletedProduct 
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Ошибка при удалении товара' });
    }
  }
}

module.exports = new ProductsController();