<script setup lang="ts">
import { NCard, NFlex, NGrid, NGridItem, NSwitch } from 'naive-ui'
import { useDark, useToggle } from '@vueuse/core'
import { useStore } from '~/store'

const optionStore = useStore().exportOptions

const isDark = useDark({ disableTransition: false })
const toggleDark = useToggle(isDark)

interface Option {
  label: string
  desc: string
  key: keyof typeof optionStore
}

const generalOptions: Option[] = [
  { label: '骰子指令过滤', desc: '不显示 PC 指令，仅保留结果。', key: 'commandHide' },
  { label: '表情图片过滤', desc: '隐藏消息中的图片和表情。', key: 'imageHide' },
  { label: '场外发言过滤', desc: '过滤以（或 ( 开头的场外发言。', key: 'offTopicHide' },
  { label: '时间显示过滤', desc: '不显示日期和时间。', key: 'timeHide' },
  { label: '平台账号隐藏', desc: '不显示 QQ 号等 IM 账号。', key: 'userIdHide' },
  { label: '年月日不显示', desc: '时间仅显示时分秒。', key: 'yearHide' },
  { label: '首行缩进对齐', desc: '多行文本按消息前缀续行缩进。', key: 'textIndentAll' },
  { label: '展开合并转发', desc: '递归展开 forward CQ 为普通对话。', key: 'expandForward' },
]

const cqOptions: Option[] = [
  { label: 'forward', desc: '过滤合并转发 CQ。', key: 'filterCqForward' },
  { label: 'image', desc: '过滤图片 CQ。', key: 'filterCqImage' },
  { label: 'at', desc: '过滤 @ CQ。', key: 'filterCqAt' },
  { label: 'reply', desc: '过滤回复 CQ。', key: 'filterCqReply' },
  { label: 'json', desc: '过滤 JSON CQ。', key: 'filterCqJson' },
]
</script>

<template>
  <div class="option-view">
    <n-card size="small" title="通用选项" :bordered="false" class="option-card">
      <n-grid cols="1 640:2" :x-gap="12" :y-gap="12">
        <n-grid-item v-for="opt in generalOptions" :key="opt.key">
          <div class="option-item">
            <n-switch v-model:value="optionStore[opt.key]" />
            <div class="option-text">
              <strong>{{ opt.label }}</strong>
              <p>{{ opt.desc }}</p>
            </div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="option-item">
            <n-switch :value="isDark" @update:value="toggleDark()" />
            <div class="option-text">
              <strong>深色模式显示</strong>
              <p>以深色模式显示界面。</p>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <n-card size="small" title="CQ 过滤" :bordered="false" class="option-card">
      <p class="option-tip">下面几项集中控制 CQ 码过滤，不会再和其他开关散开。</p>
      <n-flex wrap size="small">
        <div v-for="opt in cqOptions" :key="opt.key" class="cq-chip">
          <span class="cq-chip-label">{{ opt.label }}</span>
          <n-switch size="small" v-model:value="optionStore[opt.key]" />
        </div>
      </n-flex>
    </n-card>
  </div>
</template>

<style scoped>
.option-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card :deep(.n-card__content) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
}

.option-text {
  min-width: 0;
}

.option-text p,
.option-tip {
  margin: 4px 0 0;
  color: rgba(0, 0, 0, 0.62);
  line-height: 1.45;
}

.cq-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.78);
}

.cq-chip-label {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
}

.dark .option-item,
.dark .cq-chip {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.dark .option-text p,
.dark .option-tip {
  color: rgba(255, 255, 255, 0.68);
}
</style>
