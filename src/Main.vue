<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-layout class="min-h-screen transition-colors duration-300" 
              :class="{ 'dark bg-gray-900': isDark, 'sketchy-bg': !isDark }">
      
      <!-- Header -->
      <n-layout-header class="bg-transparent p-4 z-10 relative">
        <div class="sketchy-card p-3 flex flex-wrap gap-4 justify-between items-center transition-colors duration-300" 
             :class="isDark ? 'bg-gray-800 border-gray-400' : 'bg-white border-gray-800'">
          
          <n-flex align="center" size="large">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <strong class="text-xl font-hand tracking-wide" :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                  海豹TRPG跑团Log着色器
                </strong>
                <span class="sketchy-tag px-2 py-0.5 text-xs font-bold" 
                      :class="isDark ? 'bg-green-900 text-green-100 border-green-300' : 'bg-green-100 text-green-800 border-gray-800'">
                  v2.5.4
                </span>
              </div>
              <span class="text-xs font-hand opacity-70 -mt-1 ml-1" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                白鱼魔改版
              </span>
            </div>
          </n-flex>

          <n-flex align="center">
            <n-button text tag="a" href="https://github.com/sealdice/story-painter" target="_blank">
              <template #icon>
                <n-icon size="28" :color="isDark ? '#e5e7eb' : '#1f2937'"><logo-github /></n-icon>
              </template>
            </n-button>
            <n-button text @click="toggleDark()">
              <template #icon>
                <n-icon size="24" :color="isDark ? '#fbbf24' : '#4b5563'">
                  <moon v-if="isDark" />
                  <sun v-else />
                </n-icon>
              </template>
            </n-button>
            <button class="sketchy-btn px-4 py-1" 
                    :class="isDark ? 'text-white border-gray-400 hover:bg-gray-700' : 'text-black border-black hover:bg-gray-100'"
                    @click="backV1">
              官网
            </button>
          </n-flex>
        </div>
      </n-layout-header>

      <n-layout-content class="bg-transparent px-4 pb-8 overflow-visible">
        <n-spin :show="loading">
          <template #description>正在试图加载远程记录……</template>
          
          <!-- Main Layout Container -->
          <div class="flex flex-col lg:grid lg:grid-cols-[380px_1fr] gap-6 w-full min-h-[85vh]">
            
            <!-- Left Sidebar (PC Only - Hidden on Mobile) -->
            <aside class="hidden lg:flex flex-col w-full gap-6">
              <!-- Control Panel -->
              <div class="sketchy-card p-4 flex flex-col gap-4" :class="isDark ? 'bg-gray-800 border-gray-500' : 'bg-white border-gray-800'">
                <h3 class="text-xl font-bold border-b-2 pb-2 mb-2 font-hand" :class="isDark ? 'text-white border-gray-500' : 'text-gray-900 border-gray-800'">
                  控制面板
                </h3>
                
                <ControlPanelContent 
                  :store="store" 
                  :loading="loading"
                  :colors="colors"
                  :is-dark="isDark"
                  :isShowPreview="isShowPreview"
                  :isShowPreviewBBS="isShowPreviewBBS"
                  :isShowPreviewBBSPineapple="isShowPreviewBBSPineapple"
                  :isShowPreviewTRG="isShowPreviewTRG"
                  :notMobile="notMobile"
                  @deletePc="deletePc"
                  @nameFocus="nameFocus"
                  @nameChanged="nameChanged"
                  @colorChanged="colorChanged"
                  @refreshColors="refreshColors"
                  @exportRecordRaw="exportRecordRaw"
                  @exportRecordDOC="exportRecordDOC"
                  @exportRecordTalkDOC="exportRecordTalkDOC"
                  @exportRecordDocx="exportRecordDocx"
                  @previewClick="previewClick"
                />
              </div>
              
              <!-- Settings Panel -->
              <div class="sketchy-card p-4" :class="isDark ? 'bg-gray-800 border-gray-500' : 'bg-white border-gray-800'">
                <h3 class="text-xl font-bold border-b-2 pb-2 mb-2 font-hand" :class="isDark ? 'text-white border-gray-500' : 'text-gray-900 border-gray-800'">
                  设置
                </h3>
                 <option-view></option-view>
              </div>
            </aside>

            <!-- Right Main Editor Area (Visible on All) -->
            <main class="w-full min-w-0 h-full relative">
              <div class="sketchy-card p-3 flex flex-col h-full" 
                   :class="isDark ? 'bg-gray-800 border-gray-500' : 'bg-white border-gray-800'">
                
                <n-text :type="isDark ? 'warning' : 'info'" italic class="block text-center my-1 text-xs opacity-70 flex-shrink-0">
                  SealDice骰QQ群 524364253 [群介绍中有其余3群]
                </n-text>

                <!-- Toolbar -->
                <div v-show="!(isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG)" 
                     class="flex justify-end items-center gap-3 mb-3 px-2 flex-wrap flex-shrink-0">
                   
                   <n-checkbox label="语法高亮" v-model:checked="store.doEditorHighlight" @click.native="doEditorHighlightClick($event)">
                      <span :class="isDark ? 'text-gray-300' : 'text-gray-800'">高亮模式</span>
                   </n-checkbox>

                   <div class="w-[1px] h-6 bg-gray-400 mx-1"></div>

                   <button class="sketchy-btn-sm" 
                           :class="isDark ? 'text-white border-gray-400 hover:bg-gray-700' : 'text-black border-black hover:bg-gray-100'"
                           @click="clearText">
                     清空
                   </button>
                   <button class="sketchy-btn-sm" 
                           :class="isDark ? 'text-white border-gray-400 hover:bg-gray-700' : 'text-black border-black hover:bg-gray-100'"
                           @click="doFlush">
                     强制刷新
                   </button>
                </div>

                <!-- Editor Container -->
                <!-- FIXED: Added 'min-h-[500px]' for mobile and use 'lg:absolute' to only lock height on PC -->
                <div class="flex-grow relative w-full overflow-hidden rounded-md sketchy-input-area min-h-[500px] lg:min-h-0"
                     :class="isDark ? 'border-gray-600 opacity-90' : 'border-gray-300'">
                     
                    <!-- CodeMirror wrapper -->
                    <!-- FIXED: Changed 'absolute inset-0' to 'lg:absolute lg:inset-0' so it flows naturally on mobile -->
                    <div class="relative lg:absolute lg:inset-0 lg:overflow-hidden flex flex-col h-full">
                        <code-mirror 
                          v-show="!(isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG)"
                          ref="editor" 
                          class="flex-grow h-full overflow-hidden" 
                          :class="isDark ? 'border-gray-600 opacity-90' : 'border-gray-300'"
                          @change="onChange">
                        </code-mirror>

                        <!-- Previews -->
                        <div class="h-full overflow-auto p-2" v-if="isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG">
                          <n-message-provider>
                            <preview-main :is-show="isShowPreview" :preview-items="previewItems"></preview-main>
                            <preview-bbs :is-show="isShowPreviewBBS" :preview-items="previewItems"></preview-bbs>
                            <preview-bbs-pineapple :is-show="isShowPreviewBBSPineapple" :preview-items="previewItems"></preview-bbs-pineapple>
                            <preview-trg :is-show="isShowPreviewTRG" :preview-items="previewItems"></preview-trg>
                          </n-message-provider>
                        </div>
                    </div>
                </div>
              </div>
            </main>

          </div>
        </n-spin>
      </n-layout-content>

      <!-- Mobile FAB -->
      <div class="lg:hidden fixed bottom-6 right-6 z-50">
        <button class="sketchy-fab w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95" 
                :class="isDark ? 'bg-gray-700 border-gray-400 text-white' : 'bg-white border-black text-black'"
                @click="showMobileDrawer = true">
            <n-icon size="24"><settings-adjust /></n-icon>
        </button>
      </div>

      <!-- Mobile Drawer -->
      <n-drawer v-model:show="showMobileDrawer" placement="right" width="90%">
        <n-drawer-content :body-content-style="{ padding: '0px' }" :native-scrollbar="false">
           <div class="h-full overflow-y-auto p-4 transition-colors duration-300" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'">
              <div class="flex justify-between items-center mb-6 border-b-2 pb-2" :class="isDark ? 'border-gray-700' : 'border-gray-300'">
                 <h3 class="text-xl font-bold font-hand">控制面板</h3>
                 <n-button text @click="showMobileDrawer = false">
                    <template #icon><n-icon size="24"><close /></n-icon></template>
                 </n-button>
              </div>

              <div class="space-y-8 pb-10">
                  <ControlPanelContent 
                    :store="store" 
                    :loading="loading"
                    :colors="colors"
                    :is-dark="isDark"
                    :isShowPreview="isShowPreview"
                    :isShowPreviewBBS="isShowPreviewBBS"
                    :isShowPreviewBBSPineapple="isShowPreviewBBSPineapple"
                    :isShowPreviewTRG="isShowPreviewTRG"
                    :notMobile="notMobile"
                    @deletePc="deletePc"
                    @nameFocus="nameFocus"
                    @nameChanged="nameChanged"
                    @colorChanged="colorChanged"
                    @refreshColors="refreshColors"
                    @exportRecordRaw="exportRecordRaw"
                    @exportRecordDOC="exportRecordDOC"
                    @exportRecordTalkDOC="exportRecordTalkDOC"
                    @exportRecordDocx="exportRecordDocx"
                    @previewClick="previewClick"
                  />
                  
                  <div class="border-t-2 border-dashed pt-4" :class="isDark ? 'border-gray-700' : 'border-gray-300'">
                     <h3 class="font-bold mb-4 text-lg">选项设置</h3>
                     <option-view></option-view>
                  </div>
              </div>
           </div>
        </n-drawer-content>
      </n-drawer>

    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, watch, h, render, computed, defineComponent } from "vue";
