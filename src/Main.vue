<template>
  <n-layout class="hand-drawn-theme min-h-screen bg-transparent font-hand relative overflow-hidden">
    

    <n-layout-header class="bg-transparent z-10 relative">
      <n-flex class="py-3 text-2xl" size="large" align="center" justify="center" wrap>
        <n-flex align="center" justify="center">
          <strong>海豹TRPG跑团Log着色器</strong>
          <n-tag type="success" size="small" :bordered="false">v2.5.4</n-tag>
        </n-flex>
        <n-flex align="center" justify="center">
          <n-icon>
            <a href="https://github.com/sealdice/story-painter" target="_blank">
              <logo-github />
            </a>
          </n-icon>
          <n-button type="primary" @click="backV1">官网</n-button>
        </n-flex>
      </n-flex>
      <n-alert type="warning" class="mx-4 mb-2" :bordered="false">
        如果没能显示Log内容，请重新使用 <n-text code>.log end</n-text> 获取一个新链接
      </n-alert>
    </n-layout-header>
    
    <n-layout-content class="bg-transparent z-10 relative p-0 md:p-4">
      <n-spin :show="loading">
        <template #description>
          正在试图加载远程记录……
        </template>
        
        <div class="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden gap-4">
          
          <!-- LEFT PANEL (Mobile: Main View, PC: Editor/Settings) -->
          <div class="w-full md:w-5/12 flex flex-col gap-4 overflow-y-auto md:pr-2 left-col" v-show="notMobile">
            
            <!-- Mobile: Settings Button & Drawer -->
            <div v-if="!notMobile">
               <n-drawer v-model:show="showSettings" placement="bottom" height="70vh" class="hand-drawn-drawer rounded-t-2xl">
                  <n-drawer-content title="设置与角色" closable>
                     <n-tabs type="line">
                       <n-tab-pane name="settings" tab="设置">
                         <option-view></option-view>
                       </n-tab-pane>
                       <n-tab-pane name="roles" tab="角色分配">
                         <n-text type="info" italic class="block text-center my-1">SealDice骰QQ群 524364253</n-text>
                         <div class="pc-list">
                            <div v-for="(i, index) in store.pcList" :key="index" class="mb-2 w-full">
                              <div class="pc-card hand-drawn-box p-3">
                                <div class="pc-item-grid">
                                  <n-button type="error" size="small" secondary @click="deletePc(index, i)">
                                    <template #icon>
                                      <n-icon><icon-delete></icon-delete></n-icon>
                                    </template>
                                  </n-button>
              
                                  <n-input v-model:value="i.name" :prefix-icon="User" @focus="nameFocus(i)"
                                    @change="nameChanged(i)" placeholder="角色名" />
              
                                  <n-input :disabled="true" v-model:value="i.IMUserId" placeholder="账号" />
              
                                  <n-select v-model:value="i.role" class="pc-role-select"
                                  :options="[{ value: '主持人', label: '主持人' }, { value: '角色', label: '角色' }, { value: '骰子', label: '骰子' }, { value: '隐藏', label: '隐藏' }]" />
              
                                  <n-color-picker v-model:value="i.color" :show-alpha="false" show-preview :swatches="colors"
                                    :on-update:value="(v) => colorChanged(v, i)" />
                                </div>
                              </div>
                            </div>
                         </div>
                         <n-flex justify="center" class="mt-2">
                             <n-button text @click="refreshColors">刷新色板</n-button>
                         </n-flex>
                       </n-tab-pane>
                       <n-tab-pane name="tools" tab="工具箱">
                          <div class="flex flex-col gap-2">
                            <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openVnve">
                               <n-flex align="center" justify="space-between">
                                  <n-flex align="center">
                                    <n-icon size="24"><icon-video /></n-icon>
                                    <span class="text-lg font-bold">视频生成器 (VNVE)</span>
                                  </n-flex>
                                  <n-icon size="20"><icon-arrow-right /></n-icon>
                               </n-flex>
                               <div class="text-gray-500 text-sm mt-1">
                                 将Log转化为视频，支持骰子演出效果
                               </div>
                            </div>
                            <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openKpiReviewer">
                               <n-flex align="center" justify="space-between">
                                  <n-flex align="center">
                                    <n-icon size="24"><icon-chart /></n-icon>
                                    <span class="text-lg font-bold">跑团KPI审查器</span>
                                  </n-flex>
                                  <n-icon size="20"><icon-arrow-right /></n-icon>
                               </n-flex>
                               <div class="text-gray-500 text-sm mt-1">
                                 查看角色发言统计图表和总字数
                               </div>
                            </div>
                            <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openPdfPrinter">
                               <n-flex align="center" justify="space-between">
                                  <n-flex align="center">
                                    <n-icon size="24"><icon-document-pdf /></n-icon>
                                    <span class="text-lg font-bold">跑团日志PDF工具箱</span>
                                  </n-flex>
                                  <n-icon size="20"><icon-arrow-right /></n-icon>
                               </n-flex>
                               <div class="text-gray-500 text-sm mt-1">
                                 生成精美的跑团日志PDF文档
                               </div>
                            </div>
                            <n-alert type="warning" class="mt-2" :show-icon="true">
                              实验中内容，如果有bug请和骰主反馈
                            </n-alert>
                          </div>
                       </n-tab-pane>
                     </n-tabs>
                  </n-drawer-content>
               </n-drawer>
            </div>

            <!-- PC: Tabbed Interface -->
            <div v-if="notMobile" class="hand-drawn-box p-2 flex-grow flex flex-col min-h-0 h-full">
               <n-tabs type="line" class="h-full flex flex-col" pane-class="flex-grow overflow-auto min-h-0 p-2">
                  <n-tab-pane name="settings" tab="设置">
                     <div class="p-2">
                       <option-view></option-view>
                     </div>
                  </n-tab-pane>
                  <n-tab-pane name="roles" tab="角色分配">
                     <n-text type="info" italic class="block text-center my-1 flex-shrink-0">SealDice骰QQ群 524364253</n-text>
                     <div class="pc-list">
                        <div v-for="(i, index) in store.pcList" :key="index" class="mb-2 w-full">
                          <div class="pc-card hand-drawn-box p-3">
                            <div class="pc-item-grid">
                              <n-button type="error" size="small" secondary @click="deletePc(index, i)"
                                :disabled="!notMobile && (isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG)">
                                <template #icon>
                                  <n-icon><icon-delete></icon-delete></n-icon>
                                </template>
                                <span v-if="notMobile">删除</span>
                              </n-button>
          
                              <n-input :disabled="!notMobile && (isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG)"
                                v-model:value="i.name" :prefix-icon="User" @focus="nameFocus(i)"
                                @change="nameChanged(i)" placeholder="角色名" />
          
                              <n-input :disabled="true" v-model:value="i.IMUserId" placeholder="账号" />
          
                              <n-select v-model:value="i.role" class="pc-role-select"
                              :options="[{ value: '主持人', label: '主持人' }, { value: '角色', label: '角色' }, { value: '骰子', label: '骰子' }, { value: '隐藏', label: '隐藏' }]" />
          
                              <n-color-picker v-model:value="i.color" :show-alpha="false" show-preview :swatches="colors"
                                :on-update:value="(v) => colorChanged(v, i)" />
                            </div>
                          </div>
                        </div>
                     </div>
                     <n-flex justify="center" class="mt-2 flex-shrink-0">
                        <n-tooltip trigger="hover">
                          <template #trigger>
                            <n-button text @click="refreshColors">刷新色板</n-button>
                          </template>
                          重新随机生成上方颜色选择中的预置颜色
                        </n-tooltip>
                     </n-flex>
                  </n-tab-pane>
                  <n-tab-pane name="tools" tab="工具箱">
                      <div class="flex flex-col gap-2">
                        <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openVnve">
                           <n-flex align="center" justify="space-between">
                              <n-flex align="center">
                                <n-icon size="24"><icon-video /></n-icon>
                                <span class="text-lg font-bold">视频生成器 (VNVE)</span>
                              </n-flex>
                              <n-icon size="20"><icon-arrow-right /></n-icon>
                           </n-flex>
                           <div class="text-gray-500 text-sm mt-1">
                             将Log转化为视频，支持骰子演出效果
                           </div>
                        </div>
                        <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openKpiReviewer">
                           <n-flex align="center" justify="space-between">
                              <n-flex align="center">
                                <n-icon size="24"><icon-chart /></n-icon>
                                <span class="text-lg font-bold">跑团KPI审查器</span>
                              </n-flex>
                              <n-icon size="20"><icon-arrow-right /></n-icon>
                           </n-flex>
                           <div class="text-gray-500 text-sm mt-1">
                             查看角色发言统计图表和总字数
                           </div>
                        </div>
                        <div class="hand-drawn-box p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="openPdfPrinter">
                           <n-flex align="center" justify="space-between">
                              <n-flex align="center">
                                <n-icon size="24"><icon-document-pdf /></n-icon>
                                <span class="text-lg font-bold">跑团日志PDF工具箱</span>
                              </n-flex>
                              <n-icon size="20"><icon-arrow-right /></n-icon>
                           </n-flex>
                           <div class="text-gray-500 text-sm mt-1">
                             生成精美的跑团日志PDF文档
                           </div>
                        </div>
                        <n-alert type="warning" class="mt-2" :show-icon="true">
                          实验中内容，如果有bug请和骰主反馈
                        </n-alert>
                      </div>
                  </n-tab-pane>
               </n-tabs>
            </div>

          </div>

          <!-- RIGHT PANEL (Preview) -->
          <div class="w-full md:w-7/12 flex flex-col h-full overflow-hidden p-2 md:p-0">
              
              <div class="hand-drawn-box p-4 h-full flex flex-col relative overflow-hidden">
                  <!-- Decorative watermarks inside card -->
                  <img :src="GourdSvg" class="decor-gourd absolute pointer-events-none opacity-15 mix-blend-multiply" />
                  <img :src="FishSvg" class="decor-fish absolute pointer-events-none opacity-15 mix-blend-multiply" />
                  <img :src="CatSvg" class="decor-cat absolute pointer-events-none opacity-15 mix-blend-multiply" />

                  <!-- Mobile Float Button for Settings -->
                  <div v-if="!notMobile">
                     <n-float-button @click="showSettings = true" :right="20" :bottom="100" type="primary" class="z-50">
                        <n-icon><Settings /></n-icon>
                     </n-float-button>
                  </div>

                  <!-- Mode Tabs -->
                  <n-tabs type="line" v-model:value="modeMain" animated>
                    <n-tab-pane name="editor" tab="编辑器" />
                    <n-tab-pane name="preview" tab="预览" />
                  </n-tabs>

                  <!-- Editor Panel -->
                  <div v-show="modeMain === 'editor'" class="editor-wrap hand-drawn-box p-2 mb-3 flex flex-col relative min-h-[240px] overflow-hidden">
                    <code-mirror ref="editor" class="h-full flex-grow" @change="onChange">
                      <div class="z-50 absolute right-2 flex flex-col items-center top-2 gap-2">
                         <n-button secondary @click="clearText" type="primary" size="small" class="w-full opacity-80 hover:opacity-100">清空</n-button>
                         <n-button secondary @click="doFlush" type="primary" size="small" class="w-full opacity-80 hover:opacity-100">刷新</n-button>
                         <div class="rounded p-1 bg-white/70 dark:bg-[#1e233c]/70">
                            <n-checkbox label="染色" v-model:checked="store.doEditorHighlight" :border="false"
                              @click.native="doEditorHighlightClick($event)" />
                         </div>
                      </div>
                    </code-mirror>
                  </div>
                  <!-- Controls -->
                  <div class="mb-2">
                      <!-- Preview Format Tabs -->
                      <n-tabs v-if="notMobile && modeMain === 'preview'" type="line" animated v-model:value="activeTab" @update:value="handleTabChange">
                          <n-tab-pane name="preview" tab="预览" />
                          <n-tab-pane name="role" tab="角色" />
                          <n-tab-pane name="bbs" tab="论坛" />
                          <n-tab-pane name="bbspineapple" tab="论坛(多行)" />
                          <n-tab-pane name="trg" tab="回声工坊" />
                      </n-tabs>

                      <!-- Mobile Controls -->
                      <div v-else-if="modeMain === 'preview'" class="flex flex-col gap-2">
                          <div class="flex flex-wrap gap-2 justify-center">
                              <n-checkbox label="预览" v-model:checked="isShowPreview" :border="true" @click="previewClick('preview')" />
                              <n-checkbox label="角色" v-model:checked="isShowPreviewRole" :border="true" @click="previewClick('role')" />
                              <n-checkbox label="论坛" v-model:checked="isShowPreviewBBS" :border="true" @click="previewClick('bbs')" />
                              <n-checkbox label="多行" v-model:checked="isShowPreviewBBSPineapple" :border="true" @click="previewClick('bbspineapple')" />
                              <n-checkbox label="TRG" v-model:checked="isShowPreviewTRG" :border="true" @click="previewClick('trg')" />
                          </div>
                      </div>

                      <!-- Export Buttons -->
                      <n-flex v-show="modeMain === 'preview'" size="small" justify="center" align="center" class="mt-2 flex-wrap">
                          <n-button secondary type="primary" size="small" @click="exportRecordRaw">原始</n-button>
                          <n-button secondary type="primary" size="small" @click="exportRecordDOC">带图Word</n-button>
                          <n-button secondary type="primary" size="small" @click="exportRecordTalkDOC">对话Word</n-button>
                          <n-button secondary type="primary" size="small" @click="exportRecordDocx">Docx</n-button>
                      </n-flex>
                  </div>

                  <!-- Preview Content -->
                  <div v-show="modeMain === 'preview'" class="flex-grow overflow-hidden flex flex-col relative border-t border-dashed border-gray-300 pt-2">
                      <n-message-provider>
                        <preview-main class="flex-1 min-h-0" :is-show="notMobile ? activeTab === 'preview' : isShowPreview" :preview-items="previewItems"></preview-main>
                        <preview-role class="flex-1 min-h-0 overflow-y-auto" :is-show="notMobile ? activeTab === 'role' : isShowPreviewRole" :preview-items="previewItems"></preview-role>
                        <preview-bbs class="flex-1 min-h-0" :is-show="notMobile ? activeTab === 'bbs' : isShowPreviewBBS" :preview-items="previewItems"></preview-bbs>
                        <preview-bbs-pineapple class="flex-1 min-h-0" :is-show="notMobile ? activeTab === 'bbspineapple' : isShowPreviewBBSPineapple"
                          :preview-items="previewItems"></preview-bbs-pineapple>
                        <preview-trg class="flex-1 min-h-0" :is-show="notMobile ? activeTab === 'trg' : isShowPreviewTRG" :preview-items="previewItems"></preview-trg>
                      </n-message-provider>
                  </div>
              </div>
          </div>

        </div>
      </n-spin>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, watch, h, render, renderList, computed } from "vue";
