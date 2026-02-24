import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import './ProductsPage.css';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        rating: ''
    });

    // Загружаем товары при запуске
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                alert('Товар обновлен!');
            } else {
                await createProduct(formData);
                alert('Товар создан!');
            }
            
            setShowForm(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                rating: ''
            });
            loadProducts();
        } catch (error) {
            alert('Ошибка! Проверьте подключение к серверу');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData(product);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить товар?')) {
            await deleteProduct(id);
            alert('Товар удален!');
            loadProducts();
        }
    };

    return (
        <div className="container">
            <h1>🛒 Интернет-магазин</h1>
            
            <button onClick={() => setShowForm(true)} className="add-button">
                ➕ Добавить товар
            </button>

            {showForm && (
                <div className="modal">
                    <form onSubmit={handleSubmit}>
                        <h2>{editingProduct ? '✏️ Редактировать товар' : '🆕 Новый товар'}</h2>
                        
                        <input
                            type="text"
                            placeholder="Название товара *"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                        
                        <input
                            type="text"
                            placeholder="Категория *"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                        />
                        
                        <textarea
                            placeholder="Описание *"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                        
                        <input
                            type="number"
                            placeholder="Цена (₽) *"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required
                        />
                        
                        <input
                            type="number"
                            placeholder="Количество на складе *"
                            value={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            required
                        />
                        
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="Рейтинг (0-5)"
                            value={formData.rating}
                            onChange={(e) => setFormData({...formData, rating: e.target.value})}
                        />
                        
                        <div className="form-buttons">
                            <button type="submit" className="btn-save">
                                💾 Сохранить
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => {
                                setShowForm(false);
                                setEditingProduct(null);
                                setFormData({
                                    name: '',
                                    category: '',
                                    description: '',
                                    price: '',
                                    stock: '',
                                    rating: ''
                                });
                            }}>
                                ❌ Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <h3>{product.name}</h3>
                        <p className="category">📁 {product.category}</p>
                        <p className="description">{product.description}</p>
                        <p className="price">💰 {product.price.toLocaleString()} ₽</p>
                        <p className="stock">📦 В наличии: {product.stock} шт.</p>
                        {product.rating > 0 && (
                            <p className="rating">⭐ {product.rating} / 5</p>
                        )}
                        <div className="card-buttons">
                            <button onClick={() => handleEdit(product)} className="btn-edit">
                                ✏️ Редактировать
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="btn-delete">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductsPage;