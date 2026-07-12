import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import PrimeVue from 'primevue/config'

// CSS ve PrimeVue Temaları
import './style.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-blue/theme.css' 

import App from './App.vue'

const app = createApp(App)

// Eklentileri Vue'ya dahil ediyoruz
app.use(createPinia())
app.use(router)
app.use(PrimeVue)

app.mount('#app')