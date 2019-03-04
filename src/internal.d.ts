import { Message } from "discord.js";
import { Command, CtxCallback } from "../main";

type CommandMap = Map<string, Command[]>

export interface MessageContext {
  message: Message;
  handler: {
    before: CtxCallback[];
    after: CtxCallback[];
    commands: CommandMap;
  }
}