import { useStore } from './store'
import CodeMirror from './components/CodeMirror.vue'
import { debounce } from 'lodash-es'
import { exportFileRaw, exportFileQQ, exportFileIRC, exportFileDoc, exportFileDocx } from "./utils/exporter";
import type { DocxExportEntry } from "./utils/exporter";
import { strFromU8, unzlibSync } from 'fflate';
import uaParser from 'ua-parser-js'
import { logMan } from './logManager/logManager'
import { ViewUpdate } from "@codemirror/view";
import { TextInfo } from "./logManager/importers/_logImpoter";
import previewMain from "./components/previews/preview-main.vue";
import previewBbs from "./components/previews/preview-bbs.vue";
import previewBbsPineapple from "./components/previews/preview-bbs-pineapple.vue";
import previewTrg from "./components/previews/preview-trg.vue";
import PreviewItem from './components/previews/preview-main-item.vue'
import PreviewTableTR from './components/previews/preview-table-tr.vue'
import { LogItem, CharItem } from "./logManager/types";
import { setCharInfo } from './logManager/importers/_logImpoter'
import { msgCommandFormat, msgImageFormat, msgIMUseridFormat, msgOffTopicFormat, msgAtFormat } from "./utils";
import { NButton, NText, useMessage, useModal, useNotification, NDrawer, NDrawerContent, NFlex, NIcon, NCheckbox, NConfigProvider, darkTheme } from "naive-ui";
import { LogoGithub, Delete as IconDelete, SettingsAdjust, Close, Moon, Sun } from '@vicons/carbon'
import { breakpointsTailwind, useBreakpoints, useDark, useToggle } from '@vueuse/core'
import OptionView from "./components/OptionView.vue";
import randomColor from "randomcolor";
import { parquetReadObjects } from 'hyparquet'
import { asyncBufferFrom } from 'hyperparam'
import { compressors } from 'hyparquet-compressors'

