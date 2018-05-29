const db = require('../model'),
      slack = require('../worker/slack.js');

const show = (req, res) => {
	if(req.query.q === undefined) {
		res.sendStatus(400);
	}

	let usersList = req.query.q.split(',');
	let usersInfo = [],
	    usersToGet = [];

	if(usersList[0].length === 24) {
		//We have been given mongo ids
		usersList.forEach((user, i) => {
			db.User.findById(user, (err, foundUser) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				}

				if(foundUser !== undefined) {
					usersInfo.push(foundUser);
				}

				if(usersList.length === i + 1) {
					foundUsers(req, res, usersInfo);
				}
			});
		});
	} else {
		//We have been given slack ids
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
	}
};

const foundUsers = (req, res, completeUsers, incompleteUsers) => {
	if(incompleteUsers) {
		slack.getUsers(incompleteUsers, (userData) => {
			if(userData.length > 0) {
				userData.forEach((user) => {
					completeUsers.push(user);
				});
			}
			res.json(completeUsers);
		});
	} else {
		res.json(completeUsers);
	}
}

module.exports = {
	show,
};
