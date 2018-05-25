const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const SavedMessageSchema = new Schema({
	message: {
		type: Schema.Types.ObjectId,
		ref: 'Message',
	},
})

const SavedMessage = mongoose.model('SavedMessage', SavedMessageSchema);

module.exports = SavedMessage;
