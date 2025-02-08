const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");

const login = async (req, res, next) => {
    next();
}

const logout = async (req, res, next) => {
    next();
}

exports.login = login;
exports.logout = logout;