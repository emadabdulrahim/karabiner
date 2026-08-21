export type Letter =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type FunctionKey = `f${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24}`;

export type KeyCode =
  | Letter
  | Digit
  | FunctionKey
  | "caps_lock"
  | "left_control"
  | "left_shift"
  | "left_option"
  | "left_command"
  | "right_control"
  | "right_shift"
  | "right_option"
  | "right_command"
  | "fn"
  | "return_or_enter"
  | "escape"
  | "delete_or_backspace"
  | "delete_forward"
  | "grave_accent_and_tilde"
  | "spacebar"
  | "hyphen"
  | "equal_sign"
  | "semicolon"
  | "quote"
  | "comma"
  | "period"
  | "slash"
  | "backslash"
  | "tab"
  | "open_bracket"
  | "close_bracket"
  | "home"
  | "end"
  | "left_arrow"
  | "right_arrow"
  | "up_arrow"
  | "down_arrow"
  | "page_up"
  | "page_down"
  | "display_brightness_increment"
  | "display_brightness_decrement"
  | "volume_increment"
  | "volume_decrement"
  | "play_or_pause"
  | "fastforward"
  | "rewind"
  | "pause"
  | "scroll_lock";

export type Modifier =
  | "any"
  | "command"
  | "control"
  | "option"
  | "shift"
  | "left_command"
  | "left_control"
  | "left_option"
  | "left_shift"
  | "right_command"
  | "right_control"
  | "right_option"
  | "right_shift"
  | "fn";

export interface Condition {
  type: string;
  [key: string]: unknown;
}

export interface FromEvent {
  key_code: KeyCode;
  modifiers?: {
    optional?: Modifier[];
    mandatory?: Modifier[];
  };
}

export interface ToEvent {
  key_code?: KeyCode;
  modifiers?: Modifier[];
  shell_command?: string;
  set_variable?: {
    name: string;
    value: boolean | number | string;
  };
  [key: string]: unknown;
}

export interface Manipulator {
  type: "basic";
  description?: string;
  from: FromEvent;
  to?: ToEvent[];
  to_after_key_up?: ToEvent[];
  to_if_alone?: ToEvent[];
  conditions?: Condition[];
  parameters?: Record<string, number>;
}

export interface KarabinerRule {
  description: string;
  manipulators: Manipulator[];
}

export interface KarabinerProfile {
  name: string;
  selected?: boolean;
  complex_modifications?: {
    rules?: KarabinerRule[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KarabinerConfig {
  global?: Record<string, unknown>;
  profiles: KarabinerProfile[];
  [key: string]: unknown;
}
