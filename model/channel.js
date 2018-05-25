const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const ChannelSchema = new Schema({
	slack_id: String,
	name: String,
})

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