import { useStore } from './store'
import CodeMirror from './components/CodeMirror.vue'
import { debounce, delay } from 'lodash-es'
import { exportFileRaw, exportFileQQ, exportFileIRC, exportFileDoc, exportFileDocx } from "./utils/exporter";
import type { DocxExportEntry } from "./utils/exporter";
import { strFromU8, unzlibSync } from 'fflate';
import uaParser from 'ua-parser-js'

import { logMan } from './logManager/logManager'
import { ViewUpdate } from "@codemirror/view";
import { TextInfo } from "./logManager/importers/_logImpoter";
import previewMain from "./components/previews/preview-main.vue";
import previewRole from "./components/previews/preview-role.vue";
import previewBbs from "./components/previews/preview-bbs.vue";
import previewBbsPineapple from "./components/previews/preview-bbs-pineapple.vue";
import previewTrg from "./components/previews/preview-trg.vue";
import KpiReviewer from "./components/KpiReviewer.vue";
import PreviewItem from './components/previews/preview-main-item.vue'
import PreviewTableTR from './components/previews/preview-table-tr.vue'
import { LogItem, CharItem, packNameId } from "./logManager/types";
import { setCharInfo } from './logManager/importers/_logImpoter'
import { expandForwardLogItem, formatLogMessage, msgOffTopicFormat } from "./utils";
import { NButton, NText, useMessage, useModal, useNotification, NDrawer, NDrawerContent, NFloatButton, NTabs, NTabPane, NGrid, NGridItem, NAlert } from "naive-ui";
import { User, LogoGithub, Delete as IconDelete, Settings, Menu, Video as IconVideo, ArrowRight as IconArrowRight, ChartLine as IconChart, DocumentPdf as IconDocumentPdf } from '@vicons/carbon'
import { breakpointsTailwind, useBreakpoints, useDark, useToggle } from '@vueuse/core'
import OptionView from "./components/OptionView.vue";
import randomColor from "randomcolor";

