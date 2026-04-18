import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        research: resolve(__dirname, "research.html"),
        photography: resolve(__dirname, "photography.html"),
        blog: resolve(__dirname, "blog.html"),
        notFound: resolve(__dirname, "404.html")
      }
    }
  }
});
