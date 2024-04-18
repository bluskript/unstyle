import Solid, {
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import { css } from "vite-plugin-inline-css-modules";
import "./styles.css";
import { unocssInject } from "./unocssInject";
import { storage, tabs } from "webextension-polyfill";
import {
  colorGroups,
  getSelectedTheme,
  palettes,
  resolveColorReference,
} from "~/entries/contentScript/primary/loadStyles";
import { Palette } from "~/assets/schemas/types/palette";
import PaletteSchema from "~/assets/schemas/out/palette.json";

const classes = css`
  .root {
    @apply w-prose min-h-50 bg-surface-base p-2 px-4 gap-1 flex flex-col;
  }
`;

function PaletteCard({
  name,
  palette,
  updatePalette,
}: {
  name: string;
  palette: Palette;
  updatePalette: () => any;
}) {
  const setTheme = async () => {
    await storage.local.set({ theme: name });
    const tabList = await tabs.query({});
    for (const tab of tabList) {
      tabs.sendMessage(tab.id!, { type: "palette-change", name });
    }
    updatePalette();
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
      <span class="color-text-base font-bold">{palette.name}</span>
    </button>
  );
}

function isHexLight(hexColor?: string): boolean {
  if (!hexColor) return false;

  hexColor = hexColor.replace("#", "");
  const rgb = parseInt(hexColor, 16);

  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128;
}

function PaletteEditorItem({
  group,
  name,
  colors,
  colorChanged,
}: {
  group: string;
  name: string;
  colors:
  | Record<string, { color: string; source: string } | undefined>
  | undefined;
  colorChanged: (newColor: string | undefined) => void;
}) {
  const x = colors?.[name];
  const [isEditing, setIsEditing] = createSignal(false);
  const [editText, setEditText] = createSignal("");
  const [inputRef, setInputRef] = createSignal<HTMLSpanElement | undefined>(
    undefined
  );

  function handleEditClick() {
    setIsEditing(true);
    setEditText(x?.color || "");
    setTimeout(() => {
      const input = inputRef();
      if (input) {
        input.focus();
        const range = document.createRange();
        range.selectNodeContents(input);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  }

  function handleInputBlur() {
    setIsEditing(false);
    if (editText() !== x?.color) {
      colorChanged(editText());
    }
  }

  function handleInput(key: KeyboardEvent) {
    setTimeout(() => {
      if (key.code === "Enter") {
        return handleInputBlur();
      }
      setEditText(inputRef()?.innerText || "");
    });
  }

  const colorStyle = () => {
  const isLight = x && isHexLight(isEditing() ? editText() : x.color)
  // const outline = isLight ? "white" : "black"
  const background = isLight ? "black" : "white"
    return {
      color: isEditing() ? editText() : x?.color,
      // "text-shadow": `-1px -1px 0 ${outline}, 1px -1px 0 ${outline}, -1px 1px 0 ${outline}, 1px 1px 0 ${outline}`,
      "background-color": background,
    };
  };

  return (
    <div class="relative pl-3">
      <div class="flex gap-1 items-center p-1 group" id={`${group}-${name}`}>
        <span class="text-xs font-bold text-secondary-base">{name}</span>
        <span
          ref={setInputRef}
          class="text-xs font-bold rounded-sm px-1 max-w-min"
          contenteditable={isEditing()}
          onKeyPress={handleInput}
          role="textbox"
          style={colorStyle()}
          onBlur={handleInputBlur}
        >
          {x?.color}
        </span>
        <Show when={x?.source === `${group}:${name}`}>
          <button
            class="hover:color-primary-base i-tabler-x"
            onClick={() => colorChanged(undefined)}
          >
            Remove Color
          </button>
        </Show>
        <div class="absolute left-0 top-0 flex items-center justify-center h-full">
          <button
            class="opacity-0 group-hover:opacity-100 hover:color-primary-base i-tabler-pencil"
            onClick={handleEditClick}
          >
            Edit
          </button>
        </div>
        <Show when={!!x && x.source != `${group}:${name}`}>
          <span class="color-text-base">{x!.source}</span>
          <a
            class="color-secondary-base i-tabler-arrow-up-right"
            href={`#${x!.source.replaceAll(":", "-")}`}
          >
            References {x!.source}
          </a>
        </Show>
      </div>
    </div>
  );
}

function PageContent(_props: Solid.ParentProps) {
  const themeItems = Object.entries(palettes);
  const [selectedPalette, setSelectedPalette] = createSignal(palettes.bocchi);
  const resolvedPalette = () => {
    const palette = selectedPalette();
    const properties = PaletteSchema.properties.variables.properties as Record<
      string,
      {
        properties: Record<string, any>;
      }
    >;
    return Object.fromEntries(
      Object.entries(properties).map(([group, { properties }]) => {
        return [
          group,
          Object.fromEntries(
            Object.keys(properties).map((name) => {
              const fieldName = `${group}:${name}`;
              return [
                name,
                resolveColorReference(
                  palette,
                  [fieldName, fieldName],
                  colorGroups
                ),
              ];
            })
          ),
        ];
      })
    );
  };

  const updatePalette = async () => {
    const palette = await getSelectedTheme();
    setSelectedPalette(palette);
  };

  const onColorChange = async (
    group: string,
    colorName: string,
    color: string | undefined
  ) => {
    setSelectedPalette((prev) => {
      const newPalette = {
        ...prev,
        variables: {
          ...prev.variables,
          [group]: {
            ...(
              prev.variables as Record<
                string,
                Record<string, string | undefined>
              >
            )[group],
            [colorName]: color,
          },
        },
      };
      if (!color)
        delete (
          newPalette.variables as Record<
            string,
            Record<string, string | undefined>
          >
        )[group][colorName];
      console.log(newPalette, prev);
      return newPalette;
    });
  };

  onMount(async () => {
    updatePalette();
  });

  createEffect(() => {
    unocssInject(selectedPalette());
  });

  return (
    <div class={classes.root}>
      <h3 class="text-base font-bold text-left">Color Palettes</h3>
      <div class="flex gap-2 flex-wrap">
        {themeItems.map(([name, palette]) => (
          <PaletteCard
            name={name}
            palette={palette}
            updatePalette={updatePalette}
          />
        ))}
      </div>
      <h3 class="text-base font-bold text-left">Palette Editor</h3>
      <div class="flex flex-col text-left gap-1">
        <For each={Object.entries(resolvedPalette())}>
          {([group, colors]) => (
            <>
              <span class="text-base font-bold text-primary-base">{group}</span>
              <div>
                <For
                  each={Object.entries(
                    (
                      PaletteSchema.properties.variables.properties as Record<
                        string,
                        { properties: Record<string, any> }
                      >
                    )[group].properties
                  )}
                >
                  {([name, value]) => (
                    <PaletteEditorItem
                      colors={colors}
                      name={name}
                      group={group}
                      colorChanged={(newColor) =>
                        onColorChange(group, name, newColor)
                      }
                    />
                  )}
                </For>
              </div>
            </>
          )}
        </For>
      </div>
    </div>
  );
}

export default PageContent;
