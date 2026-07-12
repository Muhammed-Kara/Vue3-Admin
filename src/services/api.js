import axios from 'axios';
import { useAuthStore } from '../store/auth';

// 1. Axios örneğini oluştur (Adresi .env dosyasından otomatik alır)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye yanıt bekleme süresi
});

// 2. Request Interceptor: Her istek gitmeden hemen önce çalışır
api.interceptors.request.use(
  (config) => {
    // Pinia store yüklenmeden önce çağrılmaması için fonksiyon içinde alıyoruz
    const token = localStorage.getItem('token');
    
    // Eğer kullanıcının token'ı varsa, API'ye giden her isteğin Header kısmına bunu ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: API'den cevap geldiğinde, arayüze ulaşmadan önce çalışır
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized hatası yakalarsak, token süresi bitmiş demektir. Kullanıcıyı at.
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login'; // Login'e şutla
    }
    return Promise.reject(error);
  }
);

export default api;