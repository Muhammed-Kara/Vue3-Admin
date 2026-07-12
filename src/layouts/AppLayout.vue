<template>
  <div class="app-layout" :style="themeStore.themeVars">
    
    <!-- Sidebar -->
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="icon-wrapper">
          <i class="pi pi-th-large text-teal-500"></i>
        </div>
        <span class="logo-text">Admin Panel</span>
      </div>
   <nav class="sidebar-nav">
        <!-- Dashboard için exact-active-class kullanıyoruz (Sadece tam / ise aktif olur) -->
        <router-link to="/" class="nav-item" exact-active-class="active-route">
          <div class="icon-wrapper"><i class="pi pi-home"></i></div>
          <span class="nav-text">Dashboard</span>
        </router-link>
        
        <!-- Kullanıcılar için normal active-class kullanıyoruz -->
        <router-link to="/users" class="nav-item" active-class="active-route">
          <div class="icon-wrapper"><i class="pi pi-users"></i></div>
          <span class="nav-text">Kullanıcılar</span>
        </router-link>
      </nav>
    </aside>

    <!-- Ana İçerik Bölümü -->
    <div class="app-main">
      
      <!-- Üst Çubuk -->
      <header class="app-header">
        <h1 class="page-title">{{ $route.name }}</h1>
        <!-- Üst Çubuk -->
        <div class="header-actions">
        
          
          <div class="user-profile">
            <div class="avatar">
              {{ authStore.user?.name ? authStore.user.name.charAt(0) : 'M' }}
            </div>
            <span class="user-name hidden sm:block">{{ authStore.user?.name || 'Kullanıcı' }}</span>
          </div>
          
          <button class="icon-btn logout-btn" @click="handleLogout" title="Çıkış Yap">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </header>

      <!-- Sayfa İçeriği -->
      <main class="app-content">
        <div class="content-container">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
      
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.app-layout {
  display: flex; height: 100vh; width: 100vw; overflow: hidden;
  background-color: var(--bg); color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Sidebar Yama Hissi Giderildi (Gölge kalktı, temiz border geldi) */
.app-sidebar {
  width: 80px; flex-shrink: 0; background-color: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; white-space: nowrap; display: flex; flex-direction: column;
  z-index: 20;
}

.app-sidebar:hover { width: 260px; }

.sidebar-header {
  height: 76px; display: flex; align-items: center; padding: 0 1.25rem; gap: 1rem;
  font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 700;
  border-bottom: 1px solid var(--border);
}

/* İkonlar İçin Ortalamayı Sağlayan Taşıyıcı */
.icon-wrapper {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 1.25rem; border-radius: 0.5rem;
}

.logo-text { opacity: 0; transition: opacity 0.2s; }
.app-sidebar:hover .logo-text { opacity: 1; transition-delay: 0.1s; }

.sidebar-nav { padding: 1.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }

.nav-item {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;
  border-radius: 0.75rem; color: var(--text-muted); text-decoration: none;
  font-weight: 500; transition: all 0.2s ease;
}

.nav-item:hover { background-color: var(--surface-soft); color: var(--text); }

.active-route {
  background-color: color-mix(in srgb, var(--accent-teal) 12%, transparent) !important;
  color: var(--accent-teal) !important;
  font-weight: 600;
}

.nav-text { opacity: 0; transition: opacity 0.2s; }
.app-sidebar:hover .nav-text { opacity: 1; transition-delay: 0.1s; }

.app-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.app-header {
  height: 76px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; background-color: var(--surface); border-bottom: 1px solid var(--border);
  z-index: 10;
}

.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 1rem; }

.icon-btn {
  width: 40px; height: 40px; border-radius: 50%; border: none; background: transparent;
  color: var(--text-muted); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease; font-size: 1.15rem;
}
.icon-btn:hover { background-color: var(--surface-soft); color: var(--text); }
.icon-btn.logout-btn:hover { color: var(--accent-rust); background-color: color-mix(in srgb, var(--accent-rust) 15%, transparent); }

.user-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0 0.75rem; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }
.avatar { width: 36px; height: 36px; border-radius: 50%; background-color: color-mix(in srgb, var(--accent-blue) 20%, transparent); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; font-weight: 700; }
.user-name { font-weight: 500; font-size: 0.95rem; }

/* İçerik Ortalaması ve Orantısı */
.app-content { flex: 1; padding: 2rem; overflow-y: auto; background-color: var(--bg); display: flex; justify-content: center; }
.content-container { width: 100%; max-width: 1400px; /* Çok büyük ekranlarda yayılmayı önler */ }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(15px) scale(0.99); }
</style>