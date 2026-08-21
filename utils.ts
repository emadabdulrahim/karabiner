import type {
  Condition,
  KarabinerRule,
  KeyCode,
  Manipulator,
  Modifier,
  ToEvent,
} from "./types.js";

export interface LayerCommand {
  description?: string;
  to: ToEvent[];
}

type Sublayer = Partial<Record<KeyCode, LayerCommand>>;
type HyperLayer = Sublayer | LayerCommand;

const HYPER_VARIABLE = "hyper";

/**
 * Defines Caps Lock as Hyper and expands every nested layer into Karabiner rules.
 * This is the only module that owns the sublayer variable protocol.
 */
export function hyper(
  layers: Partial<Record<KeyCode, HyperLayer>>,
): KarabinerRule[] {
  const layerKeys = Object.keys(layers) as KeyCode[];
  const layerVariables = layerKeys.map(layerVariable);

  return [
    hyperKeyRule(),
    ...layerKeys.map((layerKey) => {
      const layer = layers[layerKey];

      if (!layer) {
        throw new Error(`Missing Hyper layer: ${layerKey}`);
      }

      return isCommand(layer)
        ? rootCommandRule(layerKey, layer, layerVariables)
        : sublayerRule(layerKey, layer, layerVariables);
    }),
  ];
}

/** Converts a compact key-to-app map into a Hyper sublayer. */
export function apps(bindings: Partial<Record<KeyCode, string>>): Sublayer {
  return Object.fromEntries(
    Object.entries(bindings).map(([keyCode, name]) => [keyCode, app(name)]),
  ) as Sublayer;
}

/** Opens a URL, deep link, file, or raw argument accepted by macOS `open`. */
export function open(...targets: string[]): LayerCommand {
  return {
    description: `Open ${targets.join(" & ")}`,
    to: targets.map((target) => ({ shell_command: `open ${target}` })),
  };
}

/** Opens a macOS application by display name. */
export function app(name: string): LayerCommand {
  return open(`-a '${name}.app'`);
}

/** Runs a key press, optionally with modifiers and a description. */
export function key(
  keyCode: KeyCode,
  modifiers?: Modifier[],
  description?: string,
): LayerCommand {
  return {
    ...(description ? { description } : {}),
    to: [
      {
        key_code: keyCode,
        ...(modifiers ? { modifiers } : {}),
      },
    ],
  };
}

/** Uses Raycast's built-in window management extension. */
export function window(position: string): LayerCommand {
  return {
    description: `Window: ${position}`,
    to: [
      {
        shell_command: `open -g raycast://extensions/raycast/window-management/${position}`,
      },
    ],
  };
}

function hyperKeyRule(): KarabinerRule {
  return {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key",
        type: "basic",
        from: {
          key_code: "caps_lock",
          modifiers: { optional: ["any"] },
        },
        to: [{ set_variable: { name: HYPER_VARIABLE, value: 1 } }],
        to_after_key_up: [{ set_variable: { name: HYPER_VARIABLE, value: 0 } }],
        to_if_alone: [{ key_code: "escape" }],
      },
    ],
  };
}

function rootCommandRule(
  keyCode: KeyCode,
  command: LayerCommand,
  layerVariables: string[],
): KarabinerRule {
  return {
    description: `Hyper Key + ${keyCode}`,
    manipulators: [
      commandManipulator(keyCode, command, [
        variableCondition(HYPER_VARIABLE, 1),
        ...layerVariables.map((name) => variableCondition(name, 0)),
      ]),
    ],
  };
}

function sublayerRule(
  layerKey: KeyCode,
  commands: Sublayer,
  layerVariables: string[],
): KarabinerRule {
  const activeVariable = layerVariable(layerKey);

  return {
    description: `Hyper Key sublayer "${layerKey}"`,
    manipulators: [
      {
        description: `Toggle Hyper sublayer ${layerKey}`,
        type: "basic",
        from: {
          key_code: layerKey,
          modifiers: { optional: ["any"] },
        },
        to: [{ set_variable: { name: activeVariable, value: 1 } }],
        to_after_key_up: [{ set_variable: { name: activeVariable, value: 0 } }],
        conditions: [
          ...layerVariables
            .filter((name) => name !== activeVariable)
            .map((name) => variableCondition(name, 0)),
          variableCondition(HYPER_VARIABLE, 1),
        ],
      },
      ...Object.entries(commands).map(([keyCode, command]) =>
        commandManipulator(keyCode as KeyCode, command, [
          variableCondition(activeVariable, 1),
        ]),
      ),
    ],
  };
}

function commandManipulator(
  keyCode: KeyCode,
  command: LayerCommand,
  conditions: Condition[],
): Manipulator {
  return {
    ...command,
    type: "basic",
    from: {
      key_code: keyCode,
      modifiers: { optional: ["any"] },
    },
    conditions,
  };
}

function variableCondition(name: string, value: number) {
  return {
    type: "variable_if",
    name,
    value,
  } as const;
}

function layerVariable(keyCode: KeyCode) {
  return `hyper_sublayer_${keyCode}`;
}

function isCommand(layer: HyperLayer): layer is LayerCommand {
  return "to" in layer;
}
