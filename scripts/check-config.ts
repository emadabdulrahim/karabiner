import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseConfig, rulesAreCurrent } from "../config.js";
import { rules } from "../rules.js";

const target = resolve(process.argv[2] ?? "karabiner.json");

if (!existsSync(target)) {
  throw new Error(`Missing ${target}. Run pnpm build.`);
}

const config = parseConfig(readFileSync(target, "utf8"));

if (!rulesAreCurrent(config, rules)) {
  throw new Error("karabiner.json is stale. Run pnpm build.");
}

lintWithKarabiner(target);
console.log(`Config is current and contains ${rules.length} rules.`);

function lintWithKarabiner(path: string) {
  const cli =
    "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";

  if (!existsSync(cli)) {
    console.log("Karabiner CLI is unavailable; skipping native lint.");
    return;
  }

  const result = spawnSync(cli, ["--lint-complex-modifications", path], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Karabiner lint failed");
  }
}
