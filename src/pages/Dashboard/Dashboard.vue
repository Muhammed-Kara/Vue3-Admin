<template>
  <div class="dash-root">
   
    <div class="topbar">
      <div class="topbar-left">
        <span class="topbar-tick" aria-hidden="true"></span>
        <div>
          <h2 class="topbar-title">Sistem Özeti</h2>
          <p class="topbar-sub">
            Son güncelleme
            <span class="mono">{{ currentTime }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- API Bağlantı Uyarısı -->
    <Transition name="rise">
      <div v-if="error" class="notice-banner">
        <i class="pi pi-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>
    </Transition>

    <!-- Yükleniyor Durumu: iskelet kartlar -->
    <div v-if="loading" class="skeleton-grid">
      <div v-for="n in 4" :key="'kpi-sk-' + n" class="skeleton-card kpi-shape"></div>
      <div class="skeleton-card chart-shape"></div>
      <div class="skeleton-card chart-shape"></div>
    </div>

    <!-- Veriler Yüklendiğinde Gösterilecek İçerik -->
    <template v-else>
      <!-- KPI Kartları -->
      <div class="kpi-grid">
        <div
          v-for="(kpi, idx) in kpiList"
          :key="kpi.key"
          class="kpi-card enter"
          :style="{ animationDelay: idx * 70 + 'ms', '--accent': kpi.accent }"
        >
          <div class="kpi-tick"></div>
          <div class="kpi-body">
            <p class="kpi-label">{{ kpi.label }}</p>
            <p class="kpi-value mono">
              <span v-if="kpi.prefix">{{ kpi.prefix }}</span>{{ kpi.display }}<span v-if="kpi.suffix">{{ kpi.suffix }}</span>
            </p>
          </div>
          <div class="kpi-icon">
            <i :class="kpi.icon"></i>
          </div>
        </div>
      </div>

      <!-- Grafikler -->
      <div class="chart-grid">
        <div class="chart-card enter" style="animation-delay: 280ms">
          <div class="chart-head">
            <h3>Aylık Satış Trendi</h3>
            <span class="chart-tag mono">6 AY</span>
          </div>
          <Chart :key="'line-' + themeStore.theme" type="line" :data="chartData.sales" :options="lineChartOptions" class="chart-canvas" />
        </div>
        <div class="chart-card enter" style="animation-delay: 350ms">
          <div class="chart-head">
            <h3>Kullanıcı Dağılımı</h3>
            <span class="chart-tag mono">ROL</span>
          </div>
          <div class="donut-wrap">
            <Chart :key="'donut-' + themeStore.theme" type="doughnut" :data="chartData.users" :options="pieChartOptions" class="chart-canvas" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { dashboardService } from '../../services/dashboardService';
import { useThemeStore } from '../../store/theme';
import Chart from 'primevue/chart';

const themeStore = useThemeStore();

/* ---------------------------------------------------------
   Saat
--------------------------------------------------------- */
const currentTime = ref(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
let clockTimer = null;

/* ---------------------------------------------------------
   Durum
--------------------------------------------------------- */
const loading = ref(true);
const error = ref(null);

const stats = ref({});
const chartData = ref({ sales: { labels: [], datasets: [] }, users: { labels: [], datasets: [] } });

/* ---------------------------------------------------------
   Mock (Sahte) Veriler
--------------------------------------------------------- */
const mockStats = {
  totalSales: '₺142,350',
  newUsers: '1,842',
  activeOrders: '126',
  pendingTasks: '8',
};

function buildMockChartData() {
  const p = themeStore.palette;
  return {
    sales: {
      labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
      datasets: [
        {
          label: 'Satışlar (₺)',
          data: [65000, 59000, 80000, 81000, 96000, 142350],
          fill: true,
          borderColor: p.accentTeal,
          backgroundColor: hexToRgba(p.accentTeal, 0.12),
          pointBackgroundColor: p.accentTeal,
          pointBorderColor: p.surface,
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
        },
      ],
    },
    users: {
      labels: ['Admin', 'Editör', 'Standart Kullanıcı'],
      datasets: [
        {
          data: [5, 15, 80],
          backgroundColor: [p.accentBlue, p.accentAmber, p.accentTeal],
          hoverBackgroundColor: [p.accentBlue, p.accentAmber, p.accentTeal],
          borderColor: p.surface,
          borderWidth: 2,
        },
      ],
    },
  };
}

function hexToRgba(hex, alpha) {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------------------------------------------------------
   Grafik Ayarları (temaya duyarlı)
--------------------------------------------------------- */
const lineChartOptions = computed(() => ({
  plugins: { legend: { display: false } },
  maintainAspectRatio: false,
  scales: {
    x: { grid: { color: themeStore.palette.gridLine }, ticks: { color: themeStore.palette.chartText } },
    y: { grid: { color: themeStore.palette.gridLine }, ticks: { color: themeStore.palette.chartText } },
  },
}));

const pieChartOptions = computed(() => ({
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: themeStore.palette.chartText, usePointStyle: true, boxWidth: 8 },
    },
  },
  maintainAspectRatio: false,
  cutout: '68%',
}));

