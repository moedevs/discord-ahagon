import { Command } from "../main";

export const createCommand = (opts: Command): Command => ({
  ...opts,
});
