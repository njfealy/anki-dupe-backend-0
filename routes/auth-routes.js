const express = require("express");
const router = express.Router();
const passport = require("passport");
const { check } = require("express-validator");
const HttpError = require("../models/HttpError");

const authController = require("../controllers/auth-controller");

router.get("/login", authController.login);

router.get("/logout", authController.logout);

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {res.send(req.user)}
);

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

module.exports = router;
