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

module.exports = {
   index,
};
