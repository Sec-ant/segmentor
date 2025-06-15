import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { version } from "./node_modules/@echogarden/icu-segmentation-wasm/package.json";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["module"],
    },
  },
  define: {
    wasmUrl: JSON.stringify(
      `https://fastly.jsdelivr.net/npm/@echogarden/icu-segmentation-wasm@${version}/wasm/icu-segmentation.wasm`,
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 52_428_800,
      },
    }),
  ],
});
