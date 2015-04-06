var passport = require('passport');
var app = require('./boot');
var conf = require('./conf');
var copyFile = require('./lib/copyFile');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var SUMMARY = 'summary_ccda.xml';

function asTwitterHandle(s){
  s = s.toLowerCase();
  var t = (s||"").replace(/[^A-Za-z0-9_]/g,"");
  if (!t || t !== s) {
    return null;
  }
  return t;
}

app.get('/', function(req, res){
  res.render('index', {
    user: req.user? req.user.screen_name : null
  });
});

app.get('/signout', function(req, res, next){
  req.logout()
  res.redirect('/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' })
);

var port = process.env.VMC_APP_PORT || 3000;
app.listen(port);
console.log("running on port: " + port);
