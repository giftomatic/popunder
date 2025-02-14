import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  const format = mode === "production" ? "esm" : mode;
  const isLib = ["esm", "cjs"].includes(format) ? "inline" : false;
  return {
    build: {
      target: "es2022",
      outDir: "dist/" + format,
      minify: !isLib,
      sourcemap: isLib,
      lib: {
        entry: "src/popunder.ts",
        name: "Popunder",
        formats: format === "esm" ? ["es"] : [format],
      },
    },
    plugins: [format === "esm" && dts({ outDir: "dist/types" })],
    test: {
      environment: "happy-dom",
    },
  };
});
