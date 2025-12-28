import path from 'path'
import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
      '@/': `${pathSrc}/vnve/editor/src/`,
      '@vnve/core': `${pathSrc}/vnve/core/src`,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        vnve: path.resolve(__dirname, 'vnve.html'),
        kpi: path.resolve(__dirname, 'kpi.html'),
        pdf: path.resolve(__dirname, 'pdf.html'),
      },
    },
  },
  plugins: [
    vue() as PluginOption,
    react() as PluginOption,
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        NaiveUiResolver(),
      ],
      dts: 'src/components.d.ts',
    }) as PluginOption,
    // legacy({
    //   targets: ['defaults', 'not IE 11']
    // })
  ],
  server: {
    proxy: {
      '/tts-proxy': {
        target: 'https://logbackend.fishwhite.top',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://logpainter.fishwhite.top');
          });
        }
      },
      '/api': {
          changeOrigin: true,
          target: 'https://worker.firehomework.top/dice/api',
          // target: 'http://8.130.140.128:8082',
          // target: 'http://localhost:8088',

          rewrite: (path) => path.replace(/^\/api/, ''),

      },
    }
  },
})
