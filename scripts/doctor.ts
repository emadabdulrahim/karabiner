import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { rules } from "../rules.js";

const shellCommands = rules.flatMap((rule) =>
  rule.manipulators.flatMap((manipulator) =>
    (manipulator.to ?? []).flatMap((event) =>
      event.shell_command ? [event.shell_command] : [],
    ),
  ),
);

const applications = unique(
  shellCommands.flatMap((command) => {
    const match = command.match(/open -a '(.+)\.app'/);
    return match?.[1] ? [match[1]] : [];
  }),
);

const raycastExtensions = unique(
  shellCommands.flatMap((command) => {
    const match = command.match(/raycast:\/\/extensions\/([^/]+)\/([^/]+)\//);
    return match?.[1] && match[2] && match[1] !== "raycast"
      ? [`${match[1]}/${match[2]}`]
      : [];
  }),
);

const installedExtensions = readRaycastExtensions();
const missingApps = applications.filter((name) => !applicationExists(name));
const missingExtensions = raycastExtensions.filter(
  (extension) => !installedExtensions.has(extension.toLowerCase()),
);

printGroup("Applications", applications, missingApps);
printGroup("Raycast extensions", raycastExtensions, missingExtensions);

const scriptCommands = unique(
  shellCommands.flatMap((command) => {
    const match = command.match(/raycast:\/\/script-commands\/([^\s]+)/);
    return match?.[1] ? [match[1]] : [];
  }),
);

if (scriptCommands.length > 0) {
  console.log("\nManual checks");
  for (const command of scriptCommands) {
    console.log(`  ? Raycast script command: ${command}`);
  }
}

if (missingApps.length + missingExtensions.length > 0) {
  console.log(
    "\nMissing dependencies do not fail verification; remove or install them as desired.",
  );
}

function applicationExists(name: string) {
  const app = `${name}.app`;
  return [
    "/Applications",
    "/System/Applications",
    "/System/Library/CoreServices",
    join(homedir(), "Applications"),
  ].some((directory) => existsSync(join(directory, app)));
}

function readRaycastExtensions() {
  const directory = join(homedir(), ".config/raycast/extensions");
  const extensions = new Set<string>();

  if (!existsSync(directory)) {
    return extensions;
  }

  for (const entry of readdirSync(directory)) {
    const manifest = join(directory, entry, "package.json");
    if (!existsSync(manifest)) continue;

    try {
      const value: unknown = JSON.parse(readFileSync(manifest, "utf8"));
      if (!isRecord(value)) continue;

      const author =
        typeof value.author === "string" ? value.author : undefined;
      const name = typeof value.name === "string" ? value.name : undefined;
      if (author && name) extensions.add(`${author}/${name}`.toLowerCase());
    } catch {
      // One broken extension should not hide the rest of the report.
    }
  }

  return extensions;
}

function printGroup(label: string, values: string[], missing: string[]) {
  console.log(label);
  for (const value of values) {
    const status = missing.includes(value) ? "missing" : "ok";
    console.log(`  ${status === "ok" ? "✓" : "✗"} ${value}`);
  }
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
