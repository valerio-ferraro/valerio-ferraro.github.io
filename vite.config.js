import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/",
  plugins: [{
    name: "render-blocking-navigation",
    // Vite recreates entry script tags, so restore the critical attribute.
    transformIndexHtml: {
      order: "post",
      handler: (html) => html.replace(
        /<script type="module" crossorigin /g,
        '<script type="module" crossorigin blocking="render" ',
      ),
    },
  }],
  build: {
    // Embed each environment's fonts in its own blocking stylesheet. This avoids
    // a separate font round-trip and gives the transition its final text metrics.
    assetsInlineLimit: (path) => path.endsWith(".woff2") ? true : undefined,
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
