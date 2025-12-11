import { createApp } from "vue";
import KpiPage from "./KpiPage.vue";
import "~/styles/index.scss";
import { createPinia } from 'pinia'

const app = createApp(KpiPage);
app.use(createPinia())
app.mount("#app");