/* ---------------------------------------------------------
   KPI listesi + sayaç animasyonu
--------------------------------------------------------- */
const kpiTargets = reactive({
  totalSales: { label: 'Toplam Satış', icon: 'pi pi-wallet', accentKey: 'accentTeal', prefix: '₺' },
  newUsers: { label: 'Yeni Kullanıcılar', icon: 'pi pi-users', accentKey: 'accentBlue' },
  activeOrders: { label: 'Aktif Siparişler', icon: 'pi pi-shopping-cart', accentKey: 'accentAmber' },
  pendingTasks: { label: 'Bekleyen İşlemler', icon: 'pi pi-exclamation-circle', accentKey: 'accentRust' },
});

const displayValues = reactive({ totalSales: 0, newUsers: 0, activeOrders: 0, pendingTasks: 0 });

function parseNumeric(raw) {
  if (raw === undefined || raw === null) return 0;
  const digits = String(raw).replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function animateCount(key, target) {
  const duration = 700;
  const start = performance.now();
  const from = 0;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    displayValues[key] = target;
    return;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    displayValues[key] = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const kpiList = computed(() =>
  Object.keys(kpiTargets).map((key) => {
    const cfg = kpiTargets[key];
    return {
      key,
      label: cfg.label,
      icon: cfg.icon,
      accent: themeStore.palette[cfg.accentKey],
      prefix: cfg.prefix || '',
      display: displayValues[key].toLocaleString('tr-TR'),
    };
  })
);

/* ---------------------------------------------------------
   Verileri Çekme Fonksiyonu
--------------------------------------------------------- */
const loadDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [statsResponse, chartResponse] = await Promise.all([
      dashboardService.getSummaryStats(),
      dashboardService.getChartData(),
    ]);

    stats.value = statsResponse.data;
    chartData.value = chartResponse.data;
  } catch (err) {
    error.value = 'Gerçek sunucuya ulaşılamadı. Tasarımı inceleyebilmeniz için geçici veriler gösteriliyor.';
    stats.value = mockStats;
    chartData.value = buildMockChartData();
  } finally {
    loading.value = false;
    Object.keys(kpiTargets).forEach((key) => {
      animateCount(key, parseNumeric(stats.value[key]));
    });
  }
};

onMounted(() => {
  loadDashboardData();
  clockTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }, 30000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

.dash-root {
  font-family: 'Inter', system-ui, sans-serif;
}

.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* Üst şerit */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  box-shadow: 0 1px 2px var(--shadow);
  margin-bottom: 1.25rem;
}
.topbar-left { display: flex; align-items: center; gap: 0.75rem; }
.topbar-tick {
  width: 4px;
  height: 34px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--text) 0%, transparent 140%);
  opacity: 0.25;
}
.topbar-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
  margin: 0;
}
.topbar-sub {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Uyarı */
.notice-banner {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--surface-soft);
  border-left: 3px solid var(--accent, #B9762E);
  border-radius: 0 0.6rem 0.6rem 0;
  padding: 0.85rem 1rem;
  margin-bottom: 1.25rem;
  color: var(--text);
  font-size: 0.85rem;
}
.notice-banner i { color: #B9762E; font-size: 1.05rem; }
.notice-banner p { margin: 0; }

.rise-enter-active { transition: all 0.25s ease; }
.rise-enter-from { opacity: 0; transform: translateY(-6px); }

/* KPI kartları */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}
@media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .kpi-grid { grid-template-columns: 1fr; } }

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 1px 2px var(--shadow);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow);
}
.kpi-tick {
  position: absolute;
  left: 0;
  top: 0.9rem;
  bottom: 0.9rem;
  width: 3px;
  border-radius: 3px;
  background: var(--accent);
}
.kpi-body { flex: 1; padding-left: 0.5rem; }
.kpi-label {
  margin: 0 0 0.3rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}
.kpi-value {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.kpi-icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
  font-size: 1.05rem;
  flex-shrink: 0;
}

/* Grafik kartları */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
@media (max-width: 900px) { .chart-grid { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px var(--shadow);
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}
.chart-head h3 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
}
.chart-tag {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  background: var(--surface-soft);
  border: 1px solid var(--border);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.chart-canvas { height: 16rem; }
.donut-wrap { display: flex; justify-content: center; }

/* Giriş animasyonu */
.enter {
  animation: dashEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes dashEnter {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* İskelet yükleme durumu */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}
.skeleton-card {
  background: linear-gradient(100deg, var(--surface-soft) 30%, var(--border) 50%, var(--surface-soft) 70%);
  background-size: 200% 100%;
  animation: shimmer 1.3s ease-in-out infinite;
  border-radius: 0.9rem;
  border: 1px solid var(--border);
}
.kpi-shape { height: 5.5rem; }
.chart-shape { height: 20rem; grid-column: span 2; }
@media (max-width: 1024px) {
  .skeleton-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .chart-shape { grid-column: span 2; }
}
@media (max-width: 560px) {
  .skeleton-grid { grid-template-columns: 1fr; }
  .chart-shape { grid-column: span 1; }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .enter, .skeleton-card, .kpi-card { animation: none !important; transition: none !important; }
}
</style>