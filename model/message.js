const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const MessageSchema = new Schema({
	channel: {
		type: Schema.Types.ObjectId,
		ref: 'Channel',
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	timestamp: Date,
	text: String
})

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
