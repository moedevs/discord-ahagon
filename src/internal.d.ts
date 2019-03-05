import { Message } from "discord.js";
import { Command, CommandHandler, CtxCallback, HandlerOptions } from "../main";

type CommandMap = Map<string, Command>

export interface MessageContext {
  readonly message: Message;
  readonly opts: HandlerOptions;
  readonly before: CtxCallback[];
  readonly after: CtxCallback[];
  readonly commands: CommandMap;
  readonly commandHandler: CommandHandler;
}

export interface FindCommandOptions {
  readonly content: string;
  readonly commands: CommandMap;
  readonly prefix: string;
  readonly mentionPrefix: boolean;
}