import { parquetReadObjects } from 'hyparquet'
import { asyncBufferFrom } from 'hyperparam'
import { compressors } from 'hyparquet-compressors'


const breakpoints = useBreakpoints(breakpointsTailwind)
const notMobile = breakpoints.greater('sm')

const isDark = useDark()
const toggleDark = useToggle(isDark)

// 不用他了 虽然很不错，但是没有屏幕取色
// import { ColorPicker } from 'vue-color-kit'
// import 'vue-color-kit/dist/vue-color-kit.css'

const message = useMessage()
const modal = useModal()
const notification = useNotification()

const loading = ref<boolean>(false)

const isMobile = ref(false)
const downloadUsableRank = ref(0)

const isShowPreview = ref(false)
const isShowPreviewBBS = ref(false)
const isShowPreviewBBSPineapple = ref(false)
const isShowPreviewTRG = ref(false)
const isShowPreviewRole = ref(false)

const showSettings = ref(false)
const showKpiReviewer = ref(false)
const activeTab = ref('preview')
const modeMain = ref<'editor' | 'preview'>('editor')

const handleTabChange = (val: string) => {
  activeTab.value = val
  if (val === 'preview') previewClick('preview')
  else if (val === 'role') previewClick('role')
  else if (val === 'bbs') previewClick('bbs')
  else if (val === 'bbspineapple') previewClick('bbspineapple')
  else if (val === 'trg') previewClick('trg')
}

