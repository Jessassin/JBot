var Discord = require("discord.js")
var authconfig = require("./authconfig.js")

var bot = new Discord.Client();

var memuse = function() { return(Math.round(process.memoryUsage().rss / 1024 / 1000 * 100 ) / 100)};

var msgcount = 0
var statuschangecount = 0

require("console-stamp")(console, {
    pattern:"HH:MM:ss",
    label: false
});

bot.on("ready", function() {
  console.info("Bot ready")
  console.info("Logged into " + bot.channels.length + " channels")
  console.info("Tracking " + bot.users.length + " users")
  console.info("Using " + memuse() + "MB of RAM")
});

bot.on("disconnected", function() {
  console.log("Disconnected")
});

bot.on("message", function(msg) {
    msgcount++
    if(msg.channel.server) { //log server messages
      console.log("MSG: " + msg.channel.server.name + "|" + msg.channel.name + "|" + msg.author.username + " said: " + msg)
      //if(msg.content === "(╯°□°）╯︵ ┻━┻" && msg.author != bot.user) {
      //  console.log("tableflip detected, fixing")
      //  bot.sendMessage(msg.channel, "┬──┬ ノ( ゜-゜ノ)")
      //}
      //if(msg.content === "┬──┬ ノ( ゜-゜ノ)" && msg.author != bot.user) {
      //  console.log("tableflip detected, fixing")
      //  bot.sendMessage(msg.channel, "(╯°□°）╯︵ ┻━┻")
      //}
      if(msg.content[0] === ":" && msg.content[1] === ":") {
        var cmdtext = msg.content.split(":",3)[2]
        var cmd = cmdtext.split(" ",1)[0]
        console.log("Command issued!");
        console.log(cmdtext);
        console.log(cmd);
        //borrowed this via: https://github.com/stuff-from-ster/DiscordBot/commit/5d2d162434f49f12098878c5bf14753dc527baf8
        command = commands[cmd]
        if(command) {
          console.log("running command: " + command)
          if(!command.restricted || msg.sender.id == 108697134169067520) {
            command.action(bot, msg)
          } else {
            bot.sendMessage(msg.channel, "You do not have permission to run this command!")
          }
        } else {
          console.log("command not defined" + command)
        }
        if(cmd === "help") {
          lmsg = []
          for(var command in commands) {
            lmsg.push("```")
            var tcmd = "::" + command
            if(commands[command]["args"]) {
              var tcmd = tcmd + " " + commands[command]["args"]
            }
            lmsg.push(tcmd)
            lmsg.push(commands[command]["about"])
            lmsg.push("```")
          }
          bot.sendMessage(msg.channel, lmsg)
        }
      }
    } else { //log PMs
      console.log("PM: " + msg.author.id + "|" + msg.author.username + " said: " + msg)
    }
    if(msg.author == bot.user) {
      return
    }
    if(!msg.channel.server) {//server actions
      if(msg.content.search("https://discord.gg/") === 0  || msg.content.search("https://discordapp.com/invite/") === 0) {
        console.info(msg.author.username + " sent Discord.gg invite link. Attempting join")
        bot.joinServer(msg.content, function(error, server) {
          if(error || !server) {
            console.error("Join error: " + error);
            console.info("Server: " + server);
            bot.sendMessage(msg.channel,"Failed to join server! " + error)
          } else {
            console.info("Joined server: " + server.name + " via request by: " + msg.author.username )
            bot.sendMessage(msg.channel,"Joined server: " + server.name + " via your invite code")
          }
        });
      }
    }
});

bot.on("presence", function(data) {
  statuschangecount++
});

bot.login(authconfig.email, authconfig.password);

var commands = {
  "ping": {
    about: "Test response",
    action: function(bot, msg) {
      bot.sendMessage(msg.channel, "Pong!")
    }
  },
  "pong": {
    about: "Test response",
    action: function(bot, msg) {
      bot.sendMessage(msg.channel, "no")
    }
  },
  "flip": {
    about: "FFFFFFFlip table!",
    action: function(bot, msg) {
      bot.sendMessage(msg.channel, "(╯°□°）╯︵ ┻━┻")
    }
  },
  "unflip": {
    about: "Clean up the mess",
    action: function(bot, msg) {
      bot.sendMessage(msg.channel, "┬──┬ ノ( ゜-゜ノ)")
    }
  },
  "server": {
    about: "Replies with info about the server you are in",
    action: function(bot, msg) {
      bot.sendMessage(msg)
      lmsg = []
      lmsg.push("")
      lmsg.push("Server name: " + msg.channel.server +  " (ID: " + msg.channel.server.id + ")")
      lmsg.push("Server owner: " + msg.channel.server.owner.name +  " (ID: " + msg.channel.server.owner.id + ")")
      lmsg.push("Channel name: " + msg.channel + " (ID: " + msg.channel.id + ")")
      if(msg.channel.topic) {
        lmsg.push("Channel topic: ")
        lmsg.push(msg.channel.topic)
      } else { lmsg.push("Channel has no topic") }
      bot.sendMessage(msg.channel, lmsg)
    }
  },
  "about": {
    about: "Replies with info about the bot",
    action: function(bot, msg, about) {
      var lmsg = []
      lmsg.push("Logged into `" + bot.channels.length + "` channels")
      lmsg.push("Tracking `" + bot.users.length + "` users")
      lmsg.push("Using `" + memuse() + "mb` of RAM")
      lmsg.push("Status changes logged: `" + statuschangecount + "`")
      lmsg.push("Messages logged: `" + msgcount + "`")
      lmsg.push("Uptime: `" + (Math.round(bot.uptime / (1000 * 60 * 60))) + "h` `" + (Math.round(bot.uptime / (1000 * 60)) % 60) + "m` `" + (Math.round(bot.uptime / 1000) % 60) + "s`")
      lmsg.push("Github: `" + "https://github.com/Jessassin/JBot `")
      lmsg.push("Made with love, by `@jessassin` ID: 108697134169067520")
      bot.sendMessage(msg.channel, lmsg)
    }
  },
  "servers": {
    about: "List of connected servers",
    action: function(bot, msg) {
      var serverlist = bot.servers.toString().split(",")
      var lmsg = []
      lmsg.push("`JBot` is connected to the following servers: ")
      for(var i in serverlist) {
        lmsg.push("`" + serverlist[i] + "`")
      }
      bot.sendMessage(msg.channel, lmsg)
    }
  },
  "whois": {
    args: "<username or user ID>",
    about: "Provides information about specified user (WIP)",
    action: function(bot, msg) {
      var lmsg = []
      msg.mentions.map(function(user) {
        lmsg.push("\n**Username:** " + user.username)
        lmsg.push("**ID:** " + user.id)
        lmsg.push("**Status:** " + user.status)
        //lmsg.push("test")
        if(user.avatarURL) {
          lmsg.push("**Avatar:** " + user.avatarURL + "")
        } else {
          lmsg.push("**User has no avatar**")
        }

        bot.sendMessage(msg.channel, lmsg)
      })
    }
  }
  //new commands here
}
