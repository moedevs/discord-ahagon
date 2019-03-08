import { Collection } from "discord.js";
import { Success } from "parsimmon";
import { ArgType, Argument, Command, ParserOptions } from "../../main";
import { createCommandParser, parse, ParserSuccess, processArguments } from "../parsers/parsimmon";

const parserOptions = {
  prefix: ["!", "@", "uwu"], mentionPrefix: true, commands: new Collection<string, Command>([
    ["hello", {
      name: "hello", run: () => {
      }
    }]
  ])
};

const prefixAndCommand: Argument[] = [{
  type: ArgType.PREFIX,
  name: "prefix"
}, {
  type: ArgType.COMMAND,
  name: "command",
}];

describe("prefixes", () => {

});


describe("0 arguments", () => {
  it("passing with preset commands", () => {
    const lang = createCommandParser(prefixAndCommand, parserOptions);
    const parsers = processArguments(prefixAndCommand, lang);

    const src = "!hello";

    const out = parse(src, parsers);
    const [, command] = out;
    expect(command.status).toEqual("success");
    expect((command as Success<any>).value).toEqual("hello");
    expect(out).toHaveLength(2);
  });

  it("wrong command with strict command checking", () => {
    const lang = createCommandParser(prefixAndCommand, parserOptions);
    const parsers = processArguments(prefixAndCommand, lang);

    const src = "!asd";

    const out = parse(src, parsers);
    expect(out[1].status === "fail").toBeTruthy();
    expect(out).toHaveLength(2);
  });

  it("failing without preset commands", () => {
    const noPresetOptions: ParserOptions = { prefix: "!", mentionPrefix: true };
    const lang = createCommandParser(prefixAndCommand, noPresetOptions);
    const parsers = processArguments(prefixAndCommand, lang);

    const src = "!testing";

    const out = parse(src, parsers);
    const [, command] = out;
    expect(command.status === "success").toBeTruthy();
    expect((command as Success<any>).value).toEqual("testing");
    expect(out).toHaveLength(2);
  });
});
