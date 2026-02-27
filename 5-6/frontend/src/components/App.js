import React, { useState } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';
import '../App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleUserAdded = () => {
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="app">
      <header className="header text-center">
        <div className="container">
          <h1>Управление пользователями</h1>
          <p className="lead">
            REST API с документацией Swagger
          </p>
          <a 
            href="http://localhost:3000/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="swagger-link"
          >
            Открыть Swagger документацию
          </a>
        </div>
      </header>

      <main className="container py-4">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
        
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Добавить нового пользователя</h4>
          </div>
          <div className="card-body">
            <UserForm onUserAdded={handleUserAdded} />
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-secondary text-white">
            <h4 className="mb-0">Список пользователей</h4>
          </div>
          <div className="card-body">
            <UserList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-muted">
        <small>
          Учебный проект • 4 семестр 2025/2026 • 
          Загородних Н.А., Краснослободцева Д.Б.
        </small>
      </footer>
    </div>
  );
}

export default App;