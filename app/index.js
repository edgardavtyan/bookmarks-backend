const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('./config');
const app = module.exports = express();

require('./db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ resave: false, saveUninitialized: false, secret: '123'}));
app.use(passport.initialize());
app.use(passport.session());

require('./auth')(passport);
passport.use(require('./auth/local'));

require('./routes')(app);

app.listen(config.server.port);
