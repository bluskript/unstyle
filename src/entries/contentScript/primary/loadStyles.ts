import archwiki from "~/assets/websites/archwiki.css?raw";
import archwikiManifest from "~/assets/websites/archwiki.json";
import selectedTheme from "~/assets/themes/magic.json";
import uiColorGroup from "~/assets/color_groups/ui.json";
import { URLPattern } from "urlpattern-polyfill";
import { Stylesheet } from "~/assets/schemas/types/stylesheet";
import { Palette } from "~/assets/schemas/types/palette";
import { ColorGroup } from "~/assets/schemas/types/color-group";

const stylesheets: {
	glob: URLPattern;
	manifest: Stylesheet;
	style: string;
}[] = [{ glob: "wiki.archlinux.org", style: archwiki }].map((x) => ({
	glob: new URLPattern({ hostname: x.glob }),
	style: x.style,
	manifest: archwikiManifest as Stylesheet,
}));

function resolveColorReference(
	theme: Palette,
	fallbacks: string[],
	colorGroups: Record<string, ColorGroup>,
): string | undefined {
	for (let i = 0; i < fallbacks.length; i++) {
		const reference = fallbacks[i];
		if (reference.includes(":")) {
			const [group, colorKey] = reference.split(":", 2);
			const fallbacks = [
				`${group}:${colorKey}`,
				...colorGroups[group].variables[colorKey],
			];
			let result: string | undefined;
			if (i === 0 || !fallbacks || fallbacks.length === 0)
				result =
					theme.variables[group as keyof Palette["variables"]]?.[
					colorKey as keyof Palette["variables"][keyof Palette["variables"]]
					];
			else result = resolveColorReference(theme, fallbacks, colorGroups);
			if (result) return result;
		}
	}
}

const resolveTheme = (
	theme: Palette,
	stylesheet: Stylesheet,
	colorGroups: Record<string, ColorGroup>,
) =>
	Object.fromEntries(
		Object.entries(stylesheet.variables).map(([name, value]) => [
			name,
			resolveColorReference(theme, [name, ...value], colorGroups),
		]),
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

export const loadStyles = () => {
	const matchedStyles = stylesheets.filter(({ glob }) =>
		glob.test(window.location.href),
	);
	for (const x of matchedStyles) {
		const styleElement = document.createElement("style");
		styleElement.textContent = x.style;
		document.body.appendChild(styleElement);
		const references = resolveTheme(selectedTheme, x.manifest, {
			ui: uiColorGroup as ColorGroup,
		});
		const el = document.createElement("style");
		const vars = Object.entries(references)
			.map(([name, value]) => `--${name}: ${value};`)
			.join("\n");
		el.textContent = `
		:root {
			${vars}
		}
	`;
		console.log(vars);
		document.body.appendChild(el);
	}
};
