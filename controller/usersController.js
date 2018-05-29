var token = process.env.SLACK_TOKEN || null;

if (token === null) {
	console.log('Must have SLACK_TOKEN defined in your environment.\n' +
               'Do this by adding `export SLACK_TOKEN=token` in your ~/.profile');
	process.exit(1);
}

const reqOut = require('request'),
      db = require('../model'),
      slack = require('../worker/slack.js');

const show = (req, res) => {
	if(req.query.q === undefined) {
		res.sendStatus(400);
	}

	let usersList = req.query.q.split(',');
	let usersInfo = [],
	    usersToGet = [];

	usersList.forEach((user, i) => {
		db.User.find({slack_id: user}, (err, foundUser) => {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			}

			if(foundUser.length > 0) {
				usersInfo.push(foundUser[0]);
			} else {
				usersToGet.push(user);
			}

			if(usersList.length === i + 1) {
				foundUsers(req, res, usersInfo, usersToGet);
			}
		});
	});
};

const foundUsers = (req, res, completeUsers, incompleteUsers) => {
	slack.getUsers(incompleteUsers, (userData) => {
		if(userData.length > 0) {
			userData.forEach((user) => {
				completeUsers.push(user);
			});
		}
		res.json(completeUsers);
	});
}

module.exports = {
	show,
};
