import assert from "node:assert/strict";
import test from "node:test";
import { rules } from "../rules.js";
import { apps, hyper, inputSource, key, layer } from "../utils.js";

test("the complete keymap keeps its structural invariants", () => {
  assert.equal(rules.length, 17);
  assert.equal(
    rules.reduce((count, rule) => count + rule.manipulators.length, 0),
    73,
  );
  assert.ok(
    rules.every((rule) =>
      rule.manipulators.every((manipulator) => manipulator.type === "basic"),
    ),
  );
});

test("hyper owns the Caps Lock and sublayer variable protocol", () => {
  const generated = hyper({
    o: layer("Open", { c: key("c") }),
  });

  assert.equal(generated[0]?.description, "Hyper Key (⌃⌥⇧⌘)");
  assert.deepEqual(generated[0]?.manipulators[0]?.to_if_alone, [
    { key_code: "escape" },
  ]);
  assert.deepEqual(generated[0]?.manipulators[0]?.to_delayed_action, {
    to_if_invoked: [
      {
        set_notification_message: {
          id: "hyper-layer",
          text: "HYPER\nO — Open",
        },
        conditions: [
          {
            type: "variable_if",
            name: "hyper",
            value: 1,
          },
        ],
      },
    ],
  });
  assert.deepEqual(generated[1]?.manipulators[1]?.conditions, [
    {
      type: "variable_if",
      name: "hyper_sublayer_o",
      value: 1,
    },
  ]);
  assert.deepEqual(generated[1]?.manipulators[0]?.to, [
    {
      set_variable: {
        name: "hyper_sublayer_o",
        value: 1,
      },
    },
  ]);
  assert.deepEqual(generated[1]?.manipulators[0]?.to_after_key_up, [
    {
      set_variable: {
        name: "hyper_sublayer_o",
        value: 0,
      },
    },
  ]);
});

test("apps turns a compact map into launch commands", () => {
  assert.deepEqual(apps({ c: "ChatGPT" }), {
    c: {
      description: "Open -a 'ChatGPT.app'",
      to: [{ shell_command: "open -a 'ChatGPT.app'" }],
    },
  });
});

test("inputSource selects one exact language", () => {
  assert.deepEqual(inputSource("ar", "Arabic"), {
    description: "Input source: Arabic",
    hint: "Arabic",
    to: [{ select_input_source: { language: "^ar$" } }],
  });

  const generated = hyper({ a: inputSource("ar", "Arabic") });
  assert.equal("hint" in (generated[1]?.manipulators[0] ?? {}), false);
});

test("Raycast layer exposes only supported commands", () => {
  const raycastLayer = rules.find(
    (rule) => rule.description === 'Hyper Key sublayer "r"',
  );
  const commands = Object.fromEntries(
    (raycastLayer?.manipulators.slice(1) ?? []).map((manipulator) => [
      manipulator.from.key_code,
      manipulator.to?.[0]?.shell_command,
    ]),
  );

  assert.deepEqual(commands, {
    l: "open raycast://extensions/thomas/color-picker/pick-color",
    c: "open raycast://extensions/raycast/raycast/open-camera",
    p: "open raycast://extensions/raycast/raycast/confetti",
    i: "open raycast-x://extensions/raycast/ai/ai-chat",
  });
});

test("all camera actions use the current deeplink", () => {
  const cameraCommands = rules.flatMap((rule) =>
    rule.manipulators.flatMap((manipulator) =>
      (manipulator.to ?? [])
        .map((event) => event.shell_command)
        .filter((command) => command?.includes("open-camera")),
    ),
  );

  assert.deepEqual(cameraCommands, [
    "open raycast://extensions/raycast/raycast/open-camera",
    "open raycast://extensions/raycast/raycast/open-camera",
  ]);
});
