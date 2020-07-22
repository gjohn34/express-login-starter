const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const {User, OauthUser} = require('./models/user')

// {username: "foo", password: "bar"} => {username: 'foo', hash: "rdaogyvafbiolu"}
passport.serializeUser(function(user, done) {
    // this method is done( no error, here is the user)
    done(null, user)
})

// {username: 'foo', hash: "rdaogyvafbiolu"} => {username: "foo", password: "bar"}
passport.deserializeUser(function(user, done) {
    // this method is done( no error, here is the user)
    done(null, user)
})

// Initializing a Local Strategy on the User Model
passport.use(User.createStrategy());


// creating google strategy, import package
passport.use(new GoogleStrategy({
    clientID: "876353669737-s4f71ldd024ckdpp4d45j6ovu4v5b0as.apps.googleusercontent.com",
    clientSecret: "ofmSd8kYqq5_v83dEajZg-OL",
    callbackURL: "https://logins-with-auth.herokuapp.com/auth/google/callback"
  }, function(accessToken, refreshToken, profile, cb) {
      // we are calling that findOrCreate function that was created in models/user
      // we pass the data we want to create a new OauthUser with (id, displayname)
      // the provider, 'googleId'
      // the callback
    OauthUser.findOrCreate({id: profile.id, displayName: profile.displayName}, 'googleId', function(err, user) {
        return cb(err, user);
    });
  })
)

// its exactly the same as the google strategy, the only thing that changes is some discord specific things like scopes
var DiscordStrategy = require('passport-discord').Strategy;
 
var scopes = ['identify', 'email'];
 
passport.use(new DiscordStrategy({
    clientID: '734966453014626315',
    clientSecret: 'dvukCLIrX4yQrbDfUsFLt7oSNlr77X9t',
    callbackURL: 'https://logins-with-auth.herokuapp.com/auth/discord/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, cb) {
    OauthUser.findOrCreate({id: profile.id, displayName: profile.username}, 'discordId', function(err, user) {
        return cb(err, user);
    });
}));