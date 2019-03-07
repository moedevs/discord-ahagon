import { Client, Collection, Message } from "discord.js";
import { Command, CommandHandler, EffectCallback, HandlerOptions } from "../main";
import { FindCommandOptions, MessageContext } from "./internal";
import { arrayify, flatMap, glob } from "./utils";
import { validateHandlerParams, validateUniqueCommand } from "./validators";

export const TS_REGEX = /.*\.(js|ts)/;
export const JS_REGEX = /.*\.js/;

/**
 * Gather an array of commands
 * @param obj
 */
export const gatherCommands = (obj: Command[] | { [k: string]: Command }) => {
  if (Array.isArray(obj)) {
    return obj;
  }
  return Object.values(obj);
};

/**
 * Gather commands from a file, if a default exists, only grab the default
 * @param path
 */
export const extractFileCommands = (path: string) => {
  const e = require(path);
  return gatherCommands(e.default || e);
};

export const generateCommandMap = (commands: Command[]) => {
  return commands.reduce((map, command) => {
    validateUniqueCommand(command, map);
    const names = arrayify(command.name);
    names.forEach((name) => map.set(name, command));
    return map;
  }, new Collection<string, Command>());
};

export const findCommand = ({ content, commands, prefix, mentionPrefix }: FindCommandOptions) => {
  // it's possible that commands might need to be multiline, so we
  // specifically split on spaces and not \s
  const [firstWord] = content.trim().split(/ +/);

  const commandName = firstWord.slice(prefix.length);
  return commands.get(commandName);
};

/**
 * Handling incoming messages to run commands
 * @param _ctx
 */
export const handleMessage = async ({ opts, message, commandHandler, commands, effects }: MessageContext) => {
  const { prefix: _prefix, prefixResolver, mentionPrefix = false } = opts;
  const { content } = message;

  const ctx = { message, client: message.client, commandHandler };

  // one of these is guaranteed to be defined
  const prefix = _prefix || await prefixResolver!(ctx);
  return findCommand({ content, commands, prefix, mentionPrefix });
};

/**
 * Factory function for creating handlers, returns a handler object
 * when its done globbing commands
 * @param client
 * @param opts
 */
export const createHandler = async (client: Client, opts: HandlerOptions): Promise<CommandHandler> => {
  validateHandlerParams(opts);
  const effects: EffectCallback[] = [];

  const paths = await glob(opts.commandsDirectory, opts.checkTsFiles ? TS_REGEX : JS_REGEX);
  const commandsList = flatMap(extractFileCommands, paths);
  const commands = generateCommandMap(commandsList);

  const commandHandler = {
    commands,
    useEffect: (ctx: EffectCallback) => effects.push(ctx),
  };

  const _ctx = { effects, commands, commandHandler };

  client.on("message", (message: Message) => handleMessage({ message, opts, ..._ctx }));

  return commandHandler;
};
