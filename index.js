var passport = require('passport');
var app = require('./boot');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var SUMMARY = 'summary_ccda.xml';

function asTwitterHandle(s){
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

app.post('/incoming/ccda/for/:to', function(req, res, next){

  var to = asTwitterHandle(req.params.to);
  if (to === null) {
    return next("invalid to: " + req.params.to);
  }

  var dir = path.resolve(__dirname, "db", to);
  mkdirp(dir, function (err) {
    if (err) {
      return next(err);
    }
    fs.writeFile(
      path.resolve(dir, SUMMARY),
      req.rawBody, function(err){
        if(err) {
          return next(err);
        }
        res.end();
      });
  });
});

app.get('/my/ccda/summary', function(req, res, next){
  console.log(req.user);
  if (!req.user) {
    req.user = {
      screen_name: "JoshCMandel"
    };
  }
  if (!req.user || asTwitterHandle(req.user.screen_name) === null){
    return next("Not logged in");
  }

  var sfile = path.resolve(__dirname, "db", req.user.screen_name, SUMMARY);
  fs.exists(sfile, function( exists ) {  
    if (!exists){
      return res.end("No summary available", 404);
    }
    res.header('Content-type', 'application/xml');
    fs.createReadStream(sfile).pipe(res);
  })

});

app.listen(3000);
console.log('Express app started on port 3000');
