import { Command, Context, CtxCallback, HandlerOptions } from "../main";
import { flatMap, glob } from "./utils";
import { Client, Message } from "discord.js";
import { MessageContext } from "./internal";
import { validateHandlerParams } from "./validators";


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

/**
 * Handling incoming messages to run commands
 * @param ctx
 */
const handleMessage = ({ message, handler }: MessageContext) => {
  const [command] = message.content.trim().split(/\s+/);
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
  const tsRegex = /.*\.(js|ts)/;
  const jsRegex = /.*\.js/;

  const paths = await glob(opts.commandsDirectory, opts.checkTsFiles ? tsRegex : jsRegex);
  const commands = flatMap(extractFileCommands, paths);
  const _ctx = { before, after, commands };

  client.on("message", (message: Message) => handleMessage({ message, handler: _ctx }));

  return {
    commands,
    pre: (func: CtxCallback) => before.push(func),
    post: (func: CtxCallback) => after.push(func),
  };
};

