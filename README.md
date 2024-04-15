# unstyle

One stylesheet to rule them all.

### NOT ready for use yet. Currently very early stages.

End goal is to have theme-agnostic stylesheets in a way thats much less limiting and restrictive as base16 is, and potentially make it extend to syntax highlighting as well (by far the weakest part of base16). To give a little taste,

Heres a color group:
```json
{
    "$schema": "../color-group.json",
    "id": "ui",
    "name": "UI",
    "variables": {
        "background": [],
        "background-dark": ["ui:background"],
        "background-light": ["ui:background"],
        "text": [],
        "selection": [],
        "border": [],
        "link": [],
        "link-visited": []
    }
}
```

Heres a stylesheet metadata:
```json
{
  "$schema": "../stylesheet.json",
  "id": "arch-wiki",
  "name": "Arch Wiki",
  "description": "Palette-Agnostic Arch Wiki Theme",
  "author": "Blusk",
  "variables": {
    "background": ["ui:background-dark"],
    "text": ["ui:text"],
    "selection": ["ui:selection"],
    "border": ["ui:border"],
    "link": ["ui:link"],
    "link-visited": ["ui:link-visited"],
  }
}
```

And here's a color palette:
```json
{
  "$schema": "./color-schema.json",
  "id": "catppuccin",
  "ui": {
    "background-dark": "#1e1e2e",
    "background": "#181825",
    "background-light": "#313244",
    "border": "#45475a",
    "selection": "#585b70",
    "text": "#cdd6f4"
  }
}
```
