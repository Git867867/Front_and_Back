const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

class User {
  constructor(email, firstName, lastName, password) {
    this.id = nanoid(10);
    this.email = email;
    this.first_name = firstName;
    this.last_name = lastName;
    this.passwordHash = null;
    this.createdAt = new Date().toISOString();
  }

  // Хеширование пароля
  async setPassword(password) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
  }

  // Проверка пароля
  async validatePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Возвращение пользователя
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      createdAt: this.createdAt
    };
  }
}

// База данных пользователей
const users = [];

module.exports = { User, users };