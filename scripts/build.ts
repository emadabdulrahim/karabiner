import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { defaultConfig, parseConfig, withRules } from "../config.js";
import { rules } from "../rules.js";

const target = resolve(process.argv[2] ?? "karabiner.json");
const current = existsSync(target)
  ? parseConfig(readFileSync(target, "utf8"))
  : defaultConfig();
const next = withRules(current, rules);
const temporary = join(
  dirname(target),
  `.${basename(target)}.${process.pid}.tmp`,
);

writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`);
renameSync(temporary, target);
formatWithKarabiner(target);

console.log(`Updated ${target} with ${rules.length} rules.`);

function formatWithKarabiner(path: string) {
  const cli =
    "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";

  if (!existsSync(cli)) {
    return;
  }

  const result = spawnSync(cli, ["--format-json", path], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Karabiner could not format the config");
  }
}
