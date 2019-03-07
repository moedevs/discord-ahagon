import { Collection, Message } from "discord.js";
import { Command, CommandHandler, EffectCallback, HandlerOptions } from "../main";

type CommandMap = Collection<string, Command>;

export interface MessageContext {
  readonly message: Message;
  readonly opts: HandlerOptions;
  readonly effects: EffectCallback[];
  readonly commands: CommandMap;
  readonly commandHandler: CommandHandler;
}

export interface FindCommandOptions {
  readonly content: string;
  readonly commands: CommandMap;
  readonly prefix: string;
  readonly mentionPrefix: boolean;
}