const closePreviewMobile = () => {
  isShowPreview.value = false
  isShowPreviewBBS.value = false
  isShowPreviewBBSPineapple.value = false
  isShowPreviewTRG.value = false
  isShowPreviewRole.value = false
}

const rebuildAll = () => {
  const text = store.editor.state.doc.toString()
  logMan.lastText = ''
  logMan.syncChange(text, [0, store.editor.state.doc.length], [0, text.length])
  showPreview()
}

watch(modeMain, (v) => {
  if (v === 'preview') {
    rebuildAll()
  }
})

import GourdSvg from './assets/gourd.svg'
import FishSvg from './assets/fish.svg'
import CatSvg from './assets/cat.svg'

const colors = ref<string[]>([])
const refreshColors = () => {
  for (const pc of store.pcList) {
    const c = randomColor()
    pc.color = c
    if (pc.name) {
      store.pcNameColorMap.set(pc.name, c)
    }
  }
  store.colorMapSave()
  showPreview()
  message.success("已为每个角色刷新随机颜色", { duration: 800 })
}

const colorChanged = debounce((v: string, i: CharItem) => {
  i.color = v
  store.pcNameColorMap.set(i.name, v)
  store.colorMapSave();
}, 300)

const backV1 = () => {
  // location.href = location.origin + '/v1/' + location.search + location.hash;
  location.href = 'https://dice.weizaima.com';
}

const getToolboxLogs = () => {
  showPreview();
  return previewItems.value;
}

const openVnve = () => {
  // 不使用 rebuildAll()，因为它会清空 lastText 并触发重新解析，
  // 从而导致用户在角色分配中的修改被覆盖
  const toolboxLogs = getToolboxLogs();
  const data = {
    logs: toolboxLogs,
    characters: store.pcList
  };
  localStorage.setItem('vnve_import_data', JSON.stringify(data));

  // Generate Script Text for Text2Scene
  let scriptText = "标题\场景1-1\n\n";
  scriptText += "场景\n默认背景\n\n";

  for (const item of toolboxLogs) {
      if (store.isHiddenLogItem(item)) continue;
      
      const name = item.nickname || "未知";
      let msg = item.message;
      // Simple strip of CQ codes for script
      // 过滤掉所有CQ码，包括图片、表情等
      // 过滤掉所有mirai:image等标签
      msg = msg.replace(/\[CQ:.*?\]/g, '').replace(/\[mirai:.*?\]/g, ''); 
      if (!msg.trim()) continue;

      scriptText += `${name}\n${msg}\n\n`;
  }

  localStorage.setItem('vnve_script_text', scriptText);
  window.open('/vnve.html', '_blank');
}

const openKpiReviewer = () => {
  // 不使用 rebuildAll()，避免覆盖用户的角色分配修改
  const toolboxLogs = getToolboxLogs();
  const data = {
    logs: toolboxLogs,
    characters: store.pcList
  };
  localStorage.setItem('kpi_data', JSON.stringify(data));
  window.open('/kpi.html', '_blank');
}

const openPdfPrinter = () => {
  // 不使用 rebuildAll()，避免覆盖用户的角色分配修改
  const toolboxLogs = getToolboxLogs();
  const data = {
    logs: toolboxLogs,
    characters: store.pcList,
    options: store.exportOptions
  };
  localStorage.setItem('pdf_printer_data', JSON.stringify(data));
  window.open('/pdf.html', '_blank');
}

// 清空文本
const clearText = () => {
  store.editor.dispatch({
    changes: { from: 0, to: store.editor.state.doc.length, insert: '' }
  })
}

const doFlush = () => {
  console.log('flush')
  logMan.flush();
}

const previewClick = (mode: 'preview' | 'role' | 'bbs' | 'bbspineapple' | 'trg') => {
  switch (mode) {
    case 'preview':
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      isShowPreviewRole.value = false
      break;
    case 'role':
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      break;
    case 'bbs':
      isShowPreview.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      isShowPreviewRole.value = false
      break;
    case 'bbspineapple':
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewTRG.value = false
      isShowPreviewRole.value = false
      break;
    case 'trg':
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewRole.value = false
      break;
  }
  showPreview();
}

