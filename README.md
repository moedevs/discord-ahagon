# discord-ahagon
A zero bloat discord.js command framework

##### Warning: This library is still work in progress, anything can change

## Helping out
Not a programmer? No problem, We would still love to get your input!


<a href="https://discord.gg/ZWW5CJw">
  <img width="250" src="https://i.imgur.com/GlEHVES.png"></img>
</a>

Most discussion will be in the `#tech-talk` channel.

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

##### Made with <3 by the /r/NewGame community
