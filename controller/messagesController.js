const db = require('../model');

const index = (req, res) => {
   let regex = /[\s\S]*/;

   if(req.query.q) {
      regex = new RegExp(req.query.q, 'i');
   }

   db.Message.find({text: regex}, (err, messages) => {
      if(err) {
         console.log(err);
         res.sendStatus(500);
      }
      
      res.json({messages});
   });
};

module.exports = {
   index,
};
