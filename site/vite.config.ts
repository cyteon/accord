import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solidStart(), nitro(), tailwindcss()],
  server: {
    proxy: {
      "/gateway": {
        target: "ws://localhost:4001",
        ws: true,
      },
    },
  },
  ssr: { external: ["drizzle-orm"] },
});
