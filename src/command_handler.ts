import { Command, HandlerOptions } from "../main";
import { flatMap, glob } from "./utils";

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
 * Factory function for creating handlers, returns a promise
 * when its done globbing commands
 * @param opts
 */
export const createHandler = async (opts: HandlerOptions) => {
  const tsRegex = /.*\.(js|ts)/;
  const jsRegex = /.*\.js/;

  const paths = await glob(opts.commandsDirectory, opts.checkTsFiles ? tsRegex : jsRegex);
  const commands = flatMap(extractFileCommands, paths);
  return { commands };
};

