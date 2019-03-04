import { HandlerOptions } from "../main";

export const validateHandlerParams = (opts: HandlerOptions) => {
  if (!opts.prefix && !opts.prefixResolver) {
    throw new Error("Either a prefix or a prefixResolver must be defined in the handler options")
  }
};
