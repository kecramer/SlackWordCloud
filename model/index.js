const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost/slack-cloud';

mongoose.connect(connectionString);

module.exports.Channel = require('./channel.js');
module.exports.Message = require('./message.js');
module.exports.User = require('./user.js');
module.exports.SavedMessage = require('./saved_message.js');
