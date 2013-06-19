var express = require('express');
var path = require('path');
var conf = require('./conf');

var app = module.exports = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(require('./lib/bodyParser'));
app.use(express.logger('dev'));
app.use(express.cookieParser(conf.cookie_signing_key));
app.use(express.session());
app.use('/static',express.static(path.join(__dirname, 'static')));

var passport = require('passport')
, TwitterStrategy = require('passport-twitter').Strategy;

app.use(passport.initialize());
app.use(passport.session()); 

passport.serializeUser(function(user, done) {
  done(null, JSON.stringify(user));
});

passport.deserializeUser(function(user_str, done) {
  done(null, JSON.parse(user_str));
});
passport.use(new TwitterStrategy({
  consumerKey: conf.twitter.consumer_key,
  consumerSecret: conf.twitter.consumer_secret,
  callbackURL: conf.twitter.callback
},
function(token, tokenSecret, profile, done) {
  console.log(profile);
  done(null, profile._json);
}));

