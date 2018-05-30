const db = require('../model');

const index = (req, res) => {
	let regex = /[\s\S]*/;

	if(req.query.q) {
		regex = new RegExp(req.query.q, 'i');
	}

	db.Channel.find({slack_id: req.params.id}, (err, channel) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		db.Message.find({$and:[{text: regex},{channel: channel[0]._id}]}, (err, messages) => {
			if(err) {
				console.log(err);
				res.sendStatus(500);
			}

			res.json({messages});
		});
	});
};

const save = (req, res) => {
	if(req.params.id.length != 24) {
		res.sendStatus(400);
	}

	db.Message.findById(req.params.id, (err, message) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		if(!message) {
			res.sendStatus(404);
		} else {
			db.SavedMessage.find({message: req.params.id}, (err, message) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				}

				if(message.length > 0) {
					res.sendStatus(200);
				} else {
					db.SavedMessage.create({message: req.params.id}, (err, message) => {
						if(err) {
							console.log(err);
							res.sendStatus(500);
						}

						res.sendStatus(204);
					});
				}
			});
		}
	});
};

const remove = (req, res) => {
	if(req.params.id.length != 24) {
		res.sendStatus(400);
	}

	db.SavedMessage.deleteOne({message: req.params.id}, (err, message) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		if(!message) {
			res.sendStatus(404);
		} else {
			res.sendStatus(200);
		}
	});
};

const saved_index = (req, res) => {
	db.SavedMessage.find({})
	               .populate('message')
	               .exec((err, messages) => {
		if(err) {
			console.log(err);
			res.sendStatus(500);
		}

		res.json(messages);
	});
};

module.exports = {
	index,
	save,
	remove,
	saved_index
};
