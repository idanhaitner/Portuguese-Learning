import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** GitHub Pages has no SPA fallback: serving index.html as 404.html lets deep links load the app. */
function spaFallback(): Plugin {
  let outDir = "dist";
  return {
    name: "spa-404-fallback",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

export default defineConfig(({ command }) => ({
  // Project page lives at https://idanhaitner.github.io/Portuguese-Learning/
  base: command === "build" ? "/Portuguese-Learning/" : "/",
  plugins: [react(), tailwindcss(), spaFallback()],
}));
