import { createHandler } from "../command_handler";
import { Client } from "discord.js";

const client = new Client();

const handler = createHandler(client, {
  commandsDirectory: __dirname + "/commands",
  checkTsFiles: true
});

test('command globbing works', async (next) => {
  const handle = await handler;
  expect(await handle.commands).toHaveLength(4);
  next();
});

test('command globbing right amount', async (next) => {
  const handle = await handler;
  expect(await handle.commands).toHaveLength(4);
  next();
});
