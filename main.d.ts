import { Client, Message, PermissionResolvable } from "discord.js";

export type PrefixResolverFunc = (ctx: Context) => Promise<string> | string;

export interface HandlerOptions {
  prefix?: string;
  mentionPrefix?: boolean;
  prefixResolver?: PrefixResolverFunc;
  commandsDirectory: string;
  checkTsFiles?: boolean;
}

export interface CommandHandler {
  commands: Command[];
}

export interface Context {
  message: Message;
  client: Client;
  commandHandler: CommandHandler;
}

export interface ArgCondition {
  cond: (ctx: Context) => Promise<boolean> | boolean;
  onFail: (ctx: Context) => void;
  onEmpty: (ctx: Context) => void;
}

export interface Arg {
  type: string;
  name: string;
  conditions?: ArgCondition[];
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
  args?: Arg[];
  userPermissions?: CommandPermission;
  botPermissions?: CommandPermission;
  run: (ctx: Context, args: ArgObject) => void;
}

export interface ParserOptions {
  prefix: string;
  mentionPrefix: boolean;
}

export type CtxCallback = (ctx: Context) => void;
