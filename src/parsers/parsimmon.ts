import P from "parsimmon";
import { ArgType, ParserOptions } from "../../main";
import { ArgParsingLanguage } from "../internal";
import { arrayify } from "../utils";

export const USERS_PATTERN = /<@!?([0-9]+)>/;
export const CHANNELS_PATTERN = /<#([0-9]+)>/;
export const ROLES_PATTERN = /<@&([0-9]+)>/;

export const truthy = ["yes", "y", "true", "1", "on"];
export const falsy = ["no", "n", "false", "0", "off"];

export const createCommandParser = (opts: ParserOptions) => P.createLanguage({
  single_word: () => {
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
    return P.regex(USERS_PATTERN, 1)
      .mark()
      .desc(ArgType.MEMBER_MENTION);
  },
  [ArgType.CHANNEL_MENTION]: () => {
    return P.regex(CHANNELS_PATTERN, 1)
      .mark()
      .desc(ArgType.CHANNEL_MENTION);
  },
  [ArgType.ROLE_MENTION]: () => {
    return P.regex(ROLES_PATTERN, 1)
      .mark()
      .desc(ArgType.ROLE_MENTION);
  },
  [ArgType.CHANNEL]: (r: P.Language) => {
    return P.alt(r.channel_mention, r.single_word)
      .desc(ArgType.CHANNEL);
  },
  [ArgType.MEMBER]: (r: P.Language) => {
    return P.alt(r.member_mention, r.single_word)
      .desc(ArgType.MEMBER);
  },
  [ArgType.MEMBER_NAME]: (r: P.Language) => {
    return r.single_word.desc(ArgType.MEMBER_NAME);
  },
  [ArgType.ROLE_NAME]: (r: P.Language) => {
    return r.single_word.desc(ArgType.ROLE_NAME);
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
      : r.single_word;
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
