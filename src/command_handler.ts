import { Command, Context, CtxCallback, HandlerOptions } from "../main";
import { flatMap, glob } from "./utils";
import { Client, Message } from "discord.js";
import { MessageContext } from "./internal";
import { validateHandlerParams } from "./validators";

const TS_REGEX = /.*\.(js|ts)/;
const JS_REGEX = /.*\.js/;

/**
 * Gather an array of commands
 * @param obj
 */
const gatherCommands = (obj: Array<Command> | { [k: string]: Command }) => {
  if (Array.isArray(obj)) {
    return obj;
  }
  return Object.values(obj);
};

/**
 * Gather commands from a file, if a default exists, only grab the default
 * @param path
 */
const extractFileCommands = (path: string) => {
  const e = require(path);
  return gatherCommands('default' in e ? e.default : e);
};

const generateCommandMap = (commands: Command[]): Map<string, Command> => {
  return commands.reduce((map, command) => {
    const names = Array.from(command.name);
    names.forEach(name => map.set(name, command));
    return map;
  }, new Map<string, Command>());
};

/**
 * Handling incoming messages to run commands
 * @param ctx
 */
const handleMessage = ({ message, handler }: MessageContext) => {
  // it's possible that commands might need to be multiline, so we
  // specifically split on spaces and not \s
  const [command, ...args] = message.content.trim().split(/ +/);
};

/**
 * Factory function for creating handlers, returns a handler object
 * when its done globbing commands
 * @param client
 * @param opts
 */
export const createHandler = async (client: Client, opts: HandlerOptions) => {
  validateHandlerParams(opts);
  const before: CtxCallback[] = [];
  const after: CtxCallback[] = [];

  const paths = await glob(opts.commandsDirectory, opts.checkTsFiles ? TS_REGEX : JS_REGEX);
  const commandsList = flatMap(extractFileCommands, paths);
  const commands = generateCommandMap(commandsList);
  const _ctx = { before, after, commands };

  client.on("message", (message: Message) => handleMessage({ message, handler: _ctx }));

  return {
    commands,
    pre: (func: CtxCallback) => before.push(func),
    post: (func: CtxCallback) => after.push(func),
  };
};

