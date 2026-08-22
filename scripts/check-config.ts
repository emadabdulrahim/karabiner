import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseConfig, rulesAreCurrent } from "../config.js";
import { rules } from "../rules.js";
import type { KarabinerRule } from "../types.js";

const target = resolve(process.argv[2] ?? "karabiner.json");

if (!existsSync(target)) {
  throw new Error(`Missing ${target}. Run pnpm build.`);
}

const config = parseConfig(readFileSync(target, "utf8"));

if (!rulesAreCurrent(config, rules)) {
  throw new Error("karabiner.json is stale. Run pnpm build.");
}

lintWithKarabiner(rules);
console.log(`Config is current and contains ${rules.length} rules.`);

function lintWithKarabiner(currentRules: KarabinerRule[]) {
  const cli =
    "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";

  if (!existsSync(cli)) {
    console.log("Karabiner CLI is unavailable; skipping native lint.");
    return;
  }

  const lintDirectory = mkdtempSync(join(tmpdir(), "karabiner-lint-"));
  const lintTarget = join(lintDirectory, "rules.json");

  try {
    writeFileSync(
      lintTarget,
      `${JSON.stringify({ title: "Karabiner config verification", rules: currentRules })}\n`,
    );

    const result = spawnSync(
      cli,
      ["--lint-complex-modifications", lintTarget],
      { encoding: "utf8" },
    );

    if (result.status !== 0) {
      throw new Error(
        result.stderr || result.stdout || "Karabiner lint failed",
      );
    }
  } finally {
    rmSync(lintDirectory, { recursive: true, force: true });
  }
}
