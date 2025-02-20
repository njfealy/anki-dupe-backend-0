const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");

const login = async (req, res, next) => {
  next();
};

const logout = async (req, res, next) => {
    console.log(req.isAuthenticated())
    console.log("logout")
    req.logout((err) => {
        if(err) return next(err);
        console.log(req.isAuthenticated())
        res.send()
    })
//   try {
//     
//   } catch (err) {
//     const error = new HttpError(404, "Logout unsuccessful");
//   }

//   res.statusCode = 204;
//   res.json({ message: "Logout successful." });
};

exports.login = login;
exports.logout = logout;
