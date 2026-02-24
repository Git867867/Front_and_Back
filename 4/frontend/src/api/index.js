import axios from 'axios';

// Настройка подключения к серверу
const api = axios.create({
    baseURL: 'http://localhost:3000'
});

// Получить все товары
export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

// Получить один товар
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// Создать товар
export const createProduct = async (product) => {
    const response = await api.post('/products', product);
    return response.data;
};

// Обновить товар
export const updateProduct = async (id, product) => {
    const response = await api.patch(`/products/${id}`, product);
    return response.data;
};

// Удалить товар
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};