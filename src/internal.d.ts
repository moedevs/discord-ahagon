import { Message } from "discord.js";
import { Parser } from "parsimmon";
import { ArgType, CommandHandler, CommandMap, EffectCallback, HandlerOptions, Prefix } from "../main";

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
  readonly prefix: Prefix;
  readonly mentionPrefix: boolean;
}

/**
 * Allows for typesafe indexing of the object created by
 * [[createCommandParser]]
 */
type ArgParsingLanguage = {
  [k in ArgType]: Parser<any>
};
