### Color scheme format

Inspired by base16, base24, and BaseNext:

- **16 base colors**, serve as a minimal definition of the color scheme. Got to start somewhere.
- **Arbitrary color variables**, giving the ability for infinite flexibility for stylesheets while ensuring it degrades gracefully in the event of less colors.
- **Color groups**, standardized variable definitions for maximizing compatibility:
  - ANSI colors `ansi:0`, `ansi:1`, `ansi:2`
  - Syntax highlighting `code:class_declaration`, `code:variable_definition`, `code:function_definition`
    - Follow tree_sitter definitions as a easy start?
- **Color inheritance**, each stylesheet gets their own specific color group, i.e. for `discord.com` it has its own `discord.com:` color group, where specific colors like `mic-unmute` can have fallbacks. Here are examples:
  - `"mic-unmute": ["messaging:unmute", "base08"]`
  - `"class_declaration": ["code:class_definition", "base09"]`

Definition format:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "$schema": {
      "type": "string",
      "format": "uri"
    },
    "base": {
      "type": "object",
      "properties": {
        "base00": { "type": "string" },
        "base01": { "type": "string" },
        "base02": { "type": "string" },
        "base03": { "type": "string" },
        "base04": { "type": "string" },
        "base05": { "type": "string" },
        "base06": { "type": "string" },
        "base07": { "type": "string" },
        "base08": { "type": "string" },
        "base09": { "type": "string" },
        "base0A": { "type": "string" },
        "base0B": { "type": "string" },
        "base0C": { "type": "string" },
        "base0D": { "type": "string" },
        "base0E": { "type": "string" },
        "base0F": { "type": "string" }
      },
      "required": [
        "base00",
        "base01",
        "base02",
        "base03",
        "base04",
        "base05",
        "base06",
        "base07",
        "base08",
        "base09",
        "base0A",
        "base0B",
        "base0C",
        "base0D",
        "base0E",
        "base0F"
      ],
      "additionalProperties": false
    },
    "ansi": {
      "type": "object",
      "patternProperties": {
        "^\\d+$": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "code": {
      "type": "object",
      "properties": {
        "class_declaration": { "type": "string" },
        "variable_definition": { "type": "string" },
        "function_definition": { "type": "string" }
      },
      "additionalProperties": {
        "type": "string"
      }
    },
    "patternProperties": {
      "^.+$": {
        "type": "object",
        "additionalProperties": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  },
  "required": ["base"],
  "additionalProperties": false
}
```
