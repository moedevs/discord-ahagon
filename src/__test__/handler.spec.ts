import { createHandler, findCommand, handleMessage } from "../command_handler";
import { Client, Message } from "discord.js";
import { HandlerOptions } from "../../main";

const client = new Client();

const handler = createHandler(client, {
  commandsDirectory: __dirname + "/commands",
  prefix: "!",
  checkTsFiles: true
});

test('command globbing works', async (next) => {
  const handle = await handler;
  expect(handle.commands.size).toBe(4);
  next();
});

test('handle message working', async (next) => {
  const { commands } = await handler;
  const command = await handleMessage({
    opts: { prefix: "!" } as HandlerOptions,
    message: { content: "!test1" } as Message,
    before: [],
    after: [],
    handler: { commands: [] },
    commands
  });
  expect(command).toHaveProperty('name', 'test1');
  next();
});

test('find command working', async (next) => {
  const { commands } = await handler;
  const command = await findCommand({ content: "!test1 hello world", mentionPrefix: false, commands, prefix: "!" });
  expect(command).toBeDefined();
  expect(command).toHaveProperty("name", "test1");
  next();
});

test('detecting duplicate commands', async (next) => {
  createHandler(client, {
    prefix: ".",
    commandsDirectory: `${__dirname}/broken_commands`,
    checkTsFiles: true
  }).catch(e => {
    expect(e.message).toContain("Tried adding a command");
    next();
  });
});
