import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // 提升警告阈值到 1MB 适配原型展示
    rollupOptions: {
      output: {
        // 分片优化策略：将 node_modules 中的大包独立拆分，优化首屏加载
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) return 'vendor-mermaid';
            if (id.includes('markdown-it') || id.includes('entities')) return 'vendor-markdown';
            if (id.includes('element-plus')) return 'vendor-element-plus';
            return 'vendor-others';
          }
        }
      }
    }
  }
})