function setupUA() {
  const parser = new uaParser.UAParser()
  parser.setUA(navigator.userAgent)
  const deviceType = parser.getDevice()

  const browser = parser.getBrowser().name
  downloadUsableRank.value = 1

  isMobile.value = deviceType.type === 'mobile'
  if (deviceType.type === 'mobile') {
    // 经测可以使用的
    switch (browser) {
      // case '360 Browser': // 手机360 但是手机360无特征，自己是Chrome WebView
      // 手机:X浏览器 Chrome WebView无特征
      case 'Edge':
      case 'Chrome':
      case 'Chromium':
      case 'Firefox':
      case 'MIUI Browser':
      case 'Opera':
        downloadUsableRank.value = 2
    }

    // 经测无法使用的
    switch (browser) {
      case 'baiduboxapp': // 手机:百度浏览器
      case 'QQBrowser': // 手机:搜狗浏览器极速版，手机:QQ浏览器
      // 手机:万能浏览器，Chrome WebView无特征，会直接崩溃
      case 'UCBrowser': // 手机:UC浏览器
      case 'Quark': // 手机:夸克
      // 手机:Via浏览器，Chrome WebView无特征，会直接崩溃
      case 'QQ': // 手机:QQ
      case 'WeChat':
        downloadUsableRank.value = 0
    }
  }
}

setupUA()

const browserAlert = () => {
  if (downloadUsableRank.value === 0) {
    message.warning('你目前所使用的浏览器无法下载文件，请更换对标准支持较好的浏览器。建议使用Chrome/Firefox/Edge')
  }
  if (downloadUsableRank.value === 1) {
    if (isMobile.value) {
      message.warning('你目前所使用的浏览器可能在下载文件时遇到乱码，或无法下载文件，最好更换对标准支持较好的浏览器。建议使用Chrome/Firefox/Edge')
    }
  }
  // 2 不做提示 因为兼容良好
}

onMounted(async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as any)
  })
  const key = (params as any).key
  const password = location.hash.slice(1)

  const showHl = () => {
    setTimeout(() => {
      if (!isMobile.value) {
        store.doEditorHighlight = true
        store.reloadEditor()
      }
    }, 1000)
  }

  if (key && password) {
    loading.value = true
    try {
      const record = await store.tryFetchLog(key, password) as {
        client: 'SealDice' | 'Parquet',
        created_at: string,
        data: string,
        name: string,
        note: string,
        updated_at: string,
      }

      switch (record.client) {
        case 'Parquet': {
          const uint8 = Uint8Array.from(atob(record.data), c => c.charCodeAt(0))
          const asyncBuffer = await asyncBufferFrom({ file: new File([uint8], 'default'), byteLength: uint8.byteLength })
          const res = await parquetReadObjects({
            file: asyncBuffer,
            compressors,
          })
          nextTick(() => {
            const text = JSON.stringify({
              items: res.map(v => {
                v.id = Number(v.id)
                v.time = Number(v.time)
                v.commandId = Number(v.commandId)
                return v
              }),
              version: 105
            })
            store.pcList.length = 0

            logMan.lastText = '';
            logMan.syncChange(text, [0, store.editor.state.doc.length], [0, text.length])
          });
        }
          break
        case 'SealDice':
        default:
          {
            const log = unzlibSync(Uint8Array.from(atob(record.data), c => c.charCodeAt(0)));

            nextTick(() => {
              const text = strFromU8(log)
              store.pcList.length = 0

              logMan.lastText = '';
              logMan.syncChange(text, [0, store.editor.state.doc.length], [0, text.length])

            });
          }
          break
      }


      loading.value = false
      showHl()
    } catch (e) {
      console.log(e)
      notification['error']({
        content: '错误',
        meta: '加载日志失败，可能是序号或密码不正确',
        duration: 5000
      })
      loading.value = false
      browserAlert()
      return true
    }
  } else {
    store.editor.dispatch({
      changes: { from: 0, to: store.editor.state.doc.length, insert: store.editor.state.doc.toString() }
    })
    showHl()
  }

  // cminstance.value = cmRefDom.value?.cminstance;
  // cminstance.value?.focus();
  // console.log(cminstance.value)
  colors.value = randomColor({ count: 16 })
  browserAlert()
  await nextTick(() => {
    setTimeout(() => {
      doFlush()
    }, 3000)
  })
});

function exportRecordRaw() {
  browserAlert()
  exportFileRaw(store.editor.state.doc.toString())
}

function exportRecordQQ() {
  browserAlert()
  showPreview()
  exportFileQQ(previewItems.value, store.exportOptions)
}

function exportRecordIRC() {
  browserAlert()
  showPreview()
  exportFileIRC(previewItems.value, store.exportOptions)
}

function exportRecordDOC() {
  browserAlert()
  if (isMobile.value) {
    message.warning('你当前处于移动端环境，已知只有WPS能够查看生成的Word文件，且无法看图！使用PC打开可以查看图片。')
  }

  const solveImg = (el: Element) => {
    if (el.tagName === 'IMG') {
      let width = el.clientWidth;
      let height = el.clientHeight;
      if (width === 0) {
        width = 300;
        height = 300;
      }
      el.setAttribute('width', `${width}`)
      el.setAttribute('height', `${height}`)
    }
    for (let i = 0; i < el.children.length; i += 1) {
      solveImg(el.children[i])
    }
  }

  const el = document.createElement('span');
  const elRoot = document.createElement('div');
  const items = [];

  showPreview()
  for (let i of previewItems.value) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    const html = h(PreviewItem, { source: i });
    render(html, el);

    const c = el;
    solveImg(c);
    items.push(c.innerHTML);
  }

  exportFileDoc(items.join('\n'));
}

