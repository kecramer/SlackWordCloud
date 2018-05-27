var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
	            'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

var req = require('request'),
    db = require('../model');

const getMessages = (channel, ts) => {
	if(!channel) {
		console.log('Someone asked to get messages without specifying a channel!');
		return;
	}

	console.log('Getting messages starting at ' + (ts ? ts : 'the beginning'));

	let connString = `https://slack.com/api/groups.history?token=${token}&channel=${channel}`;
	if(ts) {
		connString += `&latest=${ts}`;
	}

	req(connString, (err, resp, body) => {
		if(err) {
			console.log(err);
			return;
		}

		var channelHistory = JSON.parse(resp.body);
		channelHistory.messages.forEach((message) => {
			//TODO: Import the remaining fields (channel and user) by referencing the other tables.
			db.Message.create({text: message.text,
			                   timestamp: new Date(message.ts * 1000)});
		});

		//Recurrsively call for more messages if we have not reached the end of the messages.
		if(channelHistory.has_more) {
			//Wait 750ms before hitting the slack API again so we won't get rate limited
			setTimeout(() => {getMessages(channel, channelHistory.messages[channelHistory.messages.length-1].ts)}, 750);
		}
	});
};
