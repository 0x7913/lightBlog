import { createApp } from 'vue'
import { createPinia } from "pinia";
// import persistedState from "pinia-plugin-persistedstate";
import { Icon } from "@iconify/vue";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./router";
import App from './App.vue'

const pinia = createPinia();
const app = createApp(App)

// pinia.use(persistedState);

app.use(pinia);
app.component("Icon", Icon);
app.use(router)
app.use(ElementPlus)
app.mount('#app');
