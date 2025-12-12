<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from '~/store';
import { LogItem, packNameId } from '~/logManager/types';
import { logMan } from '~/logManager/logManager';
import * as echarts from 'echarts';
import { NDataTable, NSelect, NButton, NGrid, NGridItem, useMessage, NIcon } from 'naive-ui';

const store = useStore();
const message = useMessage();
const infoText = ref('');

const groupingOptions = [
  { label: '每条显示', value: 1 },
  { label: '每10条', value: 10 },
  { label: '每20条', value: 20 },
  { label: '每50条', value: 50 },
  { label: '每100条', value: 100 },
];

const selectedGrouping = ref(10); // Default 10
const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const realProcessedData = computed(() => {
  const logs = store.items;
  const N = logs.length;
  const groupSize = selectedGrouping.value;
  const numGroups = Math.ceil(N / groupSize);

  const characterStats = new Map<string, {
    name: string;
    totalWords: number;
    color: string;
    values: number[];
  }>();

  // Initialize stats
  logs.forEach((log) => {
    if (!log.message) return;
    const idWithUser = packNameId(log);
    const pcExact = store.pcMap.get(idWithUser);
    const pcByName = pcExact || store.pcList.find(p => p.name === log.nickname);
    const key = pcExact ? idWithUser : (pcByName ? pcByName.name : (log.nickname || 'Unknown'));
    if (!characterStats.has(key)) {
      characterStats.set(key, {
        name: pcByName?.name || log.nickname || 'Unknown',
        totalWords: 0,
        color: pcByName?.color || '#000000',
        values: new Array(numGroups).fill(0)
      });
    }
  });

  // Aggregate data
  logs.forEach((log, i) => {
    if (!log.message) return;
    const idWithUser = packNameId(log);
    const pcExact = store.pcMap.get(idWithUser);
    const pcByName = pcExact || store.pcList.find(p => p.name === log.nickname);
    const key = pcExact ? idWithUser : (pcByName ? pcByName.name : (log.nickname || 'Unknown'));
    const stats = characterStats.get(key);
    if (!stats) return;
    const wordCount = log.message.length;
    stats.totalWords += wordCount;
    
    const groupIndex = Math.floor(i / groupSize);
    if (groupIndex < numGroups) {
      stats.values[groupIndex] += wordCount;
    }
  });

  const statSize = characterStats.size;
  infoText.value = `日志: ${N}，角色: ${store.pcList.length}，分组: ${groupSize}，系列: ${statSize}`;
  console.log('[KPI] items', N, 'pcList', store.pcList.length, 'groupsize', groupSize, 'series', statSize);
  return { characterStats, numGroups };
});

const updateChart = () => {
  try {
    if (!chartInstance && chartContainer.value) {
      chartInstance = echarts.init(chartContainer.value);
    }
    
    if (!chartInstance) return;

    const { characterStats, numGroups } = realProcessedData.value;
    
    // If chartInstance is disposed or not init, re-init
    if (!chartInstance || chartInstance.isDisposed()) {
       if (chartContainer.value) {
          chartInstance = echarts.init(chartContainer.value);
       } else {
          return;
       }
    }

    const groupSize = selectedGrouping.value;
    const N = store.items.length;
    const maxAxis = Math.ceil(N / groupSize) * groupSize;

    const series = Array.from(characterStats.values()).map(char => {
      const seriesData = char.values.map((y, i) => [(i * groupSize) + (groupSize / 2), y]);
      return {
        name: char.name,
        type: 'line',
        smooth: true,
        data: seriesData,
        itemStyle: { color: char.color },
      };
    });

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%', // Space for dataZoom
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: false,
        min: 0,
        max: maxAxis,
        interval: groupSize,
        axisLabel: {
          showMinLabel: true,
          showMaxLabel: true
        },
        axisTick: { show: true },
        minorTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '字数'
      },
      series: series,
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100
        }
      ]
    };

    chartInstance.setOption(option, true);
  } catch (error) {
    console.error("Failed to update chart", error);
    message.error("图表生成失败，请检查数据");
  }
};

