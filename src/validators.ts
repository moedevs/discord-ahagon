import { Command, CommandMap, HandlerOptions } from "../main";
import { arrayify } from "./utils";

/**
 * Validate the options passed into the handler factory
 * @param opts
 */
export const validateHandlerParams = <T>(opts: HandlerOptions<T>) => {
  if (!opts.prefix && !opts.prefixResolver) {
    throw new Error("Either a prefix or a prefixResolver must be defined in the handler options");
  }
};

export const validateUniqueCommand = (command: Command, commands: CommandMap) => {
  const names = arrayify(command.name);
  names.forEach((name) => {
    if (commands.has(name)) {
      throw new Error(
        `Tried adding a command with a name ${command.name} but a command of the same name already exists`,
      );
    }
  });
};
