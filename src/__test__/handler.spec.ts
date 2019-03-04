import { createHandler } from "../command_handler";

test('command globbing', async (next) => {
  const handler = await createHandler({
    commandsDirectory: __dirname + "/commands",
    checkTsFiles: true
  });
  console.log(handler);
  next();
});
