import P from "parsimmon";
import { Argument, ParserOptions } from "../../main";

export const enum ArgType {
  MEMBER_MENTION = "member_mention",
  BOOLEAN = "boolean",
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

const USERS_PATTERN = /<@!?([0-9])+>/;
const CHANNELS_PATTERN = /<#[0-9]+>/;
const ROLES_PATTERN = /<@&[0-9]+>/;

const lexeme = <T>(parser: P.Parser<T>) => parser.skip(P.optWhitespace);

const repeatArg = <T>(parser: P.Parser<T>) => parser.sepBy(P.string(" "));

const truthy = ["yes", "true", "1", "on"];
const falsy = ["no", "false", "0", "off"];

const createCommandParser = (args: Argument[], opts: ParserOptions) => P.createLanguage({
  quote: () => {
    return P.string('"');
  },
  true: () => {
    return P.alt(...truthy.map(P.string))
      .result(true)
      .desc("true");
  },
  false: () => {
    return P.alt(...falsy.map(P.string))
      .result(false)
      .desc("false");
  },
  [ArgType.BOOLEAN]: (r: P.Language) => {
    return P.alt(r.true, r.false)
      .node("boolean")
      .desc(ArgType.BOOLEAN);
  },
  [ArgType.WORD]: () => {
    return P.letters
      .node("word")
      .desc(ArgType.WORD);
  },
  [ArgType.FLAG]: () => {
    return P.alt(P.string("--"), P.string("-"))
      .then(P.letters)
      .desc(ArgType.FLAG);
  },
  [ArgType.MEMBER_MENTION]: () => {
    return P.regex(USERS_PATTERN)
      .node("member_mention")
      .desc(ArgType.MEMBER_MENTION);
  },
  [ArgType.CHANNEL_MENTION]: () => {
    return P.regex(CHANNELS_PATTERN)
      .node("channel_mention")
      .desc(ArgType.CHANNEL_MENTION);
  },
  [ArgType.ROLE_MENTION]: () => {
    return P.regex(ROLES_PATTERN)
      .node("role_mention")
      .desc(ArgType.ROLE_MENTION);
  },
  [ArgType.NUMBER]: () => {
    return P.regex(/[0-9]+/)
      .node("number")
      .desc(ArgType.NUMBER);
  },
  [ArgType.STRING]: (r: P.Language) => {
    return P.alt(r.quoted_string, r.word)
      .desc(ArgType.STRING);
  },
  [ArgType.QUOTED_STRING]: (r: P.Language) => {
    return r.quote
      .then(P.noneOf('"').many().tie())
      .skip(r.quote)
      .node("quoted_string")
      .desc(ArgType.QUOTED_STRING);
  },
  [ArgType.TEXT]: () => {
    return P.all
      .node("text")
      .desc(ArgType.TEXT);
  },
  [ArgType.COMMAND]: () => {
    return P.regex(/(\w|\d)+/)
      .node("command")
      .desc(ArgType.COMMAND);
  },
  [ArgType.PREFIX]: (r: P.Language) => {
    const prefixParser = P.string(opts.prefix);
    const parser = opts.mentionPrefix
      ? P.alt(r.member_mention, prefixParser)
      : prefixParser;
    return parser.node("prefix").desc(ArgType.PREFIX);
  },
  parser: (r) => {
    const prefix: Argument = {
      type: ArgType.PREFIX,
      name: "prefix",
    };

    const parsers = [prefix, ...args].map((arg) => {
      const parser = r[arg.type];
      if (arg.repeat) {
        // repeat args are guaranteed to be the last
        return repeatArg(parser);
      }
      return lexeme(parser);
    });

    return P.seq(...parsers);
  }
});

const input: Argument[] = [{
  type: ArgType.COMMAND,
  name: "command",
}, {
  type: ArgType.NUMBER,
  name: "count",
}, {
  type: ArgType.BOOLEAN,
  name: "thing",
}];

const muteParser = createCommandParser(input, { prefix: "!", mentionPrefix: true }).prefix;

const src = "<@12315412>mute 60";
const e = muteParser.parse(src);
