import { Command, Context } from '../../main'
import * as Discord from "discord.js";

const getMemberFromID = (text: string, ctx: Context): Discord.GuildMember | undefined => {
  if (!text || !ctx.message.guild) return
  return ctx.message.guild.members.get(text)
}

const getMemberFromName = (text: string, ctx: Context): Discord.GuildMember | undefined => {
  if (!ctx.message.guild) return
  return ctx.message.guild.members.find(member => {
    return member.user.username.startsWith(text) || member.nickname.startsWith(text)
  })
}

const getTextChannelFromID = (text: string, ctx: Context): Discord.TextChannel | undefined => {
  if (!ctx.message.guild) return
  return ctx.message.guild.channels.get(text) as Discord.TextChannel | undefined
}

const getTextChannelFromName = (text: string, ctx: Context): Discord.TextChannel | undefined => {
  if (!ctx.message.guild) return
  return ctx.message.guild.channels.find(channel => {
    return channel.name === text && channel instanceof Discord.TextChannel
  }) as Discord.TextChannel | undefined
}

const getRoleFromID = (text: string, ctx: Context): Discord.Role | undefined => {
  if (!ctx.message.guild) return
  return ctx.message.guild.roles.get(text)
}

const getRoleFromName = (text: string, ctx: Context): Discord.Role | undefined => {
  if (!ctx.message.guild) return
  return ctx.message.guild.roles.find(role => {
    return role.name.startsWith(text)
  })
}

const getEmojiFromString = (text: string, ctx: Context): Discord.Emoji | undefined => {
  if (!ctx.message.guild) return
  const regex = /<a?:[a-zA-Z0-9]+:([0-9]+)>/g
  const match = regex.exec(text)
  if (match != null) {
    text = match[1]
  }
  return ctx.message.guild.emojis.get(text)
}

const getCommandFromName = (commands: Discord.Collection<string, Command>, input: string) => commands.get(input);