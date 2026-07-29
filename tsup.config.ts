import { defineConfig } from "tsup";
import pkg from "./package.json";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: false,
    treeshake: true,
    clean: true,
    minify: true,
    external: Object.keys(pkg.devDependencies || {}),
});
