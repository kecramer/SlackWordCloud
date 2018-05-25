const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const UserSchema = new Schema({
	slack_id: String,
	name: String,
	handle: String,
})

const User = mongoose.model('User', UserSchema);

module.exports = User;
