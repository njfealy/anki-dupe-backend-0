const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passportSetup = require("./config/passport-setup.js");
const passport = require("passport");
const MongoStore = require("connect-mongo");

const HttpError = require("./models/HttpError");

const deckRoutes = require("./routes/deck-routes.js");
const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const studyRoutes = require("./routes/study-routes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST", "DELETE", "PATCH"], // Allow specific HTTP methods
    credentials: true,
    httpOnly: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Allow custom headers
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Keep it secure
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      secure: false, // Set to true in production (requires HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Acess-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/deck/:deckId/study", studyRoutes);
app.use("/deck", deckRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown error occurred!" });
});

const server = http.createServer(app);

mongoose
  .connect(process.env.DATABASE_URI)
  .then(server.listen(process.env.PORT))
  .catch((err) => {
    console.log(err);
  });
