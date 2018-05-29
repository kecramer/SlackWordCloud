var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
	            'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

const reqOut = require('request'),
      db = require('../model');

const index = (req, res) => {
	let connString = `https://slack.com/api/groups.list?token=${token}`;

	reqOut(connString, (err, resp, body) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		let jsonBlob = JSON.parse(resp.body);
		console.log(connString)
		console.log(JSON.stringify(jsonBlob.groups))

		jsonBlob.groups.forEach((channel, i) => {
			db.Channel.find({slack_id: channel.id}, (err, chan) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				}

				if(chan.length === 0) {
					db.Channel.create({slack_id: channel.id, name: channel.name, member_ids: channel.members}, (err, createdChan) => {
						if(err) {
							console.log(err);
							res.sendStatus(500);
						}

						if(jsonBlob.groups.length == i + 1) {
							complete(req, res);
						}
					});
				} else {
					if(jsonBlob.groups.length == i + 1) {
						complete(req, res);
					}
				}
			});
		});
	});
};

const complete = (req, res) => {
	db.Channel.find({}, (err, channels) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		res.json({channels});
	});
}

module.exports = {
	index,
};
