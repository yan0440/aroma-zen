import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // 強制讓 React 外掛同時解析 .js 和 .jsx 檔案中的 HTML 語法
      include: /\.(js|jsx)$/,
    }),
  ],
  esbuild: {
    // 核心保險：強制編譯器把所有 .js 檔案直接當作 jsx 讀取
    loader: 'jsx',
    include: /\.(js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})