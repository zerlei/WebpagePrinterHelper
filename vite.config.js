import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 最简单的代理配置
      "/command": {
        target: "http://localhost:8845",
        changeOrigin: true,
      },
    },
  },
});
