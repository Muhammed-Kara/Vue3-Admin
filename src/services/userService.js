import api from './api';

export const userService = {
  // Tüm kullanıcıları getir (Sayfalama ve filtreleme parametreleriyle)
  getUsers(params) {
    return api.get('/users', { params });
  },
  
  // Tek bir kullanıcı detayı
  getUserById(id) {
    return api.get(`/users/${id}`);
  },
  
  // Yeni kullanıcı oluştur
  createUser(userData) {
    return api.post('/users', userData);
  },
  
  // Kullanıcı güncelle
  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  },
  
  // Kullanıcı sil
  deleteUser(id) {
    return api.delete(`/users/${id}`);
  }
};