<template>
  <div v-if="shouldRender">
    <span style="color: #aaa" class="_time" v-if="!store.exportOptions.timeHide">[color={{ getTimeColor() }}]{{ timeSolve(source) }}[/color]</span>
    <span :style="{ color: colorByName(source) }">[color={{ colorByName(source) }}]
      <span class="_nickname">{{ nicknameSolve(source) }}</span>
      <span v-html="renderedMessage"></span>
      [/color]</span>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import { LogItem, packNameId } from '~/logManager/types';
import { useStore } from '~/store';
import { escapeHTML, formatLogMessage } from '~/utils';
import { gray } from 'tailwindcss/colors';

const store = useStore();

const props = defineProps({
  source: {
    type: Object as () => LogItem,
    default: () => ({}),
  },
});

const getTimeColor = () => {
  if (store.bbsUseColorName) return 'silver';
  return gray['400'];
};

const colorByName = (i: LogItem) => {
  const info = store.pcMap.get(packNameId(i));
  if (store.bbsUseColorName) {
    return store.colorHexToName(info?.color || '#ffffff');
  }
  return info?.color || '#ffffff';
};

const nicknameSolve = (i: LogItem) => {
  let userid = '(' + i.IMUserId + ')';
  if (store.exportOptions.userIdHide) {
    userid = '';
  }
  return `<${i.nickname}${userid}>`;
};

const timeSolve = (i: LogItem) => {
  let timeText = i.time.toString();
  const options = store.exportOptions;
  if (typeof i.time === 'number' && i.time !== 0) {
    timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss');
  } else if (i.timeText) {
    timeText = i.timeText;
  } else {
    timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss');
  }
  if (options.timeHide) {
    timeText = '';
  }
  return timeText;
};

const nameReplace = (msg: string) => {
  for (const i of store.pcList) {
    msg = msg.replaceAll(`<${i.name}>`, `${i.name}`);
  }
  return msg;
};

const normalizedMessage = computed(() => {
  const source = props.source as LogItem;
  let msg = formatLogMessage(source.message || '', store.exportOptions, store.pcList, source.isDice, true, { imageHide: true });
  if (source.isDice) {
    msg = nameReplace(msg);
  }
  return msg.trim();
});

const renderedMessage = computed(() => {
  const source = props.source as LogItem;
  const msg = normalizedMessage.value;
  if (!msg) return '';

  if (store.bbsUseSpaceWithMultiLine) {
    const toSpace = (text: string) => {
      const lst: string[] = [];
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ':' || text[i] == '/' || text[i] === '[' || text[i] === ']') {
          lst.push('&nbsp;');
        } else {
          lst.push('&ensp;');
        }
      }
      lst.push('&nbsp;');
      return lst.join('');
    };
    return msg.replaceAll('<br />', '\n').replaceAll('\n', '<br/><span class="lf">\n</span>' + (!store.exportOptions.timeHide ? `<span style='color:#aaa'>${toSpace(timeSolve(source))}</span>` : '&ensp;') + escapeHTML(nicknameSolve(source)));
  }

  return msg.replaceAll('<br />', '\n').replaceAll('\n', '[/color]<br/><span class="lf">\n</span>' + (!store.exportOptions.timeHide ? `<span style='color:#aaa'>[color=${getTimeColor()}]${timeSolve(source)}[/color]</span>` : '') + `[color=${colorByName(source)}] ` + escapeHTML(nicknameSolve(source)));
});

const shouldRender = computed(() => normalizedMessage.value !== '');
</script>
