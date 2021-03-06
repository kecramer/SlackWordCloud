# Slack Cloud

*Slack Cloud is an app that generates word clouds from Slack chat histories. It allows users to interact with the most commonly used words in the chat, view messages with those words, and save those messages for later reflection.*

[Link to project hosted on Heroku](https://polar-ridge-29301.herokuapp.com/)

## Technologies Used

*What technologies did you use to develop this project? (bullet points)*

* Express
* JQuery
* Node.js
* JQCloud
* insQ
* Slackdown
* RabbitMQ
* Socket.io
* Count-Words
* Slack API

This requires you to have mongo and rabbitmq running on your localhost, and the environment variable SLACK_TOKEN set to your slack token (set this by doing `export SLACK_TOKEN=<token>` in your `~/.profile`)! Your slack token requires channels:history, channels:read, groups:history, groups:read, and users:read scopes.

The following commands should get you running:

`npm install`  
`brew install rabbitmq`  
`/usr/local/sbin/rabbitmq-server &`  
`mongod &`  
`node server.js`  


## Existing Features

*What features does your app have? (bullet points)*

* Retrieve a list of channels
* Generate a word cloud for the selected channel
* View messages that contain a word selected from the word cloud
* Save and unsave messages to a separate tab


## Planned Features

*What changes would you make to your project if you continue to work on it? (bullet points)*

* Persist saved messages
* Allow for other Slack users/workspaces
* Responsibly consume the Slack API

---

##### Screenshot

![Screenshot](./assets/ScreenShot.png)
