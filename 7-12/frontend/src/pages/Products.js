import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const canCreate = user && (user.role === 'seller' || user.role === 'admin');
  const canEdit = user && (user.role === 'seller' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/products', formData);
      setProducts([...products, response.data]);
      setShowForm(false);
      setFormData({ name: '', price: '', description: '' });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!isAdmin) {
      alert('Только администратор может удалять товары');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="products-container">
      <header className="products-header">
        <h1>Управление товарами</h1>
        <div className="user-info">
          <span>Пользователь: {user?.username} ({user?.role})</span>
          {isAdmin && (
            <Link to="/admin/users" className="admin-link">Управление пользователями</Link>
          )}
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </header>

      {canCreate && (
        <div className="products-actions">
          <button onClick={() => setShowForm(!showForm)} className="create-btn">
            {showForm ? 'Отмена' : 'Создать товар'}
          </button>
        </div>
      )}

      {showForm && canCreate && (
        <form onSubmit={handleCreateProduct} className="product-form">
          <h3>Создание нового товара</h3>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Цена *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <button type="submit" className="submit-btn">Создать</button>
        </form>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <p className="no-products">Товары отсутствуют</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="product-price">{product.price} ₽</p>
              <p className="product-description">{product.description || 'Нет описания'}</p>
              <div className="product-actions">
                <Link to={`/products/${product.id}`} className="view-btn">
                  Просмотр
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="delete-btn"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;