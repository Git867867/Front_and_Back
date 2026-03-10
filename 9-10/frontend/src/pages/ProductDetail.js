import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setFormData({
        name: response.data.name,
        price: response.data.price,
        description: response.data.description || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/products/${id}`, formData);
      setProduct(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async () => {
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await api.delete(`/products/${id}`);
        navigate('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!product) return <div className="loading">Товар не найден</div>;

  return (
    <div className="product-detail-container">
      <header className="detail-header">
        <Link to="/products" className="back-btn">← Назад к списку</Link>
        <h1>Детальная информация о товаре</h1>
      </header>

      {editing ? (
        <form onSubmit={handleUpdateProduct} className="edit-form">
          <h3>Редактирование товара</h3>
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
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Сохранить</button>
            <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="product-info">
          <div className="info-row">
            <label>ID:</label>
            <span>{product.id}</span>
          </div>
          <div className="info-row">
            <label>Название:</label>
            <span>{product.name}</span>
          </div>
          <div className="info-row">
            <label>Цена:</label>
            <span>{product.price} ₽</span>
          </div>
          <div className="info-row">
            <label>Описание:</label>
            <span>{product.description || 'Нет описания'}</span>
          </div>
          <div className="info-row">
            <label>Дата создания:</label>
            <span>{new Date(product.createdAt).toLocaleString()}</span>
          </div>

          <div className="detail-actions">
            <button onClick={() => setEditing(true)} className="edit-btn">
              Редактировать
            </button>
            <button onClick={handleDeleteProduct} className="delete-btn">
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;