import { isDeepStrictEqual } from "node:util";
import type {
  KarabinerConfig,
  KarabinerProfile,
  KarabinerRule,
} from "./types.js";

export const DEFAULT_PROFILE_NAME = "Default";

export function parseConfig(json: string): KarabinerConfig {
  const value: unknown = JSON.parse(json);

  if (!isRecord(value) || !Array.isArray(value.profiles)) {
    throw new Error("karabiner.json must contain a profiles array");
  }

  return value as unknown as KarabinerConfig;
}

export function defaultConfig(): KarabinerConfig {
  return {
    global: { show_in_menu_bar: false },
    profiles: [
      {
        name: DEFAULT_PROFILE_NAME,
        selected: true,
        complex_modifications: { rules: [] },
      },
    ],
  };
}

/**
 * Replaces only the authored rules. Karabiner-owned profile and device settings
 * remain untouched.
 */
export function withRules(
  config: KarabinerConfig,
  rules: KarabinerRule[],
  profileName = DEFAULT_PROFILE_NAME,
): KarabinerConfig {
  const profileIndex = config.profiles.findIndex(
    (profile) => profile.name === profileName,
  );

  if (profileIndex === -1) {
    return {
      ...config,
      profiles: [...config.profiles, newProfile(profileName, rules)],
    };
  }

  return {
    ...config,
    profiles: config.profiles.map((profile, index) =>
      index === profileIndex
        ? {
            ...profile,
            complex_modifications: {
              ...profile.complex_modifications,
              rules,
            },
          }
        : profile,
    ),
  };
}

export function configuredRules(
  config: KarabinerConfig,
  profileName = DEFAULT_PROFILE_NAME,
): KarabinerRule[] | undefined {
  return config.profiles.find((profile) => profile.name === profileName)
    ?.complex_modifications?.rules;
}

export function rulesAreCurrent(
  config: KarabinerConfig,
  rules: KarabinerRule[],
  profileName = DEFAULT_PROFILE_NAME,
): boolean {
  return isDeepStrictEqual(configuredRules(config, profileName), rules);
}

function newProfile(name: string, rules: KarabinerRule[]): KarabinerProfile {
  return {
    name,
    selected: true,
    complex_modifications: { rules },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
