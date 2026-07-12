import { defineStore } from 'pinia';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false, // Yükleme animasyonları için
    error: null,    // API'den dönen hata mesajları için
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // Servis üzerinden gerçek backend'e istek atıyoruz
        const response = await authService.login(email, password);
        
        // Backend'in dönüş yapısına göre burası özelleştirilebilir
        // Genelde response.data.token ve response.data.user şeklinde döner
        this.token = response.data.token;
        this.user = response.data.user;
        
        // Kullanıcı sayfayı yenilese bile oturumun açık kalması için:
        localStorage.setItem('token', this.token);
        
        return true; 
      } catch (err) {
        // Backend'den dönen özel bir hata mesajı varsa onu al, yoksa varsayılanı göster
        this.error = err.response?.data?.message || 'Giriş işlemi başarısız. Lütfen bilgilerinizi kontrol edin.';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      try {
        // Eğer backend tarafında da token'ı geçersiz kılmak (blacklist) gerekiyorsa:
        if (this.token) {
           await authService.logout();
        }
      } catch (err) {
        console.error("Çıkış yapılırken sunucu hatası oluştu:", err);
      } finally {
        // Sunucu hata verse bile arayüzde kullanıcıyı mutlaka dışarı atıyoruz
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
      }
    }
  }
});