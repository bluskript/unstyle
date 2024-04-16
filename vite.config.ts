import { defineConfig, loadEnv } from "vite";
import solid from "vite-plugin-solid";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import UnoCSS from "unocss/vite";
import inlineCssModules from "vite-plugin-inline-css-modules";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      UnoCSS(),
      inlineCssModules(),
      solid(),
      webExtension({
        manifest: getManifest(Number(env.MANIFEST_VERSION)),
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.platform": null,
      "process.version": null,
    },
  };
});