function exportRecordTalkDOC() {
  browserAlert()
  if (isMobile.value) {
    message.warning('你当前处于移动端环境，已知只有WPS能够查看生成的Word文件，且无法看图！使用PC打开可以查看图片。')
  }

  const solveImg = (el: Element) => {
    if (el.tagName === 'IMG') {
      let width = el.clientWidth;
      let height = el.clientHeight;
      if (width === 0) {
        width = 300;
        height = 300;
      }
      el.setAttribute('width', `${width}`)
      el.setAttribute('height', `${height}`)
    }
    for (let i = 0; i < el.children.length; i += 1) {
      solveImg(el.children[i])
    }
  }

  const el = document.createElement('span');
  const elRoot = document.createElement('div');
  const items: string[] = [];

  showPreview()
  for (let i of previewItems.value) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    const html = h(PreviewTableTR, { source: i });
    render(html, el);

    const c = el;
    solveImg(c);
    items.push(c.innerHTML);
  }
  exportFileDoc(`<table style="border-collapse: collapse;"><tbody>${items.join('\n')}</tbody></table>`);
}

const readElementColor = (el: HTMLElement | null): string | undefined => {
  if (!el) return undefined;
  if (el.style && el.style.color) {
    return el.style.color;
  }
  const computed = window.getComputedStyle(el);
  return computed?.color || undefined;
};

const extractMessageLines = (el: HTMLElement | null): string[] => {
  if (!el) return [''];
  const clone = el.cloneNode(true) as HTMLElement;
  const doc = el.ownerDocument || document;

  clone.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const placeholder = src ? `[图:${src}]` : '[图:无可用链接]';
    img.replaceWith(doc.createTextNode(placeholder));
  });

  const blockTags = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'BLOCKQUOTE']);
  const lines: string[] = [];
  let current = '';

  const pushLine = (forceEmpty = false) => {
    const normalized = current.replace(/\u00A0/g, ' ').replace(/\s+$/g, '');
    if (normalized || forceEmpty || lines.length === 0) {
      lines.push(normalized);
    }
    current = '';
  };

  const appendText = (text: string | null) => {
    if (!text) return;
    const normalized = text.replace(/\u00A0/g, ' ');
    const segments = normalized.split(/\r?\n/);
    segments.forEach((segment, index) => {
      current += segment;
      if (index < segments.length - 1) {
        pushLine();
      }
    });
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;

    if (element.tagName === 'BR') {
      pushLine(true);
      return;
    }

    if (blockTags.has(element.tagName)) {
      if (current) {
        pushLine();
      }

      if (element.tagName === 'LI') {
        const parent = element.parentElement;
        if (parent?.tagName === 'OL') {
          const siblings = Array.from(parent.children).filter((child) => child.tagName === 'LI');
          const index = siblings.indexOf(element);
          appendText(`${index + 1}. `);
        } else {
          appendText('• ');
        }
      }

      const before = lines.length;
      Array.from(element.childNodes).forEach(processNode);

      if (current) {
        pushLine();
      } else if (lines.length === before) {
        pushLine(true);
      }
      return;
    }

    Array.from(element.childNodes).forEach(processNode);
  };

  Array.from(clone.childNodes).forEach(processNode);

  if (current !== '' || lines.length === 0) {
    pushLine(lines.length === 0);
  }

  while (lines.length > 1 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  if (lines.length === 0) {
    lines.push('');
  }

  return lines;
};

function exportRecordDocx() {
  browserAlert()
  showPreview()

  const entries: DocxExportEntry[] = []

  for (const item of previewItems.value) {
    if (item.isRaw) continue
    if (store.isHiddenLogItem(item)) continue

    const mountPoint = document.createElement('div')
    const vnode = h(PreviewItem, { source: item })
    render(vnode, mountPoint)

    const host = mountPoint.firstElementChild as HTMLElement | null
    if (!host) {
      render(null, mountPoint)
      continue
    }

    const timeEl = host.querySelector('._time') as HTMLElement | null
    const nicknameEl = host.querySelector('._nickname') as HTMLElement | null
    const messageEl = host.querySelector('._message') as HTMLElement | null

    const entry: DocxExportEntry = {
      time: (timeEl?.textContent ?? '').trim(),
      timeColor: readElementColor(timeEl),
      nickname: (nicknameEl?.textContent ?? '').trim(),
      nicknameColor: readElementColor(nicknameEl),
      messageLines: extractMessageLines(messageEl),
      messageColor: readElementColor(messageEl),
    }

    entries.push(entry)
    render(null, mountPoint)
  }

  if (!entries.length) {
    message.warning('没有可导出的内容')
    return
  }

  exportFileDocx(entries, '跑团记录.docx').catch((err) => {
    console.error(err)
    message.error('Docx 导出失败，请稍后重试')
  })
}

const previewItems = ref<LogItem[]>([])

function buildPreviewSourceItems() {
  const items: LogItem[] = [];

  for (const item of logMan.curItems) {
    if (item.isRaw) continue;
    if (!store.exportOptions.expandForward) {
      items.push(item);
      continue;
    }

    const expanded = expandForwardLogItem(item);
    if (expanded?.length) {
      items.push(...expanded);
    } else {
      items.push(item);
    }
  }

  return items;
}

