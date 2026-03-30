import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/products');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId) => {
    try {
      await api.put(`/users/${userId}`, { role: editRole });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user?.id) {
      alert('Нельзя удалить самого себя');
      return;
    }
    if (window.confirm('Вы уверены, что хотите удалить (заблокировать) пользователя?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="users-container">
      <header className="users-header">
        <h1>Управление пользователями</h1>
        <div className="user-info">
          <span>Администратор: {user?.username}</span>
          <button onClick={() => navigate('/products')} className="back-btn">Назад к товарам</button>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </header>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>
                  {editingUser === u.id ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option value="user">Пользователь</option>
                      <option value="seller">Продавец</option>
                      <option value="admin">Администратор</option>
                    </select>
                  ) : (
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  )}
                </td>
                <td className="user-actions">
                  {editingUser === u.id ? (
                    <>
                      <button onClick={() => handleUpdateRole(u.id)} className="save-btn">Сохранить</button>
                      <button onClick={() => setEditingUser(null)} className="cancel-btn">Отмена</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingUser(u.id);
                        setEditRole(u.role);
                      }} className="edit-user-btn">
                        Редактировать
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="delete-user-btn">
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;