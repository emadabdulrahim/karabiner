import assert from "node:assert/strict";
import test from "node:test";
import { rules } from "../rules.js";
import { apps, hyper, key } from "../utils.js";

test("the complete keymap keeps its structural invariants", () => {
  assert.equal(rules.length, 15);
  assert.equal(
    rules.reduce((count, rule) => count + rule.manipulators.length, 0),
    76,
  );
  assert.ok(
    rules.every((rule) =>
      rule.manipulators.every((manipulator) => manipulator.type === "basic"),
    ),
  );
});

test("hyper owns the Caps Lock and sublayer variable protocol", () => {
  const generated = hyper({
    o: { c: key("c") },
  });

  assert.equal(generated[0]?.description, "Hyper Key (⌃⌥⇧⌘)");
  assert.deepEqual(generated[0]?.manipulators[0]?.to_if_alone, [
    { key_code: "escape" },
  ]);
  assert.deepEqual(generated[1]?.manipulators[1]?.conditions, [
    {
      type: "variable_if",
      name: "hyper_sublayer_o",
      value: 1,
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
