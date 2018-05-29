var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
	            'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

var req = require('request'),
    db = require('../model');

var channelLookupTable = {},
    userLookupTable = {};

const getMessages = (slackChannelId, internalChannelId, ts, cb) => {
	if(!slackChannelId) {
		console.log('Someone asked to get messages without specifying a channel!');
		return;
	}

	console.log('Getting messages starting at ' + (ts ? JSON.stringify(ts) : 'the beginning'));

	let connString = `https://slack.com/api/groups.history?token=${token}&channel=${slackChannelId}`;
	if(ts && ts.latest) {
		connString += `&latest=${ts.latest}`;
	} else if (ts && ts.oldest) {
		connString += `&oldest=${ts.oldest}`;
	}

	req(connString, (err, resp, body) => {
		if(err) {
			console.log(err);
			return;
		}

		var channelHistory = JSON.parse(resp.body);
		channelHistory.messages.forEach((message) => {
			let user = '';
			if(message.subtype === 'bot_message') {
				return;
			} else if(message.subtype === 'file_comment') {
				user = message.file.user;
			} else {
				user = message.user;
			}

			db.Message.create({text: message.text,
			                   timestamp: new Date(message.ts * 1000),
			                   channel: internalChannelId,
			                   user: userLookupTable[user]._id});
		});

		//Recurrsively call for more messages if we have not reached the end of the messages.
		if(channelHistory.has_more) {
			//Wait 750ms before hitting the slack API again so we won't get rate limited
			setTimeout(() => {getMessages(slackChannelId, internalChannelId, {latest: channelHistory.messages[channelHistory.messages.length-1].ts}, cb)}, 750);
		} else {
			if (cb) { cb(); }
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
					db.Channel.create({slack_id: channelInfo.group.id, name: channelInfo.group.name, member_ids: channelInfo.group.members}, (err, channel) => {
						if(err) {
							console.log(err);
							return;
						}
						channelLookupTable[channel.slack_id] = channel;
						if(cb) { cb(channelLookupTable[slackChannelId]); }
					});
				} else {
					console.log('Already have details for ' + channelInfo.group.id);
					channelLookupTable[channel[0].slack_id] = channel[0];
					if(cb) { cb(channelLookupTable[slackChannelId]); }
				}
			});
		});
	} else {
		if(cb) { cb(channelLookupTable[slackChannelId]); }
	}
};

const getUser = (slackUserId, cb) => {
	if(!slackUserId) {
		console.log('Someone asked to get user details without specifying a user!');
		return;
	}

	console.log('Getting user details for ' + slackUserId);

	if(userLookupTable[slackUserId] === undefined) {
		let connString = `https://slack.com/api/users.info?token=${token}&user=${slackUserId}`;

		req(connString, (err, resp, body) => {
			if(err) {
				console.log(err);
				return;
			}

			let userInfo = JSON.parse(resp.body);
			if(!userInfo.user) {
				console.log('That user was not found or not available to inspect!');
				return;
			}

			db.User.find({slack_id: slackUserId}, (err, user) => {
				if(err) {
					console.log(err);
					return;
				}

				if(user.length === 0) {
					db.User.create({slack_id: userInfo.user.id, name: userInfo.user.real_name, handle: userInfo.user.name}, (err, user) => {
						if(err) {
							console.log(err);
							return;
						}

						userLookupTable[user.slack_id] = user;
						if(cb) { cb(userLookupTable[slackUserId]); }
					})
				} else {
					userLookupTable[user[0].slack_id] = user[0];
					if(cb) { cb(userLookupTable[slackUserId]); }
				}
			})
		});
	} else {
		if(cb) { cb(userLookupTable[slackUserId]); }
	}
};

const getUsers = (slackUserIdArray, cb) => {
	if(!slackUserIdArray) {
		console.log('Someone asked to get users details without specifying a list of users!');
		return;
	}

	let counter = slackUserIdArray.length;

	slackUserIdArray.forEach((slackUserId) => {
		getUser(slackUserId, () => {
			if(--counter === 0) {
				if(cb) { cb(); }
			}
		});
	});
}

const getAllChannelMessagesWithDetails = (slackChannelId, cb) => {
	if(!slackChannelId) {
		console.log('Must specify a channel!');
		return;
	}

	getChannel(slackChannelId, (chan) => {
		getUsers(chan.member_ids, () => {
			db.Message.find({channel: chan._id}, null, {sort: '-timestamp'}, (err, messages) => {
				if (messages.length === 0) {
					getMessages(chan.slack_id, chan._id, null, () => {
						if(cb) { cb(); }
					});
				} else {
					date = new Date(messages[0].timestamp);
					getMessages(chan.slack_id, chan._id, {oldest: ((date.getTime() / 1000) + 1)}, () => {
						if(cb) { cb(); }
					})
				}
			});
		});
	});
}

module.exports = {
	getAllChannelMessagesWithDetails,
}
