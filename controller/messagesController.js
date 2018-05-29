const db = require('../model');

const index = (req, res) => {
   let regex = /[\s\S]*/;

   if(req.query.q) {
      regex = new RegExp(req.query.q, 'i');
   }

   db.Message.find({text: regex}, (err, messages) => {
      res.json({messages});
   });
};

module.exports = {
   index,
};
