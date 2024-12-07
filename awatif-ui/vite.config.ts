import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 4600,
    open: "column-designer/index.html",
  },
  root: "./src",
});
