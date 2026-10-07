import { defineConfig } from "vite";

export default defineConfig({
  root: "website",
  base: "./",
  publicDir: false,
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    lib: {
      entry: "../src/app/main.ts",
      name: "RobboGame",
      formats: ["iife"],
      fileName: () => "robbo.js"
    }
  }
});
