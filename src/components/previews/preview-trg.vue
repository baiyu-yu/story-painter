<template>
  <div v-show="isShow" class="h-full flex flex-col">
    <div class="flex-shrink-0 mb-2">
      <div class="text-center mt-2 mb-8">
        <div>提示: 海豹骰与回声工坊已达成合作，<n-button type="primary" text tag="a" target="_blank" href="https://github.com/DanDDXuanX/TRPG-Replay-Generator">回声工坊</n-button>可以将日志一键转为视频。</div>
        <div>介绍和教程见这里：<n-button type="primary" text tag="a" target="_blank" href="https://www.bilibili.com/video/BV1PC4y1j7P2/">B站传送门</n-button></div>
      </div>

      <n-checkbox label="添加语音合成标记" v-model:checked="store.trgIsAddVoiceMark" />
    </div>

    <div class="preview flex-1 min-h-0 flex flex-col relative" ref="preview" id="preview">
      <div style="position: absolute; right: 2rem; direction: rtl;">
        <n-button secondary type="primary" @click="copied" id="btnCopyPreviewTRG" style="z-index: 100">一键复制</n-button>
        <div class="mt-0.5 text-xs">注意: 长文本复制会稍慢</div>
      </div>

      <div v-if="filteredPreviewItems.length === 0">
        <div>染色失败，内容为空或无法识别此格式。</div>
        <div>已知支持的格式有: 海豹 Log(json)、赵/ Dice! 原始文件、塔原始文件</div>
        <div>请先清空编辑框，再重新复制</div>
      </div>

      <VirtualList
        class="list-dynamic scroll-touch scroller flex-1 min-h-0"
        :data-key="'index'"
        :data-sources="filteredPreviewItems"
        :data-component="Item"
        :estimate-size="32"
        :item-class="''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ClipboardJS from 'clipboard';
import { computed, h, nextTick, ref, render, watch } from 'vue';
import { useStore } from '~/store';
import { LogItem } from '~/logManager/types';
import Item from './preview-trg-item.vue';
// @ts-ignore
import VirtualList from 'vue3-virtual-scroll-list';
import { useMessage } from 'naive-ui';
import { formatLogMessage } from '~/utils';

const props = defineProps<{
  isShow: boolean,
  previewItems: LogItem[],
}>();

const store = useStore();
const message = useMessage();

const copied = () => {
  message.success('进行了复制');
};

let clip: ClipboardJS;
const copyCount = ref(0);
const copyCountAll = ref(1);

const filteredPreviewItems = computed(() => {
  return props.previewItems.filter((item) => {
    if (store.isHiddenLogItem(item)) return false;
    const msg = formatLogMessage(item.message || '', store.exportOptions, store.pcList, item.isDice, false, { imageHide: true }).trim();
    return Boolean(msg || item.commandInfo);
  });
});

watch(() => props.isShow, (val: any) => {
  if (!val) return;

  nextTick(() => {
    if (clip) return;
    clip = new ClipboardJS('#btnCopyPreviewTRG', {
      text: () => {
        copyCountAll.value = filteredPreviewItems.value.length || 1;
        copyCount.value = 0;
        const el = document.createElement('span');
        const items = [];
        for (const i of filteredPreviewItems.value) {
          const html = h(Item, { source: i });
          render(html, el);
          items.push(el.textContent);
          copyCount.value += 1;
        }
        return items.join('\n');
      }
    });
  });
});
</script>
