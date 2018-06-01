const db = require('../model'),
      countWords = require('count-words'),
      slack = require('../worker/slack.js');

const show = (req, res) => {
	slack.getMessages(req.params.id, () => {
		db.Channel.find({slack_id: req.params.id}, (err, channel) => {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			}

			if(!channel) {
				console.log('Could not find that channel!');
				res.sendStatus(404);
			}

			db.Message.find({channel: channel[0]._id}, (err, messages) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				}

				if(messages.length == 0) {
					console.log('No messages for that conversation');
					res.sendStatus(418);
				}

				let hugeString = '';

				for(let i = 0; i < messages.length; i++) {
					hugeString += ' ' + messages[i].text;
				};

				hugeString = hugeString.replace(/has [a-z]+ the group/g, '')
				                       .replace(/uploaded a file/g, '')
				                       .replace(/\<@[a-zA-Z0-9]+\>/g, '')
				                       .replace(/:[a-zA-Z0-9\-_]+:/g, '')
				                       .replace(/(and )?commented( on)?/g, '')
				                       .replace(/image uploaded from [.]+/g, '')
				                       .replace(/\<https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)[\>|]/g, '')
											  .replace(/'/g, '');

				let occurrences = countWords(hugeString, true);

				let topKeys = Object.keys(occurrences).sort((a,b) => occurrences[b] - occurrences[a]);

				let words = [];
				for(let i = 0; (i < ((req && req.query && req.query.limit) || 20)) && topKeys[i] !== undefined; i++) {
					words.push({text: topKeys[i], weight: occurrences[topKeys[i]]});
				}
				res.json({words});
			});
		});
	});
};

module.exports = {
	show,
};