/**
 * Reusable Control Panel Component
 */
const ControlPanelContent = defineComponent({
  props: ['store', 'loading', 'colors', 'isDark', 'isShowPreview', 'isShowPreviewBBS', 'isShowPreviewBBSPineapple', 'isShowPreviewTRG', 'notMobile'],
  emits: ['deletePc', 'nameFocus', 'nameChanged', 'colorChanged', 'refreshColors', 'exportRecordRaw', 'exportRecordDOC', 'exportRecordTalkDOC', 'exportRecordDocx', 'previewClick'],
  setup(props, { emit }) {
    return () => h('div', { class: 'flex flex-col gap-4' }, [
      
      // Global Actions
      h('div', { class: 'flex gap-2' }, [
          h('button', { 
            class: `sketchy-btn w-full py-2 flex items-center justify-center gap-2 ${props.isDark ? 'text-white border-gray-400 hover:bg-gray-700' : 'text-black border-black hover:bg-gray-100'}`,
            onClick: () => emit('refreshColors')
          }, '重置所有颜色'),
      ]),

      // Character List
      h('div', { class: 'space-y-3' }, 
        props.store.pcList.map((i: any, index: number) => 
          h('div', { 
            class: `flex flex-col gap-2 p-3 border-2 rounded-sm transition-all sketchy-inner-card ${props.isDark ? 'border-gray-600 bg-gray-900/50' : 'border-gray-200 bg-white hover:shadow-sm'}` 
          }, [
             // Row 1: Delete + Name
             h('div', { class: 'flex items-center gap-2' }, [
                h(NButton, { 
                  type: 'error', size: 'small', secondary: true, circle: true,
                  disabled: props.isShowPreview || props.isShowPreviewBBS || props.isShowPreviewBBSPineapple || props.isShowPreviewTRG,
                  onClick: () => emit('deletePc', index, i)
                }, { icon: () => h(NIcon, null, { default: () => h(IconDelete) }) }),
                
                h('div', { class: 'flex-grow font-bold relative' }, [
                   h('input', { 
                     class: `w-full bg-transparent border-b outline-none px-1 py-1 ${props.isDark ? 'border-gray-600 text-gray-200 focus:border-gray-300' : 'border-gray-300 text-gray-800 focus:border-black'}`,
                     value: i.name,
                     disabled: props.isShowPreview || props.isShowPreviewBBS || props.isShowPreviewBBSPineapple || props.isShowPreviewTRG,
                     onInput: (e: any) => i.name = e.target.value,
                     onFocus: () => emit('nameFocus', i),
                     onChange: () => emit('nameChanged', i),
                     placeholder: '角色名'
                   })
                ])
             ]),
             
             // Row 2: ID + Role
             h('div', { class: 'flex gap-2' }, [
                h('input', { 
                  class: `w-2/3 text-xs border rounded px-1 py-1 ${props.isDark ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`, 
                  disabled: true, 
                  value: i.IMUserId,
                  placeholder: 'ID'
                }),
                h('select', { 
                   class: `w-1/3 text-xs border rounded px-1 outline-none ${props.isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-800'}`,
                   value: i.role,
                   onChange: (e: any) => i.role = e.target.value
                }, [
                  { value: '主持人', label: 'KP' }, { value: '角色', label: 'PL' }, { value: '骰子', label: 'Dice' }, { value: '隐藏', label: 'Hide' }
                ].map(opt => h('option', { value: opt.value }, opt.label)))
             ]),

             // Row 3: Color Input (Hex + Picker)
             h('div', { class: 'flex items-center gap-2 mt-1' }, [
                // Color Picker Circle
                h('div', { class: 'relative w-8 h-8 flex-shrink-0' }, [
                   h('input', { 
                     type: 'color', 
                     class: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10',
                     value: i.color,
                     onChange: (e: any) => emit('colorChanged', e.target.value, i)
                   }),
                   h('div', { 
                     class: 'w-full h-full rounded-full border-2 shadow-sm',
                     style: { backgroundColor: i.color, borderColor: props.isDark ? '#555' : '#fff' }
                   })
                ]),
                // Hex Input
                h('input', {
                    type: 'text',
                    class: `flex-grow text-xs border rounded px-2 py-1 font-mono uppercase ${props.isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`,
                    value: i.color,
                    maxlength: 7,
                    onInput: (e: any) => emit('colorChanged', e.target.value, i),
                    onChange: (e: any) => emit('colorChanged', e.target.value, i),
                    placeholder: '#000000'
                })
             ])
          ])
        )
      ),
      
      h('div', { class: `my-2 border-t-2 border-dashed ${props.isDark ? 'border-gray-600' : 'border-gray-300'}` }),

      // Exports
      h('div', { class: 'grid grid-cols-2 gap-3' }, [
         ['下载原始文件', () => emit('exportRecordRaw')],
         ['下载带图Word', () => emit('exportRecordDOC')],
         ['下载对话Word', () => emit('exportRecordTalkDOC')],
         ['下载Docx', () => emit('exportRecordDocx')]
      ].map(([label, action]) => 
         h('button', { 
           class: `sketchy-btn-sm py-2 ${props.isDark ? 'text-gray-200 border-gray-500 hover:bg-gray-700' : 'text-gray-800 border-gray-600 hover:bg-gray-50'}`,
           onClick: action 
         }, label as string)
      )),

      h('div', { class: `my-2 border-t-2 border-dashed ${props.isDark ? 'border-gray-600' : 'border-gray-300'}` }),

      // Preview Modes
      h('div', { class: 'flex flex-col gap-2' }, [
         h('div', { class: `font-bold ${props.isDark ? 'text-gray-400' : 'text-gray-600'}` }, '预览模式'),
         h('div', { class: 'grid grid-cols-2 gap-2' }, [
            { label: '普通预览', mode: 'preview', active: props.isShowPreview },
            { label: '论坛代码', mode: 'bbs', active: props.isShowPreviewBBS },
            { label: '菠萝包代码', mode: 'bbspineapple', active: props.isShowPreviewBBSPineapple },
            { label: '回声工坊', mode: 'trg', active: props.isShowPreviewTRG },
         ].map(btn => 
            h('button', { 
               class: `sketchy-btn-sm py-1 transition-all ${
                 btn.active 
                   ? (props.isDark ? 'bg-gray-600 text-white border-gray-300' : 'bg-gray-800 text-white border-black') 
                   : (props.isDark ? 'text-gray-300 border-gray-600 hover:bg-gray-800' : 'text-gray-700 border-gray-400 hover:bg-gray-50')
               }`,
               onClick: () => emit('previewClick', btn.mode)
            }, btn.label)
         ))
      ])
    ])
  }
})

