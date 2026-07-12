import api from './api';

export const authService = {
  // Giriş Yap
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },
  
  // Çıkış Yap (Backend tarafında token iptal edilecekse)
  logout() {
    return api.post('/auth/logout');
  },
  
  // Profil Bilgilerini Getir
  getProfile() {
    return api.get('/auth/me');
  }
};