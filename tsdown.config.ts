import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["cjs", "esm"],
  exports: true,
  dts: true,
  sourcemap: true,
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
  }),
});
