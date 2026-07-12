import { defineStore } from 'pinia';

const THEMES = {
  light: {
    bg: '#EEF1F4',
    surface: '#FFFFFF',
    surfaceSoft: '#F5F7F9',
    border: '#E1E5EA',
    text: '#172033',
    textMuted: '#5F6B7A',
    shadow: 'rgba(23, 32, 51, 0.07)',
    gridLine: '#E7EAEE',
    chartText: '#5F6B7A',
    accentTeal: '#1F7A64',
    accentAmber: '#B9762E',
    accentBlue: '#35618C',
    accentRust: '#A6473A',
  },
  dark: {
    bg: '#0E141B',
    surface: '#161D26',
    surfaceSoft: '#1C242F',
    border: '#263140',
    text: '#E7ECF2',
    textMuted: '#8D99A8',
    shadow: 'rgba(0, 0, 0, 0.35)',
    gridLine: '#242E3A',
    chartText: '#8D99A8',
    accentTeal: '#3FAF93',
    accentAmber: '#D99A52',
    accentBlue: '#5A8FC2',
    accentRust: '#C97467',
  },
};

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('dashboard-theme') || 
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }),
  getters: {
    palette: (state) => THEMES[state.theme],
    themeVars: (state) => {
      const p = THEMES[state.theme];
      return {
        '--bg': p.bg,
        '--surface': p.surface,
        '--surface-soft': p.surfaceSoft,
        '--border': p.border,
        '--text': p.text,
        '--text-muted': p.textMuted,
        '--shadow': p.shadow,
        '--grid-line': p.gridLine,
        '--chart-text': p.chartText,
        '--accent-teal': p.accentTeal,
        '--accent-amber': p.accentAmber,
        '--accent-blue': p.accentBlue,
        '--accent-rust': p.accentRust,
      };
    }
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dashboard-theme', this.theme);
    }
  }
});