import P from "parsimmon";
import { ArgType, Argument, ParserOptions } from "../../main";
import { ArgParsingLanguage } from "../internal";
import { arrayify } from "../utils";

const USERS_PATTERN = /<@!?([0-9])+>/;
const CHANNELS_PATTERN = /<#[0-9]+>/;
const ROLES_PATTERN = /<@&[0-9]+>/;

const repeatArg = <T>(parser: P.Parser<T>) => parser.sepBy(P.regex(/ +/));

const lexeme = <T>(parser: P.Parser<T>) => P.optWhitespace.then(parser).skip(P.all);

const truthy = ["yes", "true", "1", "on"];
const falsy = ["no", "false", "0", "off"];

export const createCommandParser = (args: Argument[], opts: ParserOptions) => P.createLanguage({
  singleWord: () => {
    return P.regexp(/(\w|\d)+/);
  },
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
      .mark()
      .desc(ArgType.BOOLEAN);
  },
  [ArgType.WORD]: () => {
    return P.letters
      .mark()
      .desc(ArgType.WORD);
  },
  [ArgType.FLAG]: () => {
    return P.alt(P.string("--"), P.string("-"))
      .then(P.letters)
      .desc(ArgType.FLAG);
  },
  [ArgType.MEMBER_MENTION]: () => {
    return P.regex(USERS_PATTERN)
      .mark()
      .desc(ArgType.MEMBER_MENTION);
  },
  [ArgType.CHANNEL_MENTION]: () => {
    return P.regex(CHANNELS_PATTERN)
      .mark()
      .desc(ArgType.CHANNEL_MENTION);
  },
  [ArgType.ROLE_MENTION]: () => {
    return P.regex(ROLES_PATTERN)
      .mark()
      .desc(ArgType.ROLE_MENTION);
  },
  [ArgType.NUMBER]: () => {
    return P.regex(/[0-9]+/)
      .map(Number)
      .mark()
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
      .mark()
      .desc(ArgType.QUOTED_STRING);
  },
  [ArgType.TEXT]: () => {
    return P.all
      .mark()
      .desc(ArgType.TEXT);
  },
  [ArgType.COMMAND]: (r: P.Language) => {
    const commandParser = opts.commands
      ? P.alt(...opts.commands.keyArray().map(P.string))
      : r.singleWord;
    return commandParser
      .mark()
      .desc(ArgType.COMMAND);
  },
  [ArgType.PREFIX]: (r: P.Language) => {
    const prefixes = arrayify(opts.prefix);
    const prefixParser = P.alt(...prefixes.map(P.string)).mark();
    const parser = P.alt(r.member_mention, prefixParser);
    return parser.desc(ArgType.PREFIX);
  },
}) as ArgParsingLanguage;

export const processArguments = (args: Argument[], lang: ArgParsingLanguage) => args.map((arg) => {
  const parser = lang[arg.type];
  if (arg.repeat) {
    // repeat args are guaranteed to be one last
    return { arg, parser: lexeme(repeatArg(parser)) };
  }
  return { arg, parser: lexeme(parser) };
});

export const enum ArgumentError {
  UNEXPECTED_ARGUMENT = "unexpected_argument",
  EXTRA_ARGUMENT = "extra_argument",
  MISSING_ARGUMENT = "missing_argument",
  UNKNOWN_COMMAND = "unknown_command"
}

export interface ParseError {
  readonly error: ArgumentError;
  readonly target?: string;
  readonly status: "success" | "fail";
}

export type ParserSuccess = P.Result<any>;

export type ParserReturn = ParseError | ParserSuccess;

export interface ParserArgs {
  arg: Argument;
  parser: P.Parser<any>;
}

export const parse = (text: string, [head, ...tail]: ParserArgs[]): ParserReturn[] => {
  const parsed = head.parser.parse(text);

  if (!parsed.status) {
    if (head.arg.name === ArgType.COMMAND) {
      // unknown command errors
      return [{ error: ArgumentError.UNKNOWN_COMMAND, status: "fail", target: text }];
    }

    // this isn't a very accurate result but it's definitely good enough
    const [erroredWord] = text.slice(parsed.index.column).split(/\s+/);
    return [{ error: ArgumentError.UNEXPECTED_ARGUMENT, status: "fail", target: erroredWord }];
  }

  let cursorPosition;
  let out;
  if (parsed.value.end) {
    cursorPosition = parsed.value.end.offset;
    out = { ...parsed.value, status: "success", arg: head.arg };
  } else if (Array.isArray(parsed.value)) {
    cursorPosition = Math.max(...parsed.value.map((item: any) => item.end.offset));
    out = { value: parsed.value, status: "success", arg: head.arg };
  } else {
    throw Error(`Unexpected parser output ${JSON.stringify(parsed.value)}`);
  }

  const remainingText = text.slice(cursorPosition);
  const hasMissingArgs = !remainingText && tail.length;
  const hasTooManyArgs = remainingText && !tail.length;
  const isFinished = !remainingText && !tail.length;

  if (hasMissingArgs) {
    const nextUnentered = tail.find((obj) => !obj.arg.optional);
    if (!nextUnentered) {
      // all remaining args are optional
      return [out, ...tail.map((obj) => ({ ...obj.arg, status: "success", value: "" }))];
    }
    return [out, {
      ...nextUnentered.arg,
      status: "fail",
      error: ArgumentError.MISSING_ARGUMENT,
      target: nextUnentered
    }];
  }

  if (hasTooManyArgs) {
    const [target] = remainingText.trim().split(/\s+/);
    return [out, { status: "fail", error: ArgumentError.EXTRA_ARGUMENT, target, arg: head.arg }];
  }

  if (isFinished) {
    return out;
  }

  return [out, ...parse(remainingText, tail)];
};

