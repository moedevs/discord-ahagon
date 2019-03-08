import { Client, Collection, Message, PermissionResolvable } from "discord.js";

export type CommandMap = Collection<string, Command>;
export type Prefix = string | string[];
export type PrefixResolverFunc = <T>(ctx: Context<T>) => Promise<string> | string;
export type CheckFunc = <T>(ctx: Context<T>) => Promise<boolean> | boolean;
export type FailCallback = <T>(ctx: Context<T>, err: ParserError) => void;
export type EffectCallback = <T, K>(ctx: Context<T>) => (returnValue: K) => void;
export type CtxCallback = <T>(ctx: Context<T>) => void;

export interface HandlerOptions<T extends {}> {
  /**
   * The prefix or set of prefixes your bot
   * should always be respond to
   *
   */
  prefix?: Prefix;
  /**
   * Dynamic prefix resolver. Although promises
   * are allowed, you should probably be returning
   * synchronous values from your cache as it is
   * called on every command
   */
  prefixResolver?: PrefixResolverFunc;
  /**
   * Whether or not mentioning your bot
   * should trigger commands in addition
   * to your prefixes
   */
  mentionPrefix?: boolean;
  /**
   * The directory of folder containing
   * your commands
   */
  commandsDirectory: string;
  /**
   * The function to be running before and after
   * every command execution. For command-specific
   * effects, use the `useEffect` callback on
   * commands instead
   *
   * The post function will be passed in
   * whatever the `run` function returned
   *
   * @example
   * ```ts
   * useEffect: () => {
   *   console.log("this is running before the command")
   *   return () => {
   *     console.log("this is running after the command")
   *   }
   * }
   * ```
   *
   * @see The React's `useEffect`
   * @param callback
   */
  useEffect?: (callback: EffectCallback) => void;
  /**
   * Additional objects to be intersected onto the `ctx`
   * callback of functions for ease of use
   */
  ctx: T;
  /**
   * Whether or not `.ts` files are checked instead of `.js`
   *
   * This is useful if you're on typescript and using ts-node
   * instead of compiling to javascript
   */
  checkTsFiles?: boolean;
}

export interface CommandHandler {
  /**
   * The collection of all registered commands
   */
  commands: CommandMap;
}

export type Context<T> = {
  message: Message;
  client: Client;
  commandHandler: CommandHandler
} & T;

export interface Check {
  /**
   * The condition of the check
   */
  check: CheckFunc;
  /**
   * Called when the command condition fails
   */
  onFail: FailCallback;
}

export interface Argument {
  /**
   * The type of the command that determines
   * how the command will be parsed
   */
  type: ArgType;
  /**
   * The name the argument will appear under
   * in the run function
   */
  name: string;
  /**
   * Whether or not the argument is optional
   * optional arguments cannot be followed by
   * non-optional arguments
   */
  optional?: boolean;
  /**
   * Whether or not this argument is allowed to
   * be repeated multiple times
   *
   * Repeat args must be the last argument in the command (for now)
   *
   * @example
   * ```
   * !ban @whamer @panda @jake
   * ```
   */
  repeat?: boolean;
  /**
   * The series of checks the command should
   * be run against. Checks always short circuit
   * commands
   */
  checks?: Check[];
  /**
   * Called when an argument is not inputted
   * properly
   */
  onFail?: FailCallback;
  /**
   * Called when an argument is missing
   */
  onMissing?: CtxCallback;
}

export interface CommandPermission {
  needs: PermissionResolvable;
  onMissing: <T>(ctx: Context<T>) => void;
}

export interface ArgObject {
  [key: string]: any;
}

export interface Command {
  /**
   * name or name + aliases of the command
   */
  name: string | string[];
  /**
   * Arguments that the command will expect to run
   */
  args?: Argument[];
  /**
   * Permissions a user requires to be able to execute
   * the command
   */
  userPermissions?: CommandPermission | PermissionResolvable;
  /**
   * Permissions the bot needs to have to be able
   * to execute the command
   */
  clientPermissions?: CommandPermission | PermissionResolvable;
  /**
   * The execution of the command
   * @param ctx
   * @param args
   */
  run: <T>(ctx: Context<T>, args: ArgObject) => void;
}

export interface ParserOptions {
  prefix: Prefix;
  mentionPrefix: boolean;
  commands?: CommandMap;
}

export const enum ParserError {
  MISSING_ARG = "missing_arg"
}

export const enum ArgType {
  MEMBER_MENTION = "member_mention",
  MEMBER = "member",
  CHANNEL = "channel",
  ROLE = "role",
  MEMBER_NAME = "member_name",
  CHANNEL_NAME = "channel_name",
  ROLE_NAME = "role_name",
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
