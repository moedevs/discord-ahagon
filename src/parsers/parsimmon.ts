import P from "parsimmon";
import { MessageMentions } from "discord.js";

export const enum ParserType {
  MEMBER_MENTION = "member_mention",
  MEMBER = "member",
  PREFIX = "prefix",
  COMMAND = "command",
  CHANNEL_MENTION = "channel_mention",
  ROLE_MENTION = "role_mention",
  NUMBER = "number",
  STRING = "string",
  FLAG = "flag",
  WORD = "word",
  QUOTED_STRING = "quoted_string",
  TEXT = "text"
}

const USERS_PATTERN = /<@!?[0-9]+>/;
const CHANNELS_PATTERN = /<#[0-9]+>/;
const ROLES_PATTERN = /<@&[0-9]+>/;

const lexeme = <T>(parser: P.Parser<T>) => parser.skip(P.optWhitespace);

const createCommandParser = (options: ParserType[]) => P.createLanguage({
  quote: () => P.string('"'),
  [ParserType.WORD]: () => P.letters.node("word"),
  [ParserType.FLAG]: () => P.string("--").then(P.letters),
  [ParserType.MEMBER_MENTION]: () => P.regex(USERS_PATTERN).node("member_mention"),
  [ParserType.CHANNEL_MENTION]: () => P.regex(CHANNELS_PATTERN).node("channel_mention"),
  [ParserType.ROLE_MENTION]: () => P.regex(ROLES_PATTERN).node("role_mention"),
  [ParserType.NUMBER]: () => P.digits.map(Number).node('number'),
  [ParserType.STRING]: (r: P.Language) => P.alt(r.quoted_string, r.word),
  [ParserType.QUOTED_STRING]: (r: P.Language) =>
    r.quote
      .then(P.noneOf('"').many().tie())
      .skip(r.quote)
      .node("quoted_string"),
  [ParserType.TEXT]: () => P.all.node("text"),
  [ParserType.COMMAND]: () => P.regex(/(\w|\d)+/).node("command"),
  [ParserType.PREFIX]: () => P.string("!").node("prefix"),
  // parser: r => P.seq(...options.map(option => lexeme(r[option])))
  parser: r => P.seq(lexeme(r.prefix), lexeme(r.command), r.number.sepBy(P.string(" ")))
});

const alwaysArgs = [
  ParserType.PREFIX,
  ParserType.COMMAND
];

const args = [
  ParserType.NUMBER,
];

const muteParser = createCommandParser([...alwaysArgs, ...args]).parser;

const e = muteParser.tryParse('!mute 60 60 06 060 66 000650');

console.log(e);