function showPreview() {
  const tmp: LogItem[] = [];
  let index = 0;
  const sourceItems = buildPreviewSourceItems();
  console.log('当前日志条目数量: ', logMan.curItems.length)

  const charInfo = new Map<string, CharItem>();
  for (const item of sourceItems) {
    setCharInfo(charInfo, item);
  }
  store.updatePcList(charInfo);

  for (let i of sourceItems) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    // // 处理ot
    // if (offTopicHide && !i.isDice) {
    //   const msg = i.message.replaceAll(/^[(（].+?$/gm, '') // 【
    //   if (msg.trim() === '') continue;
    // }
    let msg = formatLogMessage(i.message, store.exportOptions, store.pcList, i.isDice);
    msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice); // 再过滤一次
    if (msg.trim() === '') continue;

    tmp.push({ ...i, index });
    index += 1;
  }
  previewItems.value = tmp;
}

const store = useStore()
store.colorMapLoad();

// 修改ot选项后重建items
watch(() => store.exportOptions.offTopicHide, showPreview)
watch(
  () => store.pcList.map(pc => `${pc.IMUserId}-${pc.role}-${pc.name}`),
  () => showPreview(),
  { deep: false }
)

const editor = ref()
watch(isDark, () => {
  console.log('dark watch')
  store.reloadEditor()
})

const deletePc = (index: number, i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const m = modal.create({
    title: '删除角色',
    preset: 'card',
    style: {
      width: '30rem',
    },
    content: `即将删除角色「${i.name}」及其全部发言，确定吗？`,
    footer: () => [
      h(
        NButton,
        { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } },
        () => '取消',
      ),
      h(
        NButton,
        {
          type: 'primary', onClick: () => {
            try {
              store.pcList.splice(index, 1);
              logMan.deleteByCharItem(i);
            } finally {
              m.destroy()
            }
          }
        },
        () => '确定'
      ),
    ]
  })
}

let lastPCName = ''

const nameFocus = (i: CharItem) => {
  lastPCName = i.name
}

let lastNameChange = 0;
const nameChanged = (i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const oldName = lastPCName; // 这样做的原因是，如果按回车确认，那么 nameFocus 会在promise触发前触发一遍导致无效
  const newName = i.name;
  if (oldName && newName) {
    const el = document.createElement('span');

    render(h('span', `${oldName}`), el);
    const name1 = el.innerHTML;

    render(h('span', `${newName}`), el);
    const name2 = el.innerHTML;

    render(h('span', `<${oldName}>`), el);
    const name1w = el.innerHTML;

    render(h('span', `<${newName}>`), el);
    const name2w = el.innerHTML;

    const m = modal.create({
      title: '名字变更',
      preset: 'card',
      style: {
        width: '30rem',
      },
      content: () => [
        h(
          NText,
          { innerHTML: `即将进行名字变更 <b>${name1} -> ${name2}</b><br />将修改信息行，并在文本中进行批量替换（${name1w} 替换为 ${name2w}），确定吗？` },
        ),
      ],
      footer: () => [
        h(
          NButton,
          { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } },
          () => '取消',
        ),
        h(
          NButton,
          {
            type: 'primary', onClick: () => {
              try {
                logMan.rename(i, oldName, newName)
              } catch (_e) {
                i.name = oldName;
              } finally {
                m.destroy()
              }
            }
          },
          () => '确定'
        ),
      ]
    })
  }
}


let isProgrammaticUpdate = false;

logMan.ev.on('textSet', (text) => {
  isProgrammaticUpdate = true;
  store.editor.dispatch({
    changes: { from: 0, to: store.editor.state.doc.length, insert: text }
  });
  isProgrammaticUpdate = false;

  let m = new Map<string, CharItem>();
  for (let i of logMan.curItems) {
    if (i.isRaw) continue;
    setCharInfo(m, i);
  }
  store.updatePcList(m);
});

logMan.ev.on('parsed', (ti: TextInfo) => {
  store.updatePcList(ti.charInfo);
})

const onChange = (v: ViewUpdate) => {
  let payloadText = '';
  if (v) {
    if (v.docChanged) {
      // 有一种我不太清楚的特殊情况会导致二次调用，从而使得pclist清零
      // 看不出明显变化，只是一个隐藏参数flags为0
      // 破案了，是flush
      if (!v.viewportChanged && (v as any).flags === 0) {
        return;
      }
      
      if (isProgrammaticUpdate) return;

      const ranges = (v as any).changedRanges;
      if (ranges.length) {
        for (let i = ranges.length - 1; i >= 0; i--) {
          const payloadText = store.editor.state.doc.toString()

          const r1 = [ranges[i].fromA, ranges[i].toA];
          const r2 = [ranges[i].fromB, ranges[i].toB];

          console.log('XXX', v, r1, r2);
          if (r1[0] === 0 && r1[1] === logMan.lastText.length) {
            console.log('全部文本被删除，清除pc列表');
            store.pcList = [];
          }
          logMan.syncChange(payloadText, r1, r2);
        }
      }
    }
  }

  // payloadText = store.editor.state.doc.toString()
  // let isLog = false
}

