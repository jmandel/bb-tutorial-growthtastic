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

app.post('/incoming/ccda/for/:to', function(req, res, next){

  var twitterHandleRE =  RegExp("^(.*)?@" + conf.direct_domain, "i");
  var to = req.params.to.match(twitterHandleRE);

  if (to === null){
    return next("invalid to: " + req.params.to);
  }
  to = asTwitterHandle(to[1]);
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

app.get('/my/ccda/fixture', function(req, res, next){
  console.log(req.user);
  if (!req.user){
    res.status(401);
    return res.end("Must log in to create a fake a clinical summary");
  }
  var user = asTwitterHandle(req.user.screen_name);

  var dir = path.resolve(__dirname, "db", user);
  mkdirp(dir, function (err) {
    if (err) {
      return next(err);
    }

    copyFile(path.resolve(__dirname, "static", "assets", "sample-ccda.xml"),
             path.resolve(dir, SUMMARY), 
             function(err){
               if (err) {
                 return next(err);
               }
              res.end("Created"); 
    });
  });
});

app.get('/my/ccda/summary', function(req, res, next){
  console.log(req.user);

  if (!req.user){
    res.status(401);
    return res.end("Must log in to view a clinical summary");
  }
  var user = asTwitterHandle(req.user.screen_name);

  var sfile = path.resolve(__dirname, "db", user, SUMMARY);
  fs.exists(sfile, function( exists ) {  
    if (!exists){
      res.status(404);
      return res.end("No summary available");
    }
    res.header('Content-type', 'application/xml');
    fs.createReadStream(sfile).pipe(res);
  })

});

var port = process.env.VMC_APP_PORT || 3000;
app.listen(port);
console.log("running on port: " + port);
