import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: "website",
  base: "./",
  publicDir: false,
  // HTML URLs resolve from website's origin, not from the repository directory.
  resolve: { alias: { "/src": fileURLToPath(new URL("./src", import.meta.url)) } },
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
