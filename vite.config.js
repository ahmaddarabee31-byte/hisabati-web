import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "حساباتي",
        short_name: "حساباتي",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          {
            src: "/logo-hisabati.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-hisabati.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});