import { createSSRApp } from 'vue'
import App from './App.vue'
import { requestInterceptor } from './http/interceptor'
import { routeInterceptor } from './router/interceptor'
import Vant from 'vant'
import 'vant/lib/index.css'

import store from './store'
import '@/style/index.scss'
import 'virtual:uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(Vant)
  app.use(routeInterceptor)
  app.use(requestInterceptor)

  return {
    app,
  }
}
