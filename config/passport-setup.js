const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.js");
require("dotenv").config();

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  return done(null, user);
});

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("callback!")
      let user;
      user = await User.findOne({ googleId: profile.id });

      if (user) {
        console.log(user);
      } else {
        user = new User({
          username: profile.displayName,
          googleId: profile.id,
          picture: profile._json.picture,
        });

        try {
          await user.save();
          console.log(user);
        } catch (err) {
          next(err);
        }
      }
      return done(null, user);
    }
  )
);
