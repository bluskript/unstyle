import { Glob, file, write, $ } from "bun";

const paletteBase = await file(
	"./src/assets/schemas/base/palette-base.json"
).json();
const colorGroupBase = await file(
	"./src/assets/schemas/base/color-group-base.json"
).json();
const stylesheetBase = await file(
	"./src/assets/schemas/base/stylesheet-base.json"
).json();

const glob = new Glob("./src/assets/color_groups/**/*.json");

const jsonFiles = await Promise.all(
	(await Array.fromAsync(glob.scan("."))).map((x) => file(x).json())
);
// Ensures that color palettes reference color group properties that exist
const colors = Object.fromEntries(
	jsonFiles.map((x) => [
		x.id,
		{
			type: "object",
			properties: Object.keys(x.variables).reduce<Record<string, any>>(
				(acc, curr) => {
					acc[curr] = {
						type: "string",
						format: "string",
					};
					return acc;
				},
				{}
			),
			additionalProperties: false,
		},
	])
);
// Ensures that any stylesheet written uses color group properties that exist
stylesheetBase.properties.variables.patternProperties = {
	"^.*$": {
		type: "array",
		items: {
			type: "string",
			enum: Object.keys(colors).flatMap((colorGroup) =>
				Object.keys(colors[colorGroup].properties).map(
					(x) => `${colorGroup}:${x}`
				)
			),
		},
	},
};
colorGroupBase.properties.variables.patternProperties =
	stylesheetBase.properties.variables.patternProperties;
paletteBase.properties.variables.properties = {
	...colors,
	...paletteBase.properties.variables.properties,
};
await $`rm -rf ./src/assets/schemas/out`;
await write(
	"./src/assets/schemas/out/color-group.json",
	JSON.stringify(colorGroupBase, undefined, 2)
);
await write("./src/assets/schemas/out/palette.json", JSON.stringify(paletteBase, undefined, 2));
await write(
	"./src/assets/schemas/out/stylesheet.json",
	JSON.stringify(stylesheetBase, undefined, 2)
);