const doEditorHighlightClick = (e: any) => {
  // 因为原生click事件会执行两次，第一次在label标签上，第二次在input标签上，故此处理
  if (e.target.tagName === 'INPUT') return;

  const doHl = () => {
    // 编辑器染色
    setTimeout(() => {
      store.reloadEditor()
    }, 500)
  }

  if (store.doEditorHighlight) {
    // 如果要开启
    if (isMobile.value) {
      const m = modal.create({
        title: '开启编辑器染色？',
        preset: 'card',
        style: {
          width: '30rem',
        },
        content: '部分移动设备上的特定浏览器可能会因为兼容性问题而卡死，继续吗？',
        footer: () => [
          h(
            NButton,
            {
              type: 'default',
              onClick: () => {
                store.doEditorHighlight = false
                m.destroy()
                setTimeout(() => {
                  doFlush()
                }, 3000)
              },
              style: { marginRight: '1rem' }
            },
            () => '取消',
          ),
          h(
            NButton,
            {
              type: 'primary', onClick: () => {
                try {
                  doHl()
                } catch (_e) {
                  // 重新关闭
                  setTimeout(() => {
                    store.doEditorHighlight = false
                    store.reloadEditor()
                  }, 500)
                } finally {
                  m.destroy()
                }
              }
            },
            () => '确定'
          ),
        ]
      })

      return
    }
  }

  doHl()
}

const reloadFunc = () => {
  store.reloadEditor()
}
const pcList = computed(() => store.pcList)
watch(pcList, reloadFunc, { deep: true })

const exportOptions = computed(() => store.exportOptions)
watch(exportOptions, reloadFunc, { deep: true })

const code = ref("")

</script>

<style lang="scss">
.element-plus-logo {
  width: 50%;
}

.options>div {
  width: 30rem;
  max-width: 30rem;
  margin-bottom: 2rem;
}

.options>div>.switch {
  display: flex;
  align-items: center;
  justify-content: center;

  &>h4 {
    margin-top: 0rem;
    margin-bottom: 0rem;
    margin-left: 1rem;
  }
}

.myLineDecoration {
  // background: lightblue;
  margin-bottom: 20px;
  font-size: large;
}

.pc-list {
  display: flex;
  align-items: center;
  flex-direction: column;
}

#app {
  overflow-y: auto;
}

.preview {
  word-break: break-all;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  position: relative;
  // font-family: monospace;
}


.list-dynamic {
  width: 100%;
  height: 100%;
  min-height: 300px;
  overflow-y: auto;
}

.list-item-dynamic {
  // display: flex;
  // align-items: center;
  padding: 0.5em 0;
  border-color: lightgray;
}

.scroller {
  height: 100%;
}

/* Hand-drawn Theme */
.hand-drawn-theme {
  background-color: #fdfbf7;
  background-image: radial-gradient(#d0c0a0 1px, transparent 1px);
  background-size: 20px 20px;
}

.hand-drawn-box {
  border: 2px solid #555;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  box-shadow: 3px 4px 0 rgba(0,0,0,0.1);
  background-color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.hand-drawn-drawer .n-drawer-content {
  border-top: 3px solid #555;
  border-radius: 20px 20px 0 0;
  overflow: auto;
}

.pc-item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.pc-item-grid > .n-input:first-of-type {
  flex: 1 1 8rem;
  min-width: 0;
}

.pc-item-grid > .n-input:nth-of-type(2) {
  flex: 1 1 8rem;
  min-width: 0;
}

.pc-item-grid > .n-select {
  flex: 0 0 6rem;
  min-width: 6rem;
}

.pc-item-grid > .n-color-picker {
  flex: 0 0 5rem;
  width: 2.5rem;
}

.pc-card {
  border: 2px solid #555;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 3px 255px 5px 25px / 255px 5px 225px 5px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.pc-card:hover {
  transform: scale(1.01) rotate(-0.5deg);
}

/* Hand-drawn Input/Select Overrides */
.hand-drawn-theme .n-input .n-input__border, 
.hand-drawn-theme .n-input .n-input__state-border,
.hand-drawn-theme .n-base-selection .n-base-selection__border,
.hand-drawn-theme .n-base-selection .n-base-selection__state-border {
  border: 2px solid #666 !important;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px !important;
  box-shadow: none !important;
}

.hand-drawn-theme .n-input:hover .n-input__state-border,
.hand-drawn-theme .n-base-selection:hover .n-base-selection__state-border {
  border-color: #333 !important;
}

.hand-drawn-theme .n-button {
  border: 2px solid #555;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  font-weight: bold;
}
.hand-drawn-theme .n-button:hover {
  transform: rotate(1deg);
}

/* Decorations */
.decor-gourd { top: 1rem; left: 1rem; width: 60px; transform: rotate(-15deg); filter: sepia(0.5) contrast(0.8) brightness(1.2); }
.decor-fish { bottom: 1rem; left: 2rem; width: 80px; transform: rotate(5deg); filter: sepia(0.5) contrast(0.8) brightness(1.2); }
.decor-cat { bottom: 1rem; right: 1rem; width: 70px; transform: rotate(10deg); filter: sepia(0.5) contrast(0.8) brightness(1.2); }

@media (max-width: 768px) {
  .decor-gourd, .decor-fish, .decor-cat {
    opacity: 0.15;
  }
}

.dark .decor-gourd, .dark .decor-fish, .dark .decor-cat {
  opacity: 0.1;
  filter: invert(1) opacity(0.5);
}

.dark .hand-drawn-theme {
  background-color: #0f1220;
  background-image: radial-gradient(#1e243b 1px, transparent 1px);
}

.dark .hand-drawn-box {
  background-color: rgba(30, 35, 60, 0.85);
  border-color: #d1d5db;
}

.dark .hand-drawn-drawer .n-drawer-content {
  background-color: rgba(30, 35, 60, 0.95);
  border-top-color: #d1d5db;
}

.font-hand {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif;
}

.codemirror, .cm-editor {
  height: 100% !important;
}

.cm-scroller {
  overflow: auto !important;
}
</style>
.left-col {
  height: calc(100vh - 80px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scroll-card {
  /* Deprecated */
}
