import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import routes from './router'
import { Icon } from '@iconify/vue'
import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'
import './styles/card.css'

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.component('VIcon', Icon)
})
