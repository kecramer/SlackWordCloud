const db = require('../model'),
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
