[![CircleCI](https://circleci.com/gh/moedevs/discord-ahagon/tree/master.svg?style=svg)](https://circleci.com/gh/moedevs/discord-ahagon/tree/master)

# discord-ahagon

#### A zero bloat discord.js command framework. Not classy, but functional

Unlike almost every other command framework, discord-ahagon does not rely on the verbose
class syntax or `this` to implement commands. Allowing you to compose and reuse
similar traits of commands and use concise arrow functions as well as giving you the ability 
to hook into different parts of the command execution process.

##### Warning: This library is still a work in progress, anything can change at any time

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

## Examples

##### Important: These are currently planned features and are not all implemented yet

An extensive ban command
```javascript
const ban = {
  name: ["ban", "🔨", "bean"],
  description: "bans a naughty boye with a reason",
  category: "moderation",
  userPermissions: ["BAN_MEMBERS"],
  clientPermissions: ["BAN_MEMBERS"],
  args: [{
    name: "target",
    description: "Ban target",
    type: "member",
    checks: [{
      check: (ctx, member) => member.bannable,
      onFail: (ctx, member) => ctx.message.channel.send(`I cannot ban ${member.user.username}!`)
    }, {
      check: (ctx) => ctx.database.lookup(ctx.message.author.id).then(member => member.isModerator),
      onFail: (ctx) => ctx.message.channel.send(`You are not authorized to do this`)
    }],
  }, {
    name: "reason",
    description: "Optional ban reason",
    type: "text",
    optional: true
  }],
  effect: (ctx, args) => {
    const start = new Date();
    console.log(`${ctx.message.member} used ban`);
    return (bannedMember) => {
      const time = new Date() - start;
      console.log(`Banned ${bannedMember.user.username} in ${time}ms.`);
      analyticsLibrary.send(time, { command: ctx.command.name });
    }
  },
  run: (ctx, args) => args.target.ban(args.reason)
}

module.exports = { ban };
```

You can export the commands however you like, in an array, an object
or as default

###### "Don't call me by my last name... I tell you every time"

![](umiko.gif)

##### Made with <3 by the /r/NewGame community
