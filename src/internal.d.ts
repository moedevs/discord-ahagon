import { Message } from "discord.js";
import { Command, CtxCallback, Handler, HandlerOptions } from "../main";

type CommandMap = Map<string, Command>

export interface MessageContext {
  readonly message: Message;
  readonly opts: HandlerOptions;
  readonly before: CtxCallback[];
  readonly after: CtxCallback[];
  readonly commands: CommandMap;
  readonly handler: Handler;
}

export interface FindCommandOptions {
  readonly content: string;
  readonly commands: CommandMap;
  readonly prefix: string;
  readonly mentionPrefix: boolean;
}
