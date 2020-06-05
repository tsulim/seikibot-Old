require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
});

const seikiDB = require('./config/DBConnection');
const calendarEvent = require('./models/calendarEvent');
// const MySQLStore = require('express-mysql-session')
// const db = require('./config/db');

const TOKEN = process.env.TOKEN;
const prefix = process.env.prefix;

bot.login(TOKEN);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
	bot.user.setActivity("your every move", { type: "WATCHING" });
	// Connects to MySQL database
	seikiDB.setUpDB(false); // To set up database with new tables set(True)
});

bot.on('message', msg => {
	if (msg.author.bot) return;

	if (msg.content.includes(bot.user.id)) {
        // Send acknowledgement message
        msg.channel.send("Hey! Who mentioned me")
    }

	if (!msg.content.startsWith(prefix)) return;

	const args = msg.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	console.info(`Called command: ${commandName}`);

	// if (!bot.commands.has(commandName)) return;
	if (commandName == 'create') {
		var eventArr = new Array();

        //Splitting message to get individual variables
        eventArr = msg.content.substring(8).split(", ");
    
        var name = args[0];
        var date = args[1];
        var start = args[2];
		var description = args[3];
		var channelid = msg.channel.id;
		
		if (description == undefined){
			description = "No Description"
		}

        //Regex Expressions    
    
        //var dateREG = new RegExp("\d\d-\d\d-\d\d\d\d");
        var dateREG = "/\d\d-\d\d-\d\d\d\d/";
        //var startdurationREG = new RegExp("\d\d:\d\d");
        var startdurationREG = "/\d\d:\d\d/";
    
        if (!/\d\d-\d\d-\d\d\d\d/.test(date) || !/\d\d:\d\d/.test(start)) {
          msg.channel.send("Please follow this date and time format \n Date : `` MM-DD-YYYY`` \n Start Time : ``HH:MM`` ");

        } else {
            msg.channel.send({
                embed: {
                color: 342145,
                author: {
                    name: "A new event has been created: " + name + "!",
        
                },
                title: "Event name",
                description: name,
                fields: [{
                    name: "Date",
                    value: date
                    },
                    {
                    name: "Start",
                    value: start
                    },
                    {
                    name: "Description",
                    value: description
                    }        
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: msg.author.avatarURL,
        
                }
                }
            });
    
            console.log("Event array: " + eventArr);

            calendarEvent.create({
                eventName: name,
                eventDate: date,
                eventStart: start,
				eventDescription: description,
				channelID: channelid,
			})
		};
	} else {
		try {
			bot.commands.get(commandName).execute(msg, args);
		} catch (error) {
			console.error(error);
			msg.reply('there was an error trying to execute that command!');
		}
	};
});
