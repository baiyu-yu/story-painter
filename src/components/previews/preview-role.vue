<template>
  <div class="preview h-full" v-show="isShow">
    <div v-if="Object.keys(groupedItems).length === 0" class="p-4 text-gray-500">
      无内容
    </div>
    <div v-for="(items, name) in groupedItems" :key="name" class="mb-4 p-2 border rounded-lg bg-white/50 dark:bg-black/20">
      <div class="font-bold text-lg mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <span class="mr-2" :style="{ color: items[0] ? colorByName(items[0]) : 'inherit' }">●</span>
        {{ name }}
        <span class="text-xs font-normal text-gray-400 ml-2">({{ items.length }} 条)</span>
      </div>
      <div v-for="item in items" :key="item.index" class="pl-2 mb-1 text-sm leading-relaxed" :class="{ 'opacity-80 italic': item.isDice }">
        <span class="text-gray-400 text-xs mr-2 select-none" v-if="!store.exportOptions.timeHide">{{ timeSolve(item) }}</span>
        <span v-html="previewMessageSolve(item)"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '~/store';
import { LogItem, packNameId } from '~/logManager/types';
import dayjs from 'dayjs';
import { escapeHTML, msgCommandFormat, msgImageFormat, msgIMUseridFormat, msgOffTopicFormat, msgAtFormat } from '~/utils';

const props = defineProps<{
  isShow: boolean,
  previewItems: LogItem[],
}>();

const store = useStore();

const groupedItems = computed(() => {
  const groups: Record<string, LogItem[]> = {};
  for (const item of props.previewItems) {
    if (store.isHiddenLogItem(item)) continue;
    const name = item.nickname || 'Unknown';
    if (!groups[name]) groups[name] = [];
    groups[name].push(item);
  }
  return groups;
});

const colorByName = (i: LogItem) => {
  const info = store.pcMap.get(packNameId(i));
  return info?.color;
}

const timeSolve = (i: LogItem) => {
  let timeText = i.time.toString()
  const options = store.exportOptions
  if (options.timeHide) {
    timeText = ''
  } else {
    if (typeof i.time === 'number' && i.time !== 0) {
      timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss')
    } else {
      if (i.timeText) {
        timeText = i.timeText
      } else {
        timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss')
      }
    }
  }
  return timeText
}

const nameReplace = (msg: string) => {
  for (let i of store.pcList) {
    msg = msg.replaceAll(`<${i.name}>`, `${i.name}`)
  }
  return msg
}

const nicknameSolve = (i: LogItem) => {
  let userid = '(' + i.IMUserId + ')'
  const options = store.exportOptions
  if (options.userIdHide) {
    userid = ''
  }
  return `<${i.nickname}${userid}>:`
}

const previewMessageSolve = (i: LogItem) => {
  let msg = msgImageFormat(escapeHTML(i.message), store.exportOptions, true);
  msg = msgAtFormat(msg, store.pcList);
  msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);
  msg = msgCommandFormat(msg, store.exportOptions);
  msg = msgIMUseridFormat(msg, store.exportOptions, i.isDice);
  msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice); 

  if (i.isDice) {
    msg = nameReplace(msg)
  }
  
  // Simplified rendering for grouped view (no indentation calculation for now)
  return msg.replaceAll('<br />', '\n').replaceAll('\n', '<br />')
}
</script>
