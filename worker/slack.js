var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
               'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

var req = require('request'),
    db = require('../model'),
    amqp = require('amqplib/callback_api');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const sender = require('socket.io')(server);

server.listen(8000);

const listener = require("socket.io-client")('http://localhost:8000');

let sendSocket = null;
sender.on('connection', function(socket) {
	sendSocket = socket;
});

let queueChannel = null;
amqp.connect(process.env.RABBITMQ_BIGWIG_TX_URL || 'amqp://localhost', function(err, conn) {
	conn.createChannel(function(err, ch) {
		ch.assertQueue('user', {durable: false});
		ch.prefetch(1);
		queueChannel = ch;
	}, {noAck: false});
});

var channelLookupTable = {},
    userLookupTable = {};

const getUser = (userId, cb) => {
	let search = {slack_id: userId};
	if(userId.length === 24) {
		//We were given a mongo id
		search = {_id: userId};
	} else if(userLookupTable[userId]){
		if(cb) { cb('', userLookupTable[userId]); }
		return;
	}

	db.User.findOne(search, (err, user) => {
		if(err) {
			if(cb) { cb(`There was an error finding ${JSON.stringify(search)}` + err); }
			return;
		}

		if(user) {
			userLookupTable[user.slack_id] = user;
			if(cb) { cb('', user); }
		} else if(userId.length != 24) {
			listener.on(userId, (data) => {
				if(cb) { cb('', data); }
			});
			queueChannel.sendToQueue('user', Buffer.from(userId));
		}
	});
};

const reqUser = (userId, cb) => {
	let connString = `https://slack.com/api/users.info?token=${token}&user=${userId}`;
	req(connString, (err, resp, body) => {
		if(err) {
			console.log(err);
			if(cb) { cb(err); }
			return;
		}

		console.log(`${new Date().getTime()/1000} --- response code: ${resp.statusCode}`);

		let userInfo = JSON.parse(resp.body);
		if(!userInfo.user) {
			if(cb) { cb(`User ${userId} could not be found`) };
			return;
		}

		db.User.findOne({slack_id: userInfo.user.id}, (err, user) => {
			if(err) {
				if(cb) { cb(err); }
			}

			if(user) {
				userLookupTable[user.slack_id] = user;
				if(cb) { cb('', user); }
			} else {
				db.User.create({slack_id: userInfo.user.id, name: userInfo.user.real_name, handle: userInfo.user.name}, (err, user) => {
					if(err) {
						if(cb) { cb(err); }
						return;
					}

					userLookupTable[user.slack_id] = user;

					if(cb) { cb('', user); }
				});
			}
		});

	});
};

const reqMessages = (slackChannelId, time, cb) => {
	if(!slackChannelId) {
		if(cb) { cb('Someone asked to get messages without specifying a channel!'); };
		return;
	}

	console.log('Getting messages from ' + (time ? JSON.stringify(time) : 'the beginning'));

	let connString = `https://slack.com/api/conversations.history?token=${token}&channel=${slackChannelId}`;
	if(time && time.latest) {
		connString += `&latest=${time.latest}`;
	} else if (time && time.oldest) {
		connString += `&oldest=${time.oldest}`;
	}

	getChannel(slackChannelId, (err, channel) => {
		if(err) {
			if(cb) { cb(err); }
			return;
		}

		let internalChannelId = channel._id;

		req(connString, (err, resp, body) => {
			if(err) {
				if(cb) { cb(`An error occured when requesting ${connString}` + err); }
				return;
			}

			let channelHistory = JSON.parse(resp.body);
			let messagesProcessed = 0;
			if(channelHistory.messages.length === 0) {
				if(cb) { cb(''); }
				return;
			}

			channelHistory.messages.forEach((message) => {
				let user = '';
				if(message.subtype === 'bot_message') {
					messagesProcessed++;
					return;
				} else if(message.subtype === 'file_comment') {
					user = message.file.user;
				} else {
					user = message.user;
				}

				db.Message.create({text: message.text,
					timestamp: new Date(message.ts * 1000),
					channel: internalChannelId,
					user: user,
				}, (err, message) => {
					if(++messagesProcessed == (channelHistory.messages.length - 1)) {
						//Done processing this chunk
						if(channelHistory.has_more) {
							//Wait 1500ms before hitting the slack API again so we won't get rate limited
							setTimeout(() => {reqMessages(slackChannelId, {latest: channelHistory.messages[channelHistory.messages.length-1].ts}, cb)}, 1500);
						} else {
							if (cb) { cb(''); }
						}
					}
				});
			});
		});
	});
};

const getMessages = (slackChannelId, cb) => {
	if(!slackChannelId) {
		if(cb) { cb('Must specify a slack channel'); }
		return;
	}

	getChannel(slackChannelId, (err, channel) => {
		if(err) {
			if(cb) { cb(err); }
			return;
		}

		let internalChannelId = channel._id;

		db.Message.find({channel: internalChannelId}, null, {sort: '-timestamp'}, (err, messages) => {
			if(err) {
				if(cb) { cb('146' + err); }
				return;
			}

			let timeGuard = {};
			if(messages.length > 0) {
				timeGuard.oldest = new Date(messages[0].timestamp).getTime() / 1000 + 1;
			}

			reqMessages(slackChannelId, timeGuard, (err) => {
				if(err) {
					if(cb) { cb('157' + err); }
					return;
				}

				db.Message.find({channel: internalChannelId}, null, {sort: '-timestamp'}, (err, messages) => {
					if(err) {
						if(cb) { cb('163' + err); }
						return;
					}

					if(cb) { cb('', messages); }
				});
			});
		});
	});
};

const getChannel = (slackChannelId, cb) => {
	if (channelLookupTable[slackChannelId]) {
		if(cb) { cb('', channelLookupTable[slackChannelId]); }
		return;
	}

	db.Channel.findOne({slack_id: slackChannelId}, (err, channel) => {
		if(err) {
			if(cb) { cb(err); }
			return;
		}

		if(channel) {
			if(cb) { cb('', channel); }
			return;
		}

		reqChannel(slackChannelId, (err, channel) => {
			if(err) {
				if(cb) { cb(err); }
				return;
			}

			if(cb) { cb('', channel); }
		});
	});
};

const reqChannel = (slackChannelId, cb) => {
	let connString = `https://slack.com/api/conversations.info?token=${token}&channel=${slackChannelId}`

	req(connString, (err, resp, body) => {
		if(err) {
			if(cb) { cb(err); }
			return;
		}

		let channelInfo = JSON.parse(resp.body);
		db.Channel.create({slack_id: channelInfo.channel.id, name: channelInfo.channel.name}, (err, channel) => {
			if(err) {
				if(cb) { cb(err); }
				return;
			}

			channelLookupTable[channel.slack_id] = channel;
			if(cb) { cb('', channel); }
		});
	});
};

amqp.connect(process.env.RABBITMQ_BIGWIG_TX_URL || 'amqp://localhost', function(err, conn) {
	conn.createChannel(function(err, ch) {
		ch.assertQueue('user', {durable: false});

		ch.consume('user', function(msg) {
			let userId = msg.content.toString();
			//This timeout does not work correctly
			setTimeout(() => {
				reqUser(userId, (err, user) => {
					let userObject = {
						userId: user.slack_id,
						_id: user._id,
						name: user.name,
						handle: user.handle
					}
					sendSocket.emit(userId, userObject);
					ch.ack(msg);
				});
			}, 600);
		}, {noAck: false});
	});
});

module.exports = {
	getChannel,
	getUser,
	getMessages,
}
