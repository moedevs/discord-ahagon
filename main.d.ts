import { Client, Message, PermissionResolvable } from "discord.js";
import { CommandMap } from "./src/internal";

export type PrefixResolverFunc = (ctx: Context) => Promise<string> | string;
export type CheckFunc = (ctx: Context) => Promise<boolean> | boolean;
export type FailCallback = (ctx: Context, err: ParserError) => void;
export type EffectCallback = (ctx: Context) => (ctx: Context) => void;
export type CtxCallback = (ctx: Context) => void;

export interface HandlerOptions {
  prefix?: string;
  mentionPrefix?: boolean;
  prefixResolver?: PrefixResolverFunc;
  commandsDirectory: string;
  checkTsFiles?: boolean;
}

export interface CommandHandler {
  commands: CommandMap;
  useEffect?: (callback: EffectCallback) => void;
}

export interface Context {
  message: Message;
  client: Client;
  commandHandler: CommandHandler;
}

export interface Check {
  check: CheckFunc;
  onFail: FailCallback;
}

export interface Argument {
  type: ArgType;
  name: string;
  optional?: boolean;
  repeat?: boolean;
  checks?: Check[];
  onFail?: FailCallback;
  onMissing?: CtxCallback;
}

export interface CommandPermission {
  needs: PermissionResolvable;
  onMissing: (ctx: Context) => void;
}

export interface ArgObject {
  [key: string]: any;
}

export interface Command {
  name: string | string[];
  args?: Argument[];
  userPermissions?: CommandPermission;
  botPermissions?: CommandPermission;
  run: (ctx: Context, args: ArgObject) => void;
}

export interface ParserOptions {
  prefix: string;
  mentionPrefix: boolean;
}

export const enum ParserError {
  MISSING_ARG = "missing_arg"
}

export const enum ArgType {
  MEMBER_MENTION = "member_mention",
  BOOLEAN = "boolean",
  PREFIX = "prefix",
  COMMAND = "command",
  CHANNEL_MENTION = "channel_mention",
  ROLE_MENTION = "role_mention",
  NUMBER = "number",
  STRING = "string",
  FLAG = "flag",
  WORD = "word",
  QUOTED_STRING = "quoted_string",
  TEXT = "text",
}