const showMobileDrawer = ref(false)
const breakpoints = useBreakpoints(breakpointsTailwind)
const notMobile = breakpoints.greater('sm')

const isDark = useDark()
const toggleDark = useToggle(isDark)

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

const colors = ref<string[]>([])
const refreshColors = () => {
  colors.value = randomColor({ count: Math.max(16, store.pcList.length) })
  store.pcList.forEach((pc: CharItem, idx: number) => {
      const newColor = colors.value[idx] || randomColor();
      pc.color = newColor;
      store.pcNameColorMap.set(pc.name, newColor);
  });
  store.colorMapSave();
  message.success("全员颜色已重置！", { duration: 1000 })
}

const colorChanged = debounce((v: string, i: CharItem) => {
  if(v.startsWith('#') || v.length === 6 || v.length === 7) {
      if(!v.startsWith('#')) v = '#' + v;
      i.color = v
      store.pcNameColorMap.set(i.name, v)
      store.colorMapSave();
  }
}, 100)

const backV1 = () => {
  location.href = 'https://dice.weizaima.com';
}

const clearText = () => {
  store.editor.dispatch({
    changes: { from: 0, to: store.editor.state.doc.length, insert: '' }
  })
}

const doFlush = () => {
  console.log('flush')
  logMan.flush();
}

