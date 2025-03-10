import { createApp } from 'vue'
import { Icon } from "@iconify/vue";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./router";
import App from './App.vue'

const app = createApp(App)
app.component("Icon", Icon);
app.use(router)
app.use(ElementPlus)
app.mount('#app');
