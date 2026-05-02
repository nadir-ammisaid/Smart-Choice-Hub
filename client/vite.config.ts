import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react({ babel: false })],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ["jwt-decode"],
  },
});
