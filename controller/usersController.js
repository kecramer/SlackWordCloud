const db = require('../model'),
		slack = require('../worker/slack.js');

const show = (req, res) => {
	if(req.query.q === undefined) {
		res.sendStatus(400);
	}

	let usersList = req.query.q.split(',');
	let usersInfo = [];

	//remove duplicates
	usersList = usersList.filter((item, pos, self) => {
		return self.indexOf(item) == pos;
	});

	//We have been given slack ids
	let completedQueries = 0;
	usersList.forEach((user, i) => {
		slack.getUser(user, (err, foundUser) => {
			console.log(user)
			if(err) {
				console.log(err);
				res.sendStatus(500);
			}

			completedQueries++;

			if(foundUser) {
				usersInfo.push(foundUser);
			}

			if(usersList.length === completedQueries) {
				res.json(usersInfo);
			}
		});
	});
};

module.exports = {
	show,
};
