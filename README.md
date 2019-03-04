# Ahagon
A zero bloat discord.js command framework

##### Warning: This library is still work in progress, anything can change

## Getting started

Adding a command handler
```javascript
// src/index.js

const { createHandler } = require("ahagon");

const handler = createHandler({
  commandsDirectory: `${__dirname}/commands`,
  prefix: "!"
});
```

Adding commands
```javascript
// src/commands/util.js

const ping = {
  name: ["ping", "p"],
  run: ctx => ctx.message.reply("Pong!")
}

const avatar = {
  name: "avatar",
  run: ({ message }) => message.channel.send(message.author.avatarURL)
}

module.exports = { ping, avatar };
```

You can export the commands however you like, in an array, an object
or as default

###### "Don't call me by my last name... I tell you every time"

![](umiko.gif)

