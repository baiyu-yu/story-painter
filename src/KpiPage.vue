<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NConfigProvider, NMessageProvider, NModalProvider, NNotificationProvider, darkTheme, lightTheme } from "naive-ui";
import { useDark } from '@vueuse/core'
import KpiReviewer from './components/KpiReviewer.vue';
import { useStore } from './store';
import { packNameId } from './logManager/types';

const isDark = useDark({ disableTransition: false })
const store = useStore();

onMounted(() => {
  // Load data from localStorage
  const dataStr = localStorage.getItem('kpi_data');
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      if (data.logs) store.items = data.logs;
      if (data.characters) store.pcList = data.characters;
      if (data.characters) {
        for (const pc of data.characters) {
           store.pcMap.set(packNameId(pc), pc);
        }
      }
    } catch (e) {
      console.error("Failed to load KPI data", e);
    }
  }
});
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : lightTheme">
    <n-message-provider>
      <n-modal-provider>
        <n-notification-provider>
            <div class="h-screen w-screen bg-gray-100 dark:bg-gray-900 p-4 overflow-hidden flex flex-col hand-drawn-theme">
                <div class="hand-drawn-box bg-white dark:bg-gray-800 flex-grow h-full overflow-hidden">
                    <kpi-reviewer />
                </div>
            </div>
        </n-notification-provider>
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* Global styles if needed */
html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
}
</style>
