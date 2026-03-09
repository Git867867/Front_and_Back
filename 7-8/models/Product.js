const { nanoid } = require('nanoid');

class Product {
  constructor(title, category, description, price) {
    this.id = nanoid(10);
    this.title = title;
    this.category = category;
    this.description = description;
    this.price = price;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
  }

  update(data) {
    if (data.title) this.title = data.title;
    if (data.category) this.category = data.category;
    if (data.description) this.description = data.description;
    if (data.price) this.price = data.price;
    this.updatedAt = new Date().toISOString();
  }
}

// База данных товаров
const products = [];

module.exports = { Product, products };