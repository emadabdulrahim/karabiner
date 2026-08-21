import type { Condition, KarabinerRule } from "./types.js";
import { apps, hyper, inputSource, key, layer, open, window } from "./utils.js";

const modeDesignKeyboard: Condition = {
  type: "device_if",
  identifiers: [{ vendor_id: 222 }],
};

export const rules: KarabinerRule[] = [
  {
    description: "Switch left option -> cmd, and left cmd to left option",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "left_option",
          modifiers: { optional: ["any"] },
        },
        to: [{ key_code: "left_command" }],
        conditions: [modeDesignKeyboard],
      },
      {
        type: "basic",
        from: {
          key_code: "left_command",
          modifiers: { optional: ["any"] },
        },
        to: [{ key_code: "left_option" }],
        conditions: [modeDesignKeyboard],
      },
      {
        type: "basic",
        from: {
          key_code: "escape",
          modifiers: { optional: ["any"] },
        },
        to: [{ key_code: "grave_accent_and_tilde" }],
        conditions: [modeDesignKeyboard],
      },
      {
        type: "basic",
        from: {
          key_code: "right_option",
          modifiers: { optional: ["any"] },
        },
        to: [{ key_code: "right_command" }],
        conditions: [modeDesignKeyboard],
      },
    ],
  },

  ...hyper({
    spacebar: open(
      "raycast://extensions/stellate/mxstbr-commands/create-notion-todo",
    ),

    // Browse
    b: layer("Browse", {
      s: open("https://go/ship"),
      p: open("https://github.com/pulls"),
      r: open("https://github.com/pulls/review-requested"),
    }),

    // Open applications
    o: layer(
      "Open",
      apps({
        "1": "1Password",
        a: "Notion Calendar",
        g: "GitHub Desktop",
        c: "ChatGPT",
        d: "Figma",
        r: "Cursor",
        l: "Linear",
        v: "Visual Studio Code",
        s: "Slack",
        n: "Notion",
        t: "Ghostty",
        z: "zoom.us",
        m: "Messages",
        f: "Finder",
        p: "Spotify",
      }),
    ),

    // Input sources
    e: inputSource("en", "English"),
    a: inputSource("ar", "Arabic"),

    // Window management
    w: layer("Window", {
      semicolon: key("h", ["right_command"], "Window: Hide"),
      y: window("previous-display"),
      o: window("next-display"),
      k: window("top-half"),
      j: window("bottom-half"),
      h: window("left-half"),
      l: window("right-half"),
      f: window("maximize"),
      u: key("tab", ["right_control", "right_shift"], "Window: Previous Tab"),
      i: key("tab", ["right_control"], "Window: Next Tab"),
      n: key(
        "grave_accent_and_tilde",
        ["right_command"],
        "Window: Next Window",
      ),
      b: key("open_bracket", ["right_command"], "Window: Back"),
      m: key("close_bracket", ["right_command"], "Window: Forward"),
    }),

    // System
    s: layer("System", {
      u: key("volume_increment"),
      j: key("volume_decrement"),
      i: key("display_brightness_increment"),
      k: key("display_brightness_decrement"),
      y: key("pause"),
      h: key("scroll_lock"),
      l: key("q", ["right_control", "right_command"]),
      p: key("play_or_pause"),
      semicolon: key("fastforward"),
      e: open(
        "raycast://extensions/thomas/elgato-key-light/toggle?launchType=background",
      ),
      d: open(
        "raycast://extensions/yakitrak/do-not-disturb/toggle?launchType=background",
      ),
      t: open("raycast://extensions/raycast/system/toggle-system-appearance"),
      c: open("raycast://extensions/raycast/system/open-camera"),
      v: key("spacebar", ["left_option"]),
    }),

    // Movement
    h: key("left_arrow"),
    j: key("down_arrow"),
    k: key("up_arrow"),
    l: key("right_arrow"),
    u: key("page_down"),
    i: key("page_up"),

    // Music
    c: layer("Music", {
      p: key("play_or_pause"),
      n: key("fastforward"),
      b: key("rewind"),
    }),

    // Raycast
    r: layer("Raycast", {
      l: open("raycast://extensions/thomas/color-picker/pick-color"),
      c: open("raycast://extensions/raycast/system/open-camera"),
      n: open("raycast://script-commands/dismiss-notifications"),
      h: open("raycast://extensions/raycast/system/toggle-hidden-files"),
      e: open(
        "raycast://extensions/raycast/emoji-symbols/search-emoji-symbols",
      ),
      p: open("raycast://extensions/raycast/raycast/confetti"),
      i: open("raycast://extensions/raycast/raycast-ai/ai-chat"),
      s: open("raycast://extensions/peduarte/silent-mention/index"),
      "1": open(
        "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-1",
      ),
      "2": open(
        "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-2",
      ),
    }),
  }),
];
