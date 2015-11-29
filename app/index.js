const express = require('express');
const bodyParser = require('body-parser');
const app = module.exports = express();

require('./db');

app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app);

app.listen(1377);
