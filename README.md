# Karabiner configuration

A personal [Karabiner-Elements](https://karabiner-elements.pqrs.org/) setup built
around one idea: hold Caps Lock to enter a Hyper layer, then use short,
mnemonic key sequences.

The editable source is [`rules.ts`](./rules.ts). The generated
`karabiner.json` is kept in the repository because Karabiner reads it
directly, but the build preserves profile, device, and UI settings managed by
Karabiner itself.

## Everyday changes

Add or change an application in the `o` (Open) layer:

```ts
o: layer(
  "Open",
  apps({
    c: "ChatGPT",
    d: "Figma",
    v: "Visual Studio Code",
  }),
),
```

Add a regular key action:

```ts
h: key("left_arrow"),
```

Add a URL or Raycast command:

```ts
p: open("https://github.com/pulls"),
```

Add an input source:

```ts
e: inputSource("en", "English"),
a: inputSource("ar", "Arabic"),
```

These are direct shortcuts: hold Caps Lock and press `E` for English or `A`
for Arabic.

Then regenerate and verify:

```sh
pnpm build
pnpm check
```

`pnpm dev` watches the imported TypeScript files and rebuilds after edits.
`pnpm check:dependencies` reports apps and third-party Raycast extensions
referenced by the keymap but missing from the current Mac.

## Keymap shape

Caps Lock by itself remains Escape.
Hold Caps Lock by itself for 900 ms to display a cheat sheet of every named
layer and direct language shortcut.

| Keys            | Purpose                   |
| --------------- | ------------------------- |
| Hyper + O + key | Open applications         |
| Hyper + E       | Select English            |
| Hyper + A       | Select Arabic             |
| Hyper + W + key | Raycast window management |
| Hyper + S + key | System controls           |
| Hyper + R + key | Raycast commands          |
| Hyper + B + key | Browser destinations      |
| Hyper + C + key | Music controls            |
| Hyper + H/J/K/L | Arrow movement            |
| Hyper + U/I     | Page down/up              |

The Mode Designs keyboard rule swaps Command and Option and remaps Escape only
for devices with vendor ID `222`.

## Setup

Requirements:

- Karabiner-Elements
- Node.js 22.13 or newer
- pnpm 11
- Raycast for window-management and Raycast-specific bindings

```sh
git clone https://github.com/emadabdulrahim/karabiner.git
cd karabiner
pnpm install
pnpm build
```

Karabiner expects its config at `~/.config/karabiner`. Back up any existing
directory, then symlink this checkout:

```sh
mkdir -p ~/.config
ln -s "$PWD" ~/.config/karabiner
launchctl kickstart -k gui/`id -u`/org.pqrs.karabiner.karabiner_console_user_server
```

## Repository map

- `rules.ts` — the keymap; most changes belong here
- `utils.ts` — the small Hyper/layer/app/key/window authoring interface
- `config.ts` — preserves Karabiner-owned settings while replacing authored rules
- `scripts/` — build, verification, and dependency diagnostics
- `types.ts` — the compact local Karabiner types used by this configuration
- `AGENTS.md` — minimal instructions for coding agents

Do not hand-edit generated rules in `karabiner.json`. If it is stale, run
`pnpm build`. Automatic Karabiner backups are intentionally ignored.

## Provenance

Forked from [mxstbr/karabiner](https://github.com/mxstbr/karabiner), whose
TypeScript Hyper-layer generator inspired this setup. Licensed under the
[MIT License](./LICENSE.md).
