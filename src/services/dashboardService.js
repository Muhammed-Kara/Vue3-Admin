import api from './api';

export const dashboardService = {
  // Üstteki 4'lü özet kartlarının verilerini getirir
  getSummaryStats() {
    return api.get('/dashboard/summary');
  },
  
  // Alt kısımdaki grafiklerin verilerini getirir
  getChartData() {
    return api.get('/dashboard/charts');
  }
};