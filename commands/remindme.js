const moment = require('moment');
module.exports = {
    name: 'remindme',
    description: 'Remind Date',
    execute(msg, args) {
        var scheduled = moment().format(args[0]);
        var delay = moment(scheduled).fromNow()
        console.log(delay)
        console.log(moment().format())
        console.log("delayysss")
        var offset = moment().utcOffset();
        var delay = moment().add(scheduled, moment().add(offset, 'minutes'));

        // for (let i = 0; i < 3; i++) {
        //     args.shift()
        // };
        console.log(offset);
        console.log('sendhelpmeeeee')
        console.log(delay);
        const message = args.join(' ');
        msg.channel.send(message, delay);
        // sendMessage(name, message, delay);
    },
};