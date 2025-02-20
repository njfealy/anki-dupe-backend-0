const express = require("express");
const router = express.Router();
const passport = require("passport");
const { check } = require("express-validator");
const HttpError = require("../models/HttpError");

const authController = require("../controllers/auth-controller");

router.get("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ authenticated: true, user: req.user });
  }
  res.json({ authenticated: false });
});

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {
    res.redirect("http://localhost:5173");
  }
);

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

module.exports = router;
