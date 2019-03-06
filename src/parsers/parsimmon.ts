import P from "parsimmon";
import { Argument } from "../../main";

export const enum ArgType {
  MEMBER_MENTION = "member_mention",
  PREFIX = "prefix",
  COMMAND = "command",
  CHANNEL_MENTION = "channel_mention",
  ROLE_MENTION = "role_mention",
  NUMBER = "number",
  STRING = "string",
  FLAG = "flag",
  WORD = "word",
  QUOTED_STRING = "quoted_string",
  TEXT = "text",
}

const USERS_PATTERN = /<@!?[0-9]+>/;
const CHANNELS_PATTERN = /<#[0-9]+>/;
const ROLES_PATTERN = /<@&[0-9]+>/;

const lexeme = <T>(parser: P.Parser<T>) => parser.skip(P.optWhitespace);

const repeatArg = <T>(parser: P.Parser<T>) => parser.sepBy(P.string(" "));

const createCommandParser = (args: Argument[]) => P.createLanguage({
  quote: () => P.string('"'),
  [ArgType.WORD]: () => P.letters.node("word"),
  [ArgType.FLAG]: () => P.alt(P.string("--"), P.string("-")).then(P.letters),
  [ArgType.MEMBER_MENTION]: () => P.regex(USERS_PATTERN).node("member_mention"),
  [ArgType.CHANNEL_MENTION]: () => P.regex(CHANNELS_PATTERN).node("channel_mention"),
  [ArgType.ROLE_MENTION]: () => P.regex(ROLES_PATTERN).node("role_mention"),
  [ArgType.NUMBER]: () => P.digits.map(Number).node("number"),
  [ArgType.STRING]: (r: P.Language) => P.alt(r.quoted_string, r.word),
  [ArgType.QUOTED_STRING]: (r: P.Language) =>
    r.quote
      .then(P.noneOf('"').many().tie())
      .skip(r.quote)
      .node("quoted_string"),
  [ArgType.TEXT]: () => P.all.node("text"),
  [ArgType.COMMAND]: () => P.regex(/(\w|\d)+/).node("command"),
  [ArgType.PREFIX]: () => P.string("!").node("prefix"),
  parser: (r) => {
    const parsers = args.map((arg) => {
      const parser = r[arg.type];
      if (arg.repeat) {
        // repeat args are guaranteed to be the last
        return repeatArg(parser);
      }
      return lexeme(parser);
    });
    return P.seq(...parsers);
  },
});

const alwaysArgs = [{
  type: ArgType.PREFIX,
  name: "prefix",
}, {
  type: ArgType.COMMAND,
  name: "command",
}];

const args: Argument[] = [{
  type: ArgType.NUMBER,
  name: "count",
}, {
  type: ArgType.NUMBER,
  name: "count",
  repeat: true,
}];

const muteParser = createCommandParser([...alwaysArgs, ...args]).parser;

const e = muteParser.tryParse("!mute 60 60 06 060 66 000650");

console.log(e);
