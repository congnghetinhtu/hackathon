import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vaultServer from "./vaultServer.js";

export default defineConfig({
  plugins: [react(), vaultServer()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
