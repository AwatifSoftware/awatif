import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 4600,
    open: "sheets/index.html",
  },
  base: "./", // to resolve assets
  root: "./src",
  build: {
    outDir: "../../website/src/examples",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "3d-structure": "src/3d-structure/index.html",
        "advanced-truss": "src/advanced-truss/index.html",
        bars: "src/bars/index.html",
        beams: "src/beams/index.html",
        building: "src/building/index.html",
        curves: "src/curves/index.html",
        "1d-mesh": "src/1d-mesh/index.html",
        sphere: "src/sphere/index.html",
        truss: "src/truss/index.html",
        sheets: "src/sheets/index.html",
        "2d-mesh": "src/2d-mesh/index.html",
      },
    },
  },
});
