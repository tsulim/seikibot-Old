require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const moment = require('moment');

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
});

const seikiDB = require('./config/DBConnection');
const calendarEvent = require('./models/calendarEvent');
// const MySQLStore = require('express-mysql-session')
// const db = require('./config/db');

const TOKEN = process.env.TOKEN;
const prefix = process.env.prefix;

// Check calendarEvents
function CheckEvents(){
    // var today = new moment().format()
    console.log("Checking Reminders...");
    var currentDate = moment().format('YYYY-MM-DD')
    // today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    var currentTime = moment().format('HH:mm').split(':')
    var currentTimeMinutes = (60 * parseInt(currentTime[0])) + parseInt(currentTime[1]);

    var infoArray = [];

    calendarEvent.findAll({
        where: {
            eventDate: currentDate,
            status: "ongoing",
        }
    }).then((events) => {
        events.forEach(event => {
            infoArray[0] = event.eventName;
            infoArray[1] = event.eventDate;
            infoArray[2] = event.eventStart;
            infoArray[3] = event.channelID;
            infoArray[4] = event.serverID;

            eventStartMinutesArr = [];
            eventStartMinutesArr = infoArray[2].split(':');
            var eventStartMinutes = (60 * parseInt(eventStartMinutesArr[0])) + parseInt(eventStartMinutesArr[1]);
            console.log(eventStartMinutes)
            if ( (((eventStartMinutes - 720) == currentTimeMinutes) ||
                    ((eventStartMinutes - 60) == currentTimeMinutes) ||
                    ((eventStartMinutes - 30) == currentTimeMinutes) ||
                    ((eventStartMinutes - 10) == currentTimeMinutes)) &&
                currentDate == infoArray[1]) {
    
                console.log("reminder sent");
                SendReminder(infoArray[0], infoArray[1], infoArray[2], infoArray[3], (eventStartMinutes - currentTimeMinutes));
            } else if ((eventStartMinutes == currentTimeMinutes) &&
            currentDate == infoArray[1]) {
                calendarEvent.update({
                    status: "completed",
                });
                console.log("reminder sent");
                SendReminder(infoArray[0], infoArray[1], infoArray[2], infoArray[3], (eventStartMinutes - currentTimeMinutes));
            }
        });
    })
}

function SendReminder(eventName, eventDate, eventStart, channelID, MinutesToEvent){
    channel = bot.channels.find(channel => channel.id === channelID)
    channel.send({
        embed: {
            color: 342145,
            author: {
                name: "Reminder: " + eventName + " starts in : "+ MinutesToEvent +" minutes!",
            },
            title: eventName,
            fields: [{
                name: "Date",
                value: eventDate
                },
                {
                name: "Start",
                value: eventStart
                },
            ],
            timestamp: new Date(),
            footer: {
                icon_url: bot.avatarURL,

            }
        },
    });
}

setInterval(function() {
    CheckEvents();
}, 59000);

bot.login(TOKEN);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
	bot.user.setActivity("your every move", { type: "WATCHING" });
	// Connects to MySQL database
    seikiDB.setUpDB(false); // To set up database with new tables set(True)
});

bot.on('message', msg => {
    if (msg.author.bot) return;
    
    if (msg.channel.type === "dm") return;

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
    
        var name = args.slice(0,(args.length-2)).join(" ");
        var date = moment().format(args[args.length-2], 'YYYY-MM-DD');
        var start = args[args.length-1];
        var channelid = msg.channel.id;
        var serverid = msg.guild.id;

        //Regex Expressions    
    
        //var dateREG = new RegExp("\d\d-\d\d-\d\d\d\d");
        var dateREG = "/\d\d\d\d-\d\d-\d\d/";
        //var startdurationREG = new RegExp("\d\d:\d\d");
        var startdurationREG = "/\d\d:\d\d/";
        // moment(invalid, moment.ISO_8601).isValid()
        // !/\d\d-\d\d-\d\d\d\d/.test(date)

        if (!moment(date, moment.ISO_8601).isValid()|| !/\d\d:\d\d/.test(start)) {
          msg.channel.send("Please follow this date and time format \n Date : `` YYYY-MM-DD`` \n Start Time : ``HH:MM`` ");

        } else {
            var today = new Date();
            dateArray = date.split('-');
            var currentTime = moment().format('HH:mm').split(':');
            var currentTimeMinutes = (60 * parseInt(currentTime[0])) + parseInt(currentTime[1]);
            eventStartMinutesArr = start.split(':');
            var eventStartMinutes = (60 * parseInt(eventStartMinutesArr[0])) + parseInt(eventStartMinutesArr[1]);

            if (parseInt(dateArray[0]) < today.getFullYear()){
                msg.channel.send('Invalid date!');
            } else if (parseInt(dateArray[0]) == today.getFullYear() && parseInt(dateArray[1]) < (today.getMonth() + 1)) {
                msg.channel.send('Invalid date!');
            } else if ((parseInt(dateArray[1]) == (today.getMonth() + 1)) && parseInt(dateArray[2]) < today.getDate()) {
                msg.channel.send('Invalid date!');
            } else if ((parseInt(dateArray[2]) == today.getDate()) && currentTimeMinutes > eventStartMinutes) {
                msg.channel.send('Invalid time!');
            } else {
                msg.channel.send({
                    embed: {
                        color: 342145,
                        author: {
                            name: "A new event has been created: " + name + "!",
                
                        },
                        title: name,
                        fields: [{
                            name: "Date",
                            value: date
                            },
                            {
                            name: "Start",
                            value: start
                            },  
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
                    channelID: channelid,
                    serverID: serverid,
                    status: "ongoing",
                });
            };
		};
	} else if (commandName == 'listevent'){
        console.log(msg.guild.id);
        calendarEvent.findAll({
            where: {
                serverID: msg.guild.id,
                status: "ongoing",
            }
        }).then((events) => {
            let eventlist = [];
            events.forEach(event => {
                eventlist.push({
                    name: event.eventName,
                    value: event.eventDate,
                });
            });
            if (eventlist.length > 0){
                console.log(events != [])
                msg.channel.send({
                    embed: {
                        color: 342145,
                        title: "List of Events:",
                        fields: eventlist,
                        timestamp: new Date(),
                        footer: {
                            icon_url: bot.avatarURL,
                        }
                    },
                });
            } else {
                msg.channel.send('There are no events in this server!');
            }
        })
        .catch(err =>{
            console.log(err)
            msg.channel.send('There are no events in this server!')
        })
    } else {
		try {
			bot.commands.get(commandName).execute(msg, args);
		} catch (error) {
			console.error(error);
			msg.reply('there was an error trying to execute that command!');
		}
	};
});