const previewClick = (mode: 'preview' | 'bbs' | 'bbspineapple' | 'trg') => {
  switch (mode) {
    case 'preview':
      isShowPreview.value = !isShowPreview.value
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      if(isShowPreview.value) showPreview()
      break;
    case 'bbs':
      isShowPreviewBBS.value = !isShowPreviewBBS.value
      isShowPreview.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      store.exportOptions.imageHide = true
      if(isShowPreviewBBS.value) showPreview()
      break;
    case 'bbspineapple':
      isShowPreviewBBSPineapple.value = !isShowPreviewBBSPineapple.value
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewTRG.value = false
      store.exportOptions.imageHide = true
      if(isShowPreviewBBSPineapple.value) showPreview()
      break;
    case 'trg':
      isShowPreviewTRG.value = !isShowPreviewTRG.value
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      store.exportOptions.imageHide = true
      if(isShowPreviewTRG.value) showPreview()
      break;
  }
}

function setupUA() {
  const parser = new uaParser.UAParser()
  parser.setUA(navigator.userAgent)
  const deviceType = parser.getDevice()

  const browser = parser.getBrowser().name
  downloadUsableRank.value = 1

  isMobile.value = deviceType.type === 'mobile'
  if (deviceType.type === 'mobile') {
    switch (browser) {
      case 'Edge':
      case 'Chrome':
      case 'Chromium':
      case 'Firefox':
      case 'MIUI Browser':
      case 'Opera':
        downloadUsableRank.value = 2
    }
  }
}

