import { defineConfig, presetIcons, transformerDirectives } from "unocss";
import presetUno from "@unocss/preset-uno";

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      surface: {
        base: "rgba(var(--surface-base))",
        light: "rgba(var(--surface-light))",
        dark: "rgba(var(--surface-dark))",
      },
      primary: {
        base: "rgba(var(--primary-base))",
        light: "rgba(var(--primary-light))",
        dark: "rgba(var(--primary-dark))",
      },
      secondary: {
        base: "rgba(var(--secondary-base))",
        light: "rgba(var(--secondary-light))",
        dark: "rgba(var(--secondary-dark))",
      },
      text: {
        base: "rgba(var(--text-base))",
      },
    },
  },
});
