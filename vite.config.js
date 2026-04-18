import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: fromRoot("index.html"),
        research: fromRoot("research.html"),
        photography: fromRoot("photography.html"),
        blog: fromRoot("blog.html"),
        notFound: fromRoot("404.html")
      }
    }
  }
});