setupUA()

const browserAlert = () => {
  if (downloadUsableRank.value === 0) {
    message.warning('你目前所使用的浏览器无法下载文件，请更换对标准支持较好的浏览器。建议使用Chrome/Firefox/Edge')
  }
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
      const record = await store.tryFetchLog(key, password) as any
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
              items: res.map((v:any) => {
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

function showPreview() {
  const tmp: LogItem[] = [];
  let index = 0;

  for (let i of logMan.curItems) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    let msg = msgImageFormat(i.message, store.exportOptions);
    msg = msgAtFormat(msg, store.pcList);
    msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);
    msg = msgCommandFormat(msg, store.exportOptions);
    msg = msgIMUseridFormat(msg, store.exportOptions, i.isDice);
    msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);
    if (msg.trim() === '') continue;

    i.index = index;
    tmp.push(i);
    index += 1;
  }
  previewItems.value = tmp;
}

const store = useStore()
store.colorMapLoad();

watch(() => store.exportOptions.offTopicHide, showPreview)
watch(
  () => store.pcList.map(pc => `${pc.IMUserId}-${pc.role}-${pc.name}`),
  () => showPreview(),
  { deep: false }
)

const editor = ref()
watch(isDark, () => {
  store.reloadEditor()
})

const deletePc = (index: number, i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const m = modal.create({
    title: '删除角色',
    preset: 'card',
    style: { width: '30rem' },
    content: `即将删除角色「${i.name}」及其全部发言，确定吗？`,
    footer: () => [
      h(NButton, { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } }, () => '取消'),
      h(NButton, { type: 'primary', onClick: () => {
            try {
              store.pcList.splice(index, 1);
              logMan.deleteByCharItem(i);
            } finally { m.destroy() }
          }
        }, () => '确定'),
    ]
  })
}

let lastPCName = ''
const nameFocus = (i: CharItem) => { lastPCName = i.name }
let lastNameChange = 0;
const nameChanged = (i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const oldName = lastPCName; 
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
      style: { width: '30rem' },
      content: () => [ h(NText, { innerHTML: `即将进行名字变更 <b>${name1} -> ${name2}</b><br />将修改信息行，并在文本中进行批量替换（${name1w} 替换为 ${name2w}），确定吗？` }) ],
      footer: () => [
        h(NButton, { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } }, () => '取消'),
        h(NButton, { type: 'primary', onClick: () => {
              try { logMan.rename(i, oldName, newName) } 
              catch (_e) { i.name = oldName; } 
              finally { m.destroy() }
            }
          }, () => '确定'),
      ]
    })
  }
}

