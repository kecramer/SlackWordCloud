const express = require('express'),
      db = require('./model'),
      controller = require('./controller');

const app = express();
app.use(express.static('public'));

app.get('/channel/:id/words', controller.words.show);

app.listen(process.env.PORT || 3000, () => {
   console.log('Express started on port ' + (process.env.PORT || '3000'));
})
