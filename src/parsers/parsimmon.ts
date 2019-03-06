import P from "parsimmon";
import { ArgType, Argument, ParserOptions } from "../../main";

const USERS_PATTERN = /<@!?([0-9])+>/;
const CHANNELS_PATTERN = /<#[0-9]+>/;
const ROLES_PATTERN = /<@&[0-9]+>/;

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
      .map(Number)
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
  optional: true
}];

const lang = createCommandParser(input, { prefix: "!", mentionPrefix: true });
const muteParser = lang.parser;

const src = "<@12315412> mute 60";

const prefix: Argument = {
  type: ArgType.PREFIX,
  name: "prefix",
};

const parsers: ParserArgs[] = [prefix, ...input].map((arg) => {
  const parser = lang[arg.type];
  if (arg.repeat) {
    // repeat args are guaranteed to be one last
    return { arg, parser: repeatArg(parser) };
  }
  return { arg, parser: parser.skip(P.all) };
});

export interface ParserResult {
  name: string;
  status: "success" | "fail";
}

export interface ParserArgs {
  arg: Argument;
  parser: P.Parser<any>;
}

const genSuccessfulOptional = (obj: object) => ({
  ...obj,
  status: "success",
  value: ""
});

const genFailedOptional = (obj: object) => ({
  ...obj,
  status: "fail",
  value: ""
});

const parse = (text: string, [head, ...tail]: ParserArgs[]): Array<P.Result<any>> => {
  const parsed = head.parser.parse(text);

  if (!parsed.status) {
    return [];
  }

  const remainingText = text.slice(parsed.value.end.column);
  const out = { ...parsed.value, status: "success" };
  const hasMissingArgs = !remainingText && tail.length;

  if (hasMissingArgs) {
    const nextUnentered = tail.find((obj) => !obj.arg.optional);
    // all remaining args are optional
    if (!nextUnentered) {
      return [out, ...tail.map((obj) => genSuccessfulOptional(obj.arg))];
    }
    return [out, genFailedOptional(nextUnentered.arg)];
  }

  if (!remainingText) {
    return out;
  }
  return [out, ...parse(remainingText, tail)];
};

console.log(parse(src, parsers));
// console.log(head.parse(src));
