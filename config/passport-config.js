const passport = require("passport");
const googleStrategy = require("passport-google-oauth20");
const User = require("../models/user.js");

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
      callbackURL: "http://localhost:3000/auth/google/redirect",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
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
