import uiColorGroup from "~/assets/color_groups/ui.json";
import codeColorGroup from "~/assets/color_groups/code.json";
import { URLPattern } from "urlpattern-polyfill";
import { Stylesheet } from "~/assets/schemas/types/stylesheet";
import { Palette } from "~/assets/schemas/types/palette";
import { ColorGroup } from "~/assets/schemas/types/color-group";
import { runtime, storage } from "webextension-polyfill";

export const stylesheets: {
	glob: URLPattern;
	manifest: Stylesheet;
	style: () => Promise<{ default: string }>;
}[] = Object.entries<Stylesheet>(
	import.meta.glob("../../../assets/websites/*.json", { eager: true })
)
	.map(([_name, stylesheet]) => ({
		glob: stylesheet.glob,
		manifest: stylesheet,
		style: () => import(`../../../assets/websites/${stylesheet.id}.css?raw`),
	}))
	.map((x) => ({
		glob: new URLPattern({ hostname: x.glob }),
		style: x.style,
		manifest: x.manifest as Stylesheet,
	}));

export const colorGroups = {
	ui: uiColorGroup as ColorGroup,
	code: codeColorGroup as ColorGroup,
};

export const palettes: Record<string, Palette> = Object.fromEntries(
	Object.entries<Palette>(
		import.meta.glob("../../../assets/themes/*.json", { eager: true })
	).map(([_name, value]) => [value.id, value])
);

export async function getSelectedTheme() {
	const obj = await storage.local.get("theme");
	if (!obj["theme"]) {
		await storage.local.set({ theme: "catppuccin" });
	}
	const theme = obj["theme"] || "catppuccin";

	return palettes[theme];
}

export function resolveColorReference(
	theme: Palette,
	fallbacks: string[],
	colorGroups: Record<string, ColorGroup>
): { color: string; source: string } | undefined {
	for (let i = 0; i < fallbacks.length; i++) {
		const reference = fallbacks[i];
		if (reference.includes(":")) {
			const [group, colorKey] = reference.split(":", 2);
			const fallbacks = [
				`${group}:${colorKey}`,
				...colorGroups[group].variables[colorKey],
			];
			let result: { color: string; source: string } | undefined;
			if (i === 0 || !fallbacks || fallbacks.length === 0) {
				const x = (
					theme.variables[group as keyof Palette["variables"]] as Record<
						string,
						string | undefined
					>
				)?.[colorKey];
				if (x?.includes(":")) {
					result = resolveColorReference(theme, [x, x], colorGroups);
				} else {
					result = x
						? {
							color: x,
							source: `${group}:${colorKey}`,
						}
						: undefined;
				}
			} else result = resolveColorReference(theme, fallbacks, colorGroups);
			if (result) return result;
		}
	}
}

export const resolveTheme = (
	theme: Palette,
	stylesheet: Stylesheet,
	colorGroups: Record<string, ColorGroup>
) =>
	Object.fromEntries(
		Object.entries(stylesheet.variables).map(([name, value]) => [
			name,
			resolveColorReference(theme, [name, ...value], colorGroups)?.color,
		])
	);

// function resolveTheme(
// 	theme: Palette,
// 	stylesheet: Stylesheet,
// 	colorGroups: Record<string, ColorGroup>,
// ) {
// 	const resolvedTheme: Record<string, string> = {};
//
// 	for (const [key, value] of Object.entries(stylesheet.variables)) {
// 		if (currentColorKey.includes(":")) {
// 			const [group, colorKey] = currentColorKey.split(":");
// 			currentColorGroup = colorGroups[group].variables;
// 			currentColorKey = colorKey;
// 		}
//
// 		while (
// 			Array.isArray(currentColorGroup[currentColorKey]) &&
// 			currentColorGroup[currentColorKey].length > 0
// 		) {
// 			currentColorKey = currentColorGroup[currentColorKey][0];
// 			if (currentColorKey.includes(":")) {
// 				const [group, colorKey] = currentColorKey.split(":");
// 				currentColorGroup = colorGroups[group].variables;
// 				currentColorKey = colorKey;
// 			}
// 		}
//
// 		resolvedTheme[key] = currentColorGroup[currentColorKey];
// 	}
//
// 	return resolvedTheme;
// }

const createPaletteStylesheet = (
	references: Record<string, string | undefined>
) => {
	let el =
		document.querySelector(".unstyle-palette") ||
		document.createElement("style");
	el.className = "unstyle-palette";
	const vars = Object.entries(references)
		.map(([name, value]) => `--${name}: ${value};`)
		.join("\n");
	el.textContent = `
		:root {
			${vars}
		}
	`;
	document.body.appendChild(el);
};

export const loadStyles = async () => {
	const selectedTheme = await getSelectedTheme();
	const matchedStyles = stylesheets.filter(({ glob }) =>
		glob.test(window.location.href)
	);
	for (const x of matchedStyles) {
		const styleElement = document.createElement("style");
		styleElement.textContent = (await x.style()).default;
		document.body.appendChild(styleElement);
		const references = resolveTheme(selectedTheme, x.manifest, colorGroups);
		createPaletteStylesheet(references);

		runtime.onMessage.addListener((message) => {
			if (message.type === "palette-change") {
				const palette = palettes[message.name];
				const theme = resolveTheme(palette, x.manifest, colorGroups);
				createPaletteStylesheet(theme);
			}
			return true;
		});
	}
};
