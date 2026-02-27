import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';

const UserList = ({ refreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', age: '' });
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить пользователя?')) {
      try {
        setDeleteLoading(id);
        await userAPI.delete(id);
        await fetchUsers();
      } catch (err) {
        setError('Ошибка при удалении пользователя');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, age: user.age });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', age: '' });
  };

  const handlePatch = async (id) => {
    try {
      setLoading(true);
      await userAPI.patch(id, editForm);
      await fetchUsers();
      cancelEdit();
    } catch (err) {
      setError('Ошибка при обновлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2 text-muted">Загрузка пользователей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5 className="alert-heading">Ошибка!</h5>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger btn-sm" onClick={fetchUsers}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <>
      {users.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">Пользователей пока нет</p>
          <small className="text-muted">
            Добавьте первого пользователя с помощью формы выше
          </small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Возраст</th>
                <th className="text-end">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <code className="bg-light p-1 rounded">{user.id}</code>
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <span className="fw-bold">{user.name}</span>
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        min="0"
                        max="150"
                      />
                    ) : (
                      <span className="badge bg-info text-dark">{user.age} лет</span>
                    )}
                  </td>
                  <td className="text-end">
                    {editingId === user.id ? (
                      <>
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handlePatch(user.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : 'Сохранить'}
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEdit}
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => startEdit(user)}
                        >
                          Изменить
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteLoading === user.id}
                        >
                          {deleteLoading === user.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : 'Удалить'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="text-muted small mt-3">
            Всего пользователей: <strong>{users.length}</strong>
          </div>
        </div>
      )}
    </>
  );
};

export default UserList;