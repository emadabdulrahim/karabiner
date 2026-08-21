import assert from "node:assert/strict";
import test from "node:test";
import {
  configuredRules,
  defaultConfig,
  rulesAreCurrent,
  withRules,
} from "../config.js";
import type { KarabinerConfig, KarabinerRule } from "../types.js";

const exampleRule: KarabinerRule = {
  description: "Example",
  manipulators: [
    {
      type: "basic",
      from: { key_code: "a" },
      to: [{ key_code: "b" }],
    },
  ],
};

test("withRules preserves settings owned by Karabiner", () => {
  const config: KarabinerConfig = {
    global: { show_in_menu_bar: false, check_for_updates_on_startup: true },
    profiles: [
      {
        name: "Default",
        selected: true,
        virtual_hid_keyboard: { keyboard_type_v2: "ansi" },
        complex_modifications: {
          parameters: { "basic.to_if_alone_timeout_milliseconds": 1000 },
          rules: [],
        },
      },
    ],
  };

  const updated = withRules(config, [exampleRule]);

  assert.deepEqual(updated.global, config.global);
  assert.deepEqual(updated.profiles[0]?.virtual_hid_keyboard, {
    keyboard_type_v2: "ansi",
  });
  assert.deepEqual(
    updated.profiles[0]?.complex_modifications?.parameters,
    config.profiles[0]?.complex_modifications?.parameters,
  );
  assert.deepEqual(configuredRules(updated), [exampleRule]);
  assert.equal(rulesAreCurrent(updated, [exampleRule]), true);
});

test("withRules creates the default profile when needed", () => {
  const updated = withRules({ profiles: [] }, [exampleRule]);
  assert.equal(updated.profiles[0]?.name, "Default");
  assert.deepEqual(configuredRules(updated), [exampleRule]);
});

test("defaultConfig is immediately usable", () => {
  assert.deepEqual(configuredRules(defaultConfig()), []);
});
