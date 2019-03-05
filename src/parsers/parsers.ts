import { Context } from '../../main'
import * as Discord from "discord.js";


function getBooleanFromString (text: any): undefined
function getBooleanFromString (text: string): boolean | undefined {
  text = text.trim()
  if (text === 'yes' || text === 'true' || text === 'on') return true
  if (text === 'no' || text === 'false' || text === 'off') return false
}

function getMemberFromString (text: any, context: Context): undefined
function getMemberFromString (text: string, context: Context): Discord.GuildMember | undefined {
  if (!text || typeof text !== 'string' || context.guild === undefined) return
  if (text.startsWith('<@') && text.endsWith('>')) {
    text = text.slice(2, -1)
    if (text.startsWith('!')) {
      text = text.slice(1)
    }
    return context.guild.members.get(text)
  } else {
    return context.guild.members.find(member => {
      return member.user.username.startsWith(text) || member.nickname.startsWith(text)
    })
  }
}

function getTextChannelFromString (text: any, context: Context): undefined
function getTextChannelFromString (text: string, context: Context): Discord.TextChannel | undefined {
  if (!text || typeof text !== 'string' || context.guild === undefined) return
  if (text.startsWith('<#') && text.endsWith('>')) {
    text = text.slice(2, -1)
    return context.guild.channels.get(text) as Discord.TextChannel | undefined
  } else {
    return context.guild.channels.find(channel => {
      return channel.name === text && channel instanceof Discord.TextChannel
    }) as Discord.TextChannel | undefined
  }
}

function getRoleFromString (text: any, context: Context): undefined
function getRoleFromString (text: string, context: Context): Discord.Role | undefined {
  if (!text || typeof text !== 'string' || context.guild === undefined) return
  if (text.startsWith('<@&') && text.endsWith('>')) {
    text = text.slice(3, -1)
    return context.guild.roles.get(text)
  } else {
    return context.guild.roles.find(role => {
      return role.name.startsWith(text)
    })
  }
}

function getEmojiFromString (text: any, context: Context): undefined
function getEmojiFromString (text: string, context: Context): Discord.Emoji | undefined {
  if (!text || typeof text !== 'string' || context.guild === undefined) return
  const regex = /<:[a-zA-Z0-9]+:([0-9]+)>/g
  const match = regex.exec(text)
  if (match != null) {
    text = match[1]
  }
  return context.guild.emojis.get(text)
}