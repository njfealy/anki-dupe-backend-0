const HttpError = require("../models/HttpError");
const User = require("../models/user");
const mongoose = require("mongoose");
const { differenceInDays } = require("date-fns");
const Deck = require("../models/deck");
const Card = require("../models/card");

const getUser = async (req, res, next) => {
  //retrieves user info and shallow deck info
  console.log(req.params);
  let user;
  try {
    user = await User.findById(req.params.id).populate({
      path: "decks",
      select: "name size",
    });
  } catch (err) {
    return next(new HttpError("Could not find user.", 404));
  }
  if (!user) return next(new HttpError("Could not find user.", 404));
  res.status(200).send(user);
};

const getUserDecks = async (req, res, next) => {
  //retrives deep info
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let user;
  try {
    user = await User.findById(req.user._id).populate("decks");
  } catch (err) {
    return next(new HttpError("User not found.", 404));
  }
  if (!user) return next(new HttpError("User not found.", 404));
  if (user._id.toString() != req.user._id.toString())
    return next(new HttpError("Not authorized.", 401));

  const updateR = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "cards",
        localField: "decks",
        foreignField: "deck",
        as: "cards",
      },
    },
    {
      $unwind: "$cards",
    },
    {
      $match: { "cards.r": { $ne: -1 } },
    },
    {
      $project: {
        card: "$cards",
        _id: 1,
      },
    },
    {
      $set: {
        t: {
          $dateDiff: {
            startDate: "$card.date_last_reviewed",
            endDate: new Date(),
            unit: "day",
          },
        },
      },
    },
    {
      $set: {
        "card.r": {
          $pow: [
            {
              $add: [
                1,
                {
                  $multiply: [
                    { $divide: [19, 81] },
                    { $divide: ["$t", "$card.s"] },
                  ],
                },
              ],
            },
            -0.5,
          ],
        },
      },
    },

    {
      $project: {
        _id: "$card._id",
        deck: "$card.deck",
        front: "$card.front",
        back: "$card.back",
        r: "$card.r",
        s: "$card.s",
        d: "$card.d",
        date_last_reviewed: "$card.date_last_reviewed",
      },
    },
    {
      $merge: {
        into: "cards",
        on: "_id", // Merge using the card's _id
        whenMatched: "merge", // Update if a match is found
        whenNotMatched: "insert", // Insert if no match is found
      },
    },
  ]);

  await Card.aggregate([
    // {
    //   $match: {
    //     r: -1,
    //   },
    // },
    {
      $group: {
        _id: "$deck", // Group by deck ID
        review_cards: {
          $push: {
            $cond: [
              { $and: [{ $lte: ["$r", 0.9] }, { $ne: ["$r", -1] }] },
              "$$ROOT",
              "$$REMOVE",
            ],
          },
        },
        learn_cards: {
          $push: {
            $cond: [{ $eq: ["$r", -1] }, "$$ROOT", "$$REMOVE"],
          },
        },
      },
    },
    {
      $merge: {
        into: "decks",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "insert",
      },
    },
  ]);

  await Deck.aggregate([
    {
      $match: {
        creator: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $addFields: {
        isReviewedWithin24Hours: {
          $lte: [
            {
              $dateDiff: {
                startDate: "$date_last_reviewed",
                endDate: new Date(),
                unit: "hour",
              },
            },
            24,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        creator: 1,
        date_last_reviewed: 1,
        date_last_visited: 1,
        size: 1,
        learn_size: { $size: "$learn_cards" },
        review_size: { $size: "$review_cards" },
        new_per_day: 1,
        learned_today: {
          $cond: {
            if: "$isReviewedWithin24Hours",
            then: "$learned_today",
            else: 0,
          },
        },
        new_today: {
          $min: [
            { $subtract: ["$new_per_day", "$learned_today"] },
            { $size: "$learn_cards" },
          ],
        },
      },
    },
    {
      $merge: {
        into: "decks",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "insert",
      },
    },
  ]);

  const decksInfo = await Deck.aggregate([
    {
      $match: {
        creator: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        creator: 1,
        date_last_reviewed: 1,
        date_last_visited: 1,
        size: 1,
        learn_size: { $size: "$learn_cards" },
        review_size: { $size: "$review_cards" },
        new_per_day: 1,
        learned_today: 1,
        new_today: {
          $min: [
            { $subtract: ["$new_per_day", "$learned_today"] },
            { $size: "$learn_cards" },
          ],
        },
      },
    },
  ]);
  res.status(200).json({ decks: decksInfo });
};

exports.getUser = getUser;
exports.getUserDecks = getUserDecks;

/*

user decks:
how many cards
how many learn cards due today = Math.min(limit - already learned, laern_size)
how many review cards = cards where r != -1 and r <= 0.90

get study session:
fetch all learning cards for the day and all review cards



*/
