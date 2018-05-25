const db = require('./model');

db.Channel.remove({}, (err) => {
	if(err) { console.log(err); return; }

	console.log('Removed all Channels');
	db.Message.remove({}, (err) => {
		if(err) { console.log(err); return; }

		console.log('Removed all Messages');
		db.User.remove({}, (err) => {
			if(err) { console.log(err); return; }

			console.log('Removed all Users');
			db.SavedMessage.remove({}, (err) => {
				if(err) { console.log(err); return; }

				console.log('Removed all Saved Messages');
				db.Channel.create({slack_id: 'ABC123', name: 'Channel-1'}, (err, channel) => {
					if(err) { console.log(err); return; }

					console.log('Created channel: ' + channel);
					db.User.create({slack_id: 'DEF456', name: 'Kevin', handle: '@kevin'}, (err, user) => {
						if(err) { console.log(err); return; }

						console.log('Created user: ' + user);
						db.Message.create({channel: channel._id, user: user._id, timestamp: new Date(), text: 'Hello!'}, (err, message) => {
							if(err) { console.log(err); return; }

							console.log('Created message: ' + message);
							db.Message.find({})
								.populate('user')
								.populate('channel')
								.exec((err, foundMessage) => {
									console.log('\n\nPOPULATED MESSAGE: ' + foundMessage);
								});
						})
					})
				});
			});
		});
	});
});
