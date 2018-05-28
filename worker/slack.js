var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
	            'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

var req = require('request'),
    db = require('../model');

var channelLookupTable = {};

const getMessages = (slackChannelId, internalChannelId, ts) => {
	if(!slackChannelId) {
		console.log('Someone asked to get messages without specifying a channel!');
		return;
	}

	console.log('Getting messages starting at ' + (ts ? ts : 'the beginning'));

	let connString = `https://slack.com/api/groups.history?token=${token}&channel=${slackChannelId}`;
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
			                   timestamp: new Date(message.ts * 1000),
			                   channel: internalChannelId});
		});

		//Recurrsively call for more messages if we have not reached the end of the messages.
		if(channelHistory.has_more) {
			//Wait 750ms before hitting the slack API again so we won't get rate limited
			setTimeout(() => {getMessages(slackChannelId, internalChannelId, channelHistory.messages[channelHistory.messages.length-1].ts)}, 750);
		}
	});
};

const getChannel = (slackChannelId, cb) => {
	if(!slackChannelId) {
		console.log('Someone asked to get channel details without specifying a channel!');
		return;
	}

	console.log('Getting channel details for ' + slackChannelId);

	if(channelLookupTable[slackChannelId] === undefined) {
		let connString = `https://slack.com/api/groups.info?token=${token}&channel=${slackChannelId}`

		req(connString, (err, resp, body) => {
			if(err) {
				console.log(err);
				return;
			}

			let channelInfo = JSON.parse(resp.body);
			db.Channel.find({slack_id: channelInfo.group.id}, (err, channel) => {
				if(err) {
					console.log(err);
					return;
				}

				if(channel.length === 0) {
					db.Channel.create({slack_id: channelInfo.group.id, name: channelInfo.group.name}, (err, channel) => {
						if(err) {
							console.log(err);
							return;
						}
						channelLookupTable[channel.slack_id] = channel._id;
						cb(channelLookupTable[slackChannelId]);
					});
				} else {
					console.log('Already have details for ' + channelInfo.group.id);
					channelLookupTable[channel[0].slack_id] = channel[0]._id;
					cb(channelLookupTable[slackChannelId]);
				}
			});
		});
	} else {
		cb(channelLookupTable[slackChannelId]);
	}
};
