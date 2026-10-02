import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  build: {
    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 生产环境
    sourceMap: false,

    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },

    // 代码分割
    rollupOptions: {
      input: {
        main: resolve(_dirname, 'index.html')
      },
      output: {
        // 分块策略
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['lodash', 'axios', 'dayjs']
        },

        // 文件命名
        chunkFilename: 'assets/js/[name]-[hash].js',
        entryFilename: 'assets/js/[name]-[hash].js',
        assetFilename: 'assets/js/[name]-[hash].[ext]'
      }
    },

    // 资源内联阈值
    assetsInlineLimit: 4096,

    // CSS 代码分割
    cssCodeSplit: true,

    // 构建大小警告
    chunkSizeWarningLimit: 1000
  }

})
