import { Collection } from "discord.js";
import { Success } from "parsimmon";
import { ArgType, Argument, Command, ParserOptions } from "../../main";
import { genParser, parse } from "../parsers/parser";

const parserOptions = {
  prefix: ["!", "@", "uwu"], mentionPrefix: true, commands: new Collection<string, Command>([
    ["test", {
      name: "hello", run: () => {
      }
    }]
  ])
};

const singlePrefixOptions = {
  ...parserOptions,
  prefix: "!"
};

const noCommandsParserOptions = { prefix: ["!", "@", "uwu"], mentionPrefix: true };

const prefixAndCommand: Argument[] = [{
  type: ArgType.PREFIX,
  name: "prefix"
}, {
  type: ArgType.COMMAND,
  name: "command",
}];
const parsers = genParser(parserOptions, prefixAndCommand);

describe("prefixes", () => {
  it("works with single prefixes", () => {
    const singlePArgs = genParser(singlePrefixOptions, prefixAndCommand);
    const out = parse("!help", singlePArgs);
    const [prefix] = out;

    expect(prefix.status).toEqual("success");
    expect((prefix as Success<any>).value).toEqual("!");
  });

  it("works with an array of prefixes", () => {
    const out = parse("uwu help", parsers);
    const [prefix] = out;

    expect(prefix.status).toEqual("success");
    expect((prefix as Success<any>).value).toEqual("uwu");
  });

  it("works with mentions and extracts id", () => {
    const id = "140862798832861184";

    const out = parse("<@140862798832861184>help", parsers);
    const [prefix] = out;

    expect(prefix.status).toEqual("success");
    expect((prefix as Success<any>).value).toEqual(id);
  });
});

describe("with no arguments", () => {
  it("passing with preset commands", () => {
    const out = parse("!test", parsers);
    const [, command] = out;

    expect(command.status).toEqual("success");
    expect((command as Success<any>).value).toEqual("test");
  });

  it("wrong command with strict command checking", () => {
    const src = "!asd";

    const out = parse(src, parsers);
    expect(out[1].status === "fail").toBeTruthy();
  });

  it("failing without preset commands", () => {
    const noPresetOptions: ParserOptions = { prefix: "!", mentionPrefix: true };
    const parser = genParser(noPresetOptions, prefixAndCommand);
    const commandName = "testing";

    const out = parse(`!${commandName}`, parser);
    const [, command] = out;
    expect(command.status === "success").toBeTruthy();
    expect((command as Success<any>).value).toEqual(commandName);
  });
});

describe("with arguments", () => {
  it("labeling args", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.NUMBER,
      name: "number"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const one = 10;
    const out = parse(`!test ${one}`, parser);
    expect((out[2] as any).arg.name).toEqual("number");
  });

  it("repeat args:numbers", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.NUMBER,
      name: "number",
      repeat: true
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const one = 10;
    const out = parse(`!test ${one}`, parser);
    expect((out[2] as any).arg.name).toEqual("number");
  });

  it("repeat args:quoted strings", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.QUOTED_STRING,
      name: "number",
      repeat: true
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const one = "this quoted string business works";
    const two = "what's up chief";
    const out = parse(`!test "${one}" "${two}"`, parser);
    expect((out[2] as any).value[0].value).toEqual(one);
    expect((out[2] as any).value[1].value).toEqual(two);
  });
});

describe("arg types", () => {
  it("numbers", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.NUMBER,
      name: "one"
    }, {
      type: ArgType.NUMBER,
      name: "two"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const one = 10;
    const two = 15;
    const out = parse(`!add ${one} ${two}`, parser);

    expect((out[2] as Success<any>).value).toEqual(one);
    expect((out[3] as Success<any>).value).toEqual(two);
  });

  it("quoted strings", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.QUOTED_STRING,
      name: "one"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const one = 10;
    const two = 15;
    const out = parse(`!add "${one} ${two}"`, parser);
    expect((out[2] as Success<any>).value).toEqual(`${one} ${two}`);
  });

  it("truthy booleans", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.BOOLEAN,
      name: "one"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const out = parse(`!add yes`, parser);
    expect((out[2] as Success<any>).value).toEqual(true);
  });

  it("falsy booleans", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.BOOLEAN,
      name: "one"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const out = parse(`!add no`, parser);
    expect((out[2] as Success<any>).value).toEqual(false);
  });

  it("channel mentions", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.CHANNEL_MENTION,
      name: "test"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const id = "365561999532228608";
    const out = parse(`!test <#${id}>`, parser);
    expect((out[2] as any).value).toEqual(id);
  });
  it("parses member mentions", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.MEMBER_MENTION,
      name: "test"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const id = "365561999532228608";
    const out = parse(`!test <@${id}>`, parser);
    expect((out[2] as any).value).toEqual(id);
  });
  it("parses member role mentions", () => {
    const args: Argument[] = [...prefixAndCommand, {
      type: ArgType.ROLE_MENTION,
      name: "test"
    }];

    const parser = genParser(noCommandsParserOptions, args);
    const id = "365561999532228608";
    const out = parse(`!test <@&${id}>`, parser);
    expect((out[2] as any).value).toEqual(id);
  });
});
