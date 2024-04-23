const passport = require('passport');

// Google Auth
const googleStrategy = require('passport-google-oauth2').Strategy;

// Facebook Auth
const facebookStrategy = require("passport-facebook").Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Google Middleware
passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));

// Facebook Middleware
passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}
));
