# User Management Application

Приложение для управления пользователями с REST API и документацией Swagger.

## Описание проекта

Проект представляет собой полноценное веб-приложение для управления пользователями, состоящее из:
- **Backend**: REST API на Express.js с документацией Swagger/OpenAPI
- **Frontend**: Клиентское приложение на React.js

## Функциональность

- Просмотр списка всех пользователей
- Добавление нового пользователя
- Редактирование данных пользователя (частичное и полное)
- Удаление пользователя
- Интерактивная документация API через Swagger UI
- Валидация входных данных
- Логирование запросов

## Технологии

### Backend
- Node.js
- Express.js
- Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- nanoid (генерация уникальных ID)

### Frontend
- React 18
- Axios (HTTP клиент)
- Bootstrap 5 (стилизация)

## Установка и запуск

### Предварительные требования
- Node.js (версия 14 или выше)
- npm или yarn

### Backend

```bash
cd backend
npm install
npm start