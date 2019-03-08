import { Collection, Emoji, GuildMember, Role, TextChannel } from "discord.js";
import { ArgType, Command, Context, HandlerOptions } from "../../main";
import { ParserReturn } from "./parser";

const getMemberFromID = <T>(ctx: Context<T>, text: string): GuildMember | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.members.get(text);
};

const getMemberFromName = <T>(ctx: Context<T>, text: string): GuildMember | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.members.find((member) => {
    return member.user.username.startsWith(text) || member.nickname.startsWith(text);
  });
};

const getTextChannelFromID = <T>(ctx: Context<T>, text: string): TextChannel | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.channels.get(text) as TextChannel | undefined;
};

const getTextChannelFromName = <T>(ctx: Context<T>, text: string): TextChannel | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.channels.find((channel) => {
    return channel.name === text && channel instanceof TextChannel;
  }) as TextChannel | undefined;
};

const getRoleFromID = <T>(ctx: Context<T>, text: string): Role | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.roles.get(text);
};

const getRoleFromName = <T>(ctx: Context<T>, text: string): Role | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  return ctx.message.guild.roles.find((role) => {
    return role.name.startsWith(text);
  });
};

const getEmojiFromString = <T>(ctx: Context<T>, text: string): Emoji | undefined => {
  if (!ctx.message.guild) {
    return;
  }
  const regex = /<a?:[a-zA-Z0-9]+:([0-9]+)>/g;
  const match = regex.exec(text);
  if (match) {
    text = match[1];
  }
  return ctx.message.guild.emojis.get(text);
};

const getCommandFromName = (commands: Collection<string, Command>, input: string) => commands.get(input);

const resolvers = new Collection<ArgType, <T>(ctx: Context<T>, text: string) => void>([
  [ArgType.MEMBER_MENTION, getMemberFromID],
  [ArgType.MEMBER, getMemberFromName]
]);

const resolveParseResults = <T>(results: ParserReturn[], opts: HandlerOptions<T>) => {

};
