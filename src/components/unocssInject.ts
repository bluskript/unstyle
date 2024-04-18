import {
	colorGroups,
	resolveTheme,
} from "~/entries/contentScript/primary/loadStyles";
import unstyleJson from "~/assets/websites/unstyle.json";
import { Stylesheet } from "~/assets/schemas/types/stylesheet";
import { Palette } from "~/assets/schemas/types/palette";

function hexToRgb(hex: string) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
		}
		: null;
}

/**
	* UnoCSS uses r,g,b, so get the theme, convert the hex values to rgb, and inject them to theme the menus
	**/
export const unocssInject = async (palette: Palette) => {
	const theme = resolveTheme(palette, unstyleJson as Stylesheet, colorGroups);
	const el = document.createElement("style");
	const vars = Object.entries(theme)
		.map(([name, value]) => {
			const { r, g, b } = hexToRgb(value!)!;
			return `--${name}: ${r}, ${g}, ${b};`
		})
		.join("\n");
	console.log(vars);
	el.textContent = `
		:root {
			${vars}
		}
	`;
	document.body.appendChild(el);
};