logMan.ev.on('textSet', (text) => {
  store.editor.dispatch({ changes: { from: 0, to: store.editor.state.doc.length, insert: text } });
  let m = new Map<string, CharItem>();
  for (let i of logMan.curItems) {
    if (i.isRaw) continue;
    setCharInfo(m, i);
  }
  store.updatePcList(m);
});

logMan.ev.on('parsed', (ti: TextInfo) => { store.updatePcList(ti.charInfo); })

const onChange = (v: ViewUpdate) => {
  if (v && v.docChanged) {
      if (!v.viewportChanged && (v as any).flags === 0) return;
      const ranges = (v as any).changedRanges;
      if (ranges.length) {
        for (let i = ranges.length - 1; i >= 0; i--) {
          const payloadText = store.editor.state.doc.toString()
          const r1 = [ranges[i].fromA, ranges[i].toA];
          const r2 = [ranges[i].fromB, ranges[i].toB];
          if (r1[0] === 0 && r1[1] === logMan.lastText.length) store.pcList = [];
          logMan.syncChange(payloadText, r1, r2);
        }
      }
  }
}

const doEditorHighlightClick = (e: any) => {
  if (e.target.tagName === 'INPUT') return;
  const doHl = () => { setTimeout(() => { store.reloadEditor() }, 500) }

  if (store.doEditorHighlight) {
    if (isMobile.value) {
      const m = modal.create({
        title: '开启编辑器染色？',
        preset: 'card',
        style: { width: '30rem' },
        content: '部分移动设备上的特定浏览器可能会因为兼容性问题而卡死，继续吗？',
        footer: () => [
          h(NButton, { type: 'default', onClick: () => { store.doEditorHighlight = false; m.destroy(); setTimeout(() => { doFlush() }, 3000) }, style: { marginRight: '1rem' } }, () => '取消'),
          h(NButton, { type: 'primary', onClick: () => { try { doHl() } catch (_e) { setTimeout(() => { store.doEditorHighlight = false; store.reloadEditor() }, 500) } finally { m.destroy() } } }, () => '确定'),
        ]
      })
      return
    }
  }
  doHl()
}

const reloadFunc = () => { store.reloadEditor() }
const pcList = computed(() => store.pcList)
watch(pcList, reloadFunc, { deep: true })
const exportOptions = computed(() => store.exportOptions)
watch(exportOptions, reloadFunc, { deep: true })
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.font-hand {
  font-family: 'Patrick Hand', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Light Theme Sketchy Styles */
.sketchy-bg {
  background-color: #f8f9fa;
  background-image: 
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.sketchy-card {
  border-width: 2px;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.8);
  transition: all 0.3s ease;
}

.sketchy-inner-card {
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
}

.sketchy-btn, .sketchy-btn-sm {
  border-width: 2px !important;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px !important;
  font-weight: bold !important;
  transition: transform 0.1s, box-shadow 0.1s !important;
  cursor: pointer;
  
  /* Hard Shadow for buttons */
  box-shadow: 2px 2px 0px 0px currentColor !important;
  
  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px 0px currentColor !important;
  }
}

.sketchy-btn-sm {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sketchy-tag {
  border: 2px solid;
  border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px !important;
  display: inline-block;
}

.sketchy-fab {
  border-width: 2px !important;
  box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.8) !important;
}

/* Dark Mode Overrides - Blackboard Style */
.dark .sketchy-card {
  box-shadow: 4px 4px 0px 0px rgba(255,255,255,0.2);
}

.dark .sketchy-btn, .dark .sketchy-btn-sm {
  box-shadow: 2px 2px 0px 0px rgba(255,255,255,0.5) !important;
  &:active {
    box-shadow: none !important;
  }
}

.dark .sketchy-fab {
  box-shadow: 3px 3px 0px 0px rgba(255,255,255,0.3) !important;
}

/* Editor Specifics */
.sketchy-input-area {
  border-width: 2px;
}

.cm-editor {
  height: 100%;
}

/* Ensure inputs in sidebar have correct style in dark mode */
input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}
input[type="color"]::-webkit-color-swatch {
	border: none;
    border-radius: 9999px;
}
</style>