import Solid, { onMount } from "solid-js";
import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import { css } from "vite-plugin-inline-css-modules";
import "./styles.css";
import { unocssInject } from "./unocssInject";
import { storage, tabs } from "webextension-polyfill";
import { palettes } from "~/entries/contentScript/primary/loadStyles";
import { Palette } from "~/assets/schemas/types/palette";

const classes = css`
  .root {
    @apply w-prose min-h-50 bg-surface-base p-2 px-4;
  }
`;

function PaletteCard({ name, palette }: { name: string; palette: Palette }) {
  const setTheme = async () => {
    await storage.local.set({ theme: name });
    const tabList = await tabs.query({});
    for (const tab of tabList) {
      tabs.sendMessage(tab.id!, { type: "palette-change", name });
    }
    unocssInject();
    // await runtime.sendMessage(undefined, { type: "palette-change", name });
  };

  return (
    <button
      class="rounded-md overflow-hidden bg-surface-light hover:bg-surface-dark"
      onClick={setTheme}
    >
      <div
        class="h-20 w-30 border-2 p-2 flex flex-col gap-2"
        style={{
          "background-color": palette.variables["ui"]?.["background"],
          "border-color": palette.variables["ui"]?.["border"],
        }}
      >
        <div
          class="w-8 h-3 rounded-full"
          style={{ "background-color": palette.variables["ui"]?.primary }}
        ></div>
        <div
          class="w-24 h-3 rounded-full"
          style={{ "background-color": palette.variables["ui"]?.secondary }}
        ></div>
      </div>
      <span class="color-text-base font-bold">{name}</span>
    </button>
  );
}

function PageContent(_props: Solid.ParentProps) {
  const themeItems = Object.entries(palettes);

  onMount(() => {
    unocssInject();
  });

  return (
    <div class={classes.root}>
      <h3 class="text-lg font-bold text-left pb-1">Color Palettes</h3>
      <div class="flex gap-2 flex-wrap">
        {themeItems.map(([name, palette]) => (
          <PaletteCard name={name} palette={palette} />
        ))}
      </div>
    </div>
  );
}

export default PageContent;
