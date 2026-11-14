// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Static site. React components (shadcn/ui) render to HTML at build time;
// no component uses a client directive, so the page ships no JavaScript.
export default defineConfig({
  site: "https://www.kinderform.org",
  output: "static",
  integrations: [react()],
  build: { inlineStylesheets: "never" },
  vite: {
    plugins: [tailwindcss()],
    // USWDS Sass packages import each other by name ("uswds-core" and so on).
    css: {
      preprocessorOptions: {
        scss: { loadPaths: ["node_modules/@uswds/uswds/packages"], quietDeps: true },
      },
    },
    // esbuild minifies CSS here because Lightning CSS rejects a media query in USWDS.
    build: { cssMinify: "esbuild" },
  },
});
