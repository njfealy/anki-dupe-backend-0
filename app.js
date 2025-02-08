const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");

const decksRoutes = require("./routes/decks-routes");
const authRoutes = require("./routes/auth-routes");
const HttpError = require("./models/HttpError");
const passport = require("passport");
require("dotenv").config();

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Keep it secure
    resave: false,
    saveUninitialized: false,
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

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow custom headers
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Acess-Control-Allow-Headesrs",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use("/decks", decksRoutes);
app.use("/auth", authRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(500);
  res.json({ message: error.message || "Unknown error occurred!" });
});

const server = http.createServer(app);

mongoose
  .connect(process.env.DATABASE_URI)
  .then(server.listen(process.env.PORT))
  .catch((err) => {
    console.log(err);
  });
