import * as P from "parsimmon";
import { ArgType, Argument, ParserOptions } from "../../main";
import { ArgParsingLanguage } from "../internal";
import { createCommandParser } from "./parsimmon";

export const repeatArg = <T>(parser: P.Parser<T>) => parser.sepBy(P.regex(/ +/));

export const lexeme = <T>(parser: P.Parser<T>) => P.optWhitespace.then(parser).skip(P.all);

/**
 * Prepares parsers from supplied arguments using extra options
 * @param args
 * @param lang
 */
export const processArguments = (lang: ArgParsingLanguage, args: Argument[]) => args.map((arg) => {
  const parser = lang[arg.type];
  if (arg.repeat) {
    // repeat args are guaranteed to be one last
    return { arg, parser: lexeme(repeatArg(parser)) };
  }
  return { arg, parser: lexeme(parser) };
});

export const genParser = (parserOptions: ParserOptions, args: Argument[]) =>
  processArguments(createCommandParser(parserOptions), args);

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
