<template>
  <div class="login-page" :style="themeStore.themeVars">
    
    <!-- Tema Değiştirici (Sağ Üstte Havada Asılı) -->
    <button class="theme-btn" @click="themeStore.toggleTheme">
      <i :class="themeStore.theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'"></i>
    </button>

    <div class="login-card">
      <div class="card-header">
        <i class="pi pi-th-large text-4xl mb-4 text-teal-500" style="color: var(--accent-teal)"></i>
        <h2>Admin Panel</h2>
        <p>Sisteme erişmek için giriş yapın</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>E-Posta Adresi</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope"></i>
            <input 
              v-model="email" 
              type="email" 
              required
              :disabled="authStore.loading"
              placeholder="admin@sirket.com"
            >
          </div>
        </div>

        <div class="input-group">
          <label>Şifre</label>
          <div class="input-wrapper">
            <i class="pi pi-lock"></i>
            <input 
              v-model="password" 
              type="password" 
              required
              :disabled="authStore.loading"
              placeholder="••••••"
            >
          </div>
        </div>

        <div v-if="authStore.error" class="error-msg">
          <i class="pi pi-exclamation-circle"></i> {{ authStore.error }}
        </div>

        <button type="submit" :disabled="authStore.loading" class="submit-btn">
          <i v-if="authStore.loading" class="pi pi-spin pi-spinner"></i>
          <span>{{ authStore.loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useThemeStore } from '../../store/theme';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/'); 
  }
};
</script>

<style scoped>
.login-page {
  width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;
  background-color: var(--bg); color: var(--text); font-family: 'Inter', sans-serif;
  transition: all 0.3s ease; position: relative;
}

.theme-btn {
  position: absolute; top: 2rem; right: 2rem; width: 44px; height: 44px; border-radius: 50%;
  background-color: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease; font-size: 1.2rem; box-shadow: 0 4px 12px var(--shadow);
}
.theme-btn:hover { background-color: var(--surface-soft); color: var(--text); }

.login-card {
  width: 100%; max-width: 400px; background-color: var(--surface);
  border: 1px solid var(--border); border-radius: 1.5rem; padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px var(--shadow);
}

.card-header { text-align: center; margin-bottom: 2rem; }
.card-header h2 { margin: 0 0 0.25rem; font-size: 1.5rem; font-weight: 700; color: var(--text); }
.card-header p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }

.login-form { display: flex; flex-direction: column; gap: 1.25rem; }

.input-group label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper i { position: absolute; left: 1rem; color: var(--text-muted); font-size: 1.1rem; }
.input-wrapper input {
  width: 100%; padding: 0.85rem 1rem 0.85rem 2.8rem;
  background-color: var(--surface-soft); border: 1px solid var(--border);
  border-radius: 0.75rem; color: var(--text); font-size: 0.95rem; outline: none; transition: all 0.2s ease;
}
.input-wrapper input:focus { border-color: var(--accent-teal); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-teal) 20%, transparent); }

.error-msg {
  background-color: color-mix(in srgb, var(--accent-rust) 10%, transparent);
  color: var(--accent-rust); padding: 0.75rem; border-radius: 0.75rem;
  font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
}

.submit-btn {
  background-color: var(--accent-teal); color: #fff; border: none; padding: 1rem;
  border-radius: 0.75rem; font-weight: 600; font-size: 1rem; cursor: pointer;
  display: flex; justify-content: center; align-items: center; gap: 0.5rem;
  transition: all 0.2s ease; margin-top: 0.5rem; box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-teal) 30%, transparent);
}
.submit-btn:hover:not(:disabled) { background-color: color-mix(in srgb, var(--accent-teal) 85%, #000); transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>