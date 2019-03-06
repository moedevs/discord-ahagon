import { Client, Message, PermissionResolvable } from "discord.js";
import { ArgType } from "./src/parsers/parsimmon";
import { CommandMap } from "./src/internal";

export type PrefixResolverFunc = (ctx: Context) => Promise<string> | string;
export type CheckFunc = (ctx: Context) => Promise<boolean> | boolean;

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

export interface ArgCondition {
  check: CheckFunc;
  onFail: CtxCallback;
  onMissing: CtxCallback;
}

export interface Argument {
  type: ArgType;
  name: string;
  optional?: boolean;
  repeat?: boolean;
  checks?: ArgCondition[];
  check?: CheckFunc;
  onFail?: CtxCallback;
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

export type EffectCallback = (ctx: Context) => (ctx: Context) => void;

export type CtxCallback = (ctx: Context) => void;
