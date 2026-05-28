import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getProducts = () => axios.get(`${API_URL}/products`);

export const getProductById = (id) => axios.get(`${API_URL}/products/${id}`);

export const createProduct = (data) => axios.post(`${API_URL}/products`, data);

export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);

export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

export const uploadImage = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_URL}/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
