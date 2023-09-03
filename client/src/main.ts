import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import enUS from '@/locales/en.json'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const i18n = createI18n<[typeof enUS], 'en-US' | 'ru-RU'>({
  locale: 'en-US',
  messages: {
    'en-US': enUS
  },
  legacy: false
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
