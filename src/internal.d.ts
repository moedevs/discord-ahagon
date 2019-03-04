import { Message } from "discord.js";
import { Command, CtxCallback } from "../main";


export interface MessageContext {
  message: Message;
  handler: {
    before: CtxCallback[];
    after: CtxCallback[];
    commands: Command[];
  }
}