watch([() => store.items, selectedGrouping], () => {
  // Force update next tick
  setTimeout(updateChart, 100);
}, { deep: true });

onMounted(() => {
  // Delay slightly to ensure container is ready if in modal
  setTimeout(() => {
     // If store items empty, try reload from localStorage just in case?
     // Actually KpiPage does that.
     // But we need to make sure KpiReviewer sees the store update.
     updateChart();
  }, 500);
  console.log('[KPI] onMounted items', store.items.length, 'pcList', store.pcList.length);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

const handleResize = () => {
  chartInstance?.resize();
};

const handleRefresh = () => {
  // In standalone page mode, we don't have access to editor.
  // The data is passed via localStorage.
  // Refreshing could mean reloading the page to fetch latest from localStorage if Main updated it.
  // Or simply re-reading localStorage.
  const dataStr = localStorage.getItem('kpi_data');
  if (dataStr) {
      try {
          const data = JSON.parse(dataStr);
          if (data.logs) store.items = data.logs;
          if (data.characters) store.pcList = data.characters;
          // Trigger chart update via watcher
          message.success('数据已刷新');
          console.log('[KPI] refreshed items', store.items.length, 'pcList', store.pcList.length);
      } catch (e) {
          console.error(e);
          message.error('刷新失败');
      }
  } else {
      message.warning('未找到数据，请从主页面重新打开');
  }
};

// Table columns
const columns = [
  { title: '角色', key: 'name' },
  { title: '总字数', key: 'totalWords', sorter: (row1: any, row2: any) => row1.totalWords - row2.totalWords },
  { 
      title: '占比', 
      key: 'percentage',
      render(row: any) {
          return `${row.percentage}%`
      },
      sorter: (row1: any, row2: any) => parseFloat(row1.percentage) - parseFloat(row2.percentage)
  }
];

const tableData = computed(() => {
    const stats = Array.from(realProcessedData.value.characterStats.values());
    const totalAll = stats.reduce((acc, cur) => acc + cur.totalWords, 0);
    return stats.map(s => ({
        name: s.name,
        totalWords: s.totalWords,
        percentage: totalAll ? ((s.totalWords / totalAll) * 100).toFixed(2) : '0.00',
        color: s.color
    })).sort((a, b) => b.totalWords - a.totalWords);
});

</script>

<template>
  <div class="kpi-reviewer flex flex-col gap-4 p-2 h-full overflow-y-auto bg-[#f0f0f0]">
    <div class="hand-drawn-box p-4 flex-shrink-0">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold" style="font-family: 'Comic Sans MS', cursive;">参数设置</h3>
        <button class="hand-drawn-btn" @click="handleRefresh">刷新数据</button>
      </div>
      <div class="flex flex-col md:flex-row gap-4">
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap font-bold text-gray-700">分组大小：</span>
            <select v-model="selectedGrouping" class="hand-drawn-select w-40">
                <option v-for="opt in groupingOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
          </div>
          <div class="flex items-center">
              <div class="text-xs text-gray-500 bg-white/50 p-2 rounded hand-drawn-box border-dashed border-gray-400" style="border-width: 1px;">
                  {{ infoText }}
              </div>
          </div>
      </div>
    </div>

    <div class="chart-container hand-drawn-box p-2 bg-white overflow-hidden flex-shrink-0" ref="chartContainer"></div>

    <div class="hand-drawn-box p-4 flex flex-col flex-grow min-h-[300px]">
      <h3 class="text-lg font-bold mb-2" style="font-family: 'Comic Sans MS', cursive;">详细数据</h3>
      <div class="flex-grow overflow-hidden relative">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="{ pageSize: 10 }"
          size="small"
          class="h-full absolute inset-0"
          flex-height
          :bordered="false"
          :single-line="false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  min-height: 400px;
  /* Ensure chart resizes properly */
  flex-shrink: 0; 
}

@media (max-width: 768px) {
    .chart-container {
        min-height: 300px;
    }
}
</style>
