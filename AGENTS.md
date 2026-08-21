# Karabiner config

- Edit hotkeys in `rules.ts`; never hand-edit generated rules in `karabiner.json`.
- Use the small helpers in `utils.ts`: `layer`, `apps`, `inputSource`, `key`, `open`, and `window`.
- Run `pnpm build` after changes, then `pnpm check`.
- Preserve existing bindings unless the user explicitly asks to change them.
