import React, { useState } from 'react';
import { userAPI } from '../api';

const UserForm = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({ name: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Имя обязательно');
      return;
    }
    
    if (!formData.age || formData.age < 0 || formData.age > 150) {
      setError('Возраст должен быть от 0 до 150');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await userAPI.create({
        name: formData.name.trim(),
        age: Number(formData.age)
      });
      
      setSuccess('Пользователь успешно добавлен!');
      setFormData({ name: '', age: '' });
      
      if (onUserAdded) {
        onUserAdded();
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Имя пользователя</label>
        <input
          type="text"
          className={`form-control ${error && !formData.name ? 'is-invalid' : ''}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Введите имя"
          disabled={loading}
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="age" className="form-label">Возраст</label>
        <input
          type="number"
          className={`form-control ${error && !formData.age ? 'is-invalid' : ''}`}
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Введите возраст"
          min="0"
          max="150"
          disabled={loading}
          required
        />
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Ошибка!</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Успех!</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Добавление...
          </>
        ) : 'Добавить пользователя'}
      </button>
    </form>
  );
};

export default UserForm;