import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.js",
  format: ["esm", "cjs"],
  minify: true,
  treeshake: true,
});
