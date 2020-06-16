module.exports = {
    name: 'remind',
	description: 'Reminder',
    execute(msg, args) {
        var message = msg;
		try {
			
			// Variables
			var returntime;
			var timemeasure;
			msg = msg.content.split(' ');
			console.log('Message recieved from ' + message.author.id + ' at ' + Date.now().toString());

			// Sets the return time
			timemeasure = msg[1].substring((msg[1].length - 1), (msg[1].length))
			returntime = msg[1].substring(0, (msg[1].length - 1))

			// Based off the delimiter, sets the time
			switch (timemeasure) {
				case 's':
					returntime = returntime * 1000;
					break;

				case 'm':
					returntime = returntime * 1000 * 60;
					break;

				case 'h':
					returntime = returntime * 1000 * 60 * 60;
					break;

				case 'd':
					returntime = returntime * 1000 * 60 * 60 * 24;
					break;

				default:
					returntime = returntime * 1000;
					break;
			}

			// Returns the Message
			setTimeout(function () {
				// Removes the first 2 array items
				msg.shift();
				msg.shift();

				// Creates the message
				var context = msg.join();
				content = context.replace(/,/, ' ');
				message.reply(content);
				console.log('Message sent to ' + message.author.id + ' at ' + Date.now().toString());
			}, returntime)
		} catch (e) {
			message.reply("An error has occured, please make sure the command has a time delimiter and message");
			console.error(e.toString());
		}
    },
  };
  