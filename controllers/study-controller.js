const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");
const Deck = require("../models/deck");
const User = require("../models/user");
const Card = require("../models/card");
const alg = require("../util/alg");
//const StudySession = require("../models/study-session");

const w = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655,
  0.6621,
];

const getStudy = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  deck.date_last_reviewed = new Date();
  await deck.save();

  // if (!req.session.studySessions) req.session.studySessions = {};
  // if (req.session.studySessions?.[req.params.deckId]) {
  //   return res.status(200).json({
  //     message: "Retrieving study session.",
  //     study_cards: req.session.studySessions[req.params.deckId].study_cards,
  //   });
  // }

  const due_today = deck.new_per_day - deck.learned_today;
  const learn_cards = await Deck.aggregate([
    {
      $match: {
        _id: deck._id,
      },
    },
    {
      $unwind: "$learn_cards",
    },
    {
      $project: {
        _id: 0,
        card: "$learn_cards",
      },
    },
    {
      $sample: {
        size: due_today,
      },
    },
  ]);
  const review_cards = await Deck.aggregate([
    {
      $match: {
        _id: deck._id,
      },
    },
    {
      $unwind: "$review_cards",
    },
    {
      $project: {
        _id: 0,
        card: "$review_cards",
      },
    },
  ]);

  // req.session.studySessions[req.params.deckId] = {
  //   deck: deck._id,
  //   user: req.user._id,
  //   study_cards: learn_cards.concat(review_cards),
  // };
  // req.session.save();

  res.status(200).json({
    study_cards: learn_cards.concat(review_cards),
  });
};

const submitStudy = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));
};

const gradeCard = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  if (deck.creator.toString() != req.user._id.toString())
    return next(new HttpError("Not authorized.", 401));

  let card;
  try {
    card = await Card.findById(req.params.cardId);
  } catch (err) {
    return next(new HttpError("Card not found.", 404));
  }
  if (!card) return next(new HttpError("Card not found.", 404));

  // req.session.studySessions[req.params.deckId].study_cards =
  //   req.session.studySessions[req.params.deckId].study_cards.filter(
  //     (c) => c.card._id.toString() !== card._id.toString()
  //   );
  // await req.session.save();

  const g = req.body.grade;
  console.log(g);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (card.r == -1) {
      deck.learned_today++;
      console.log(deck.learned_today)
    }
    deck.date_last_reviewed = new Date();

    card.s = alg.s(card.d, card.s, card.r, g);
    card.r = alg.r(0, card.s)
    card.i = alg.i(0.9, card.s);
    card.d = alg.d(card.d, g);
    card.date_last_reviewed = new Date();

    await card.save({ session });
    await deck.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return next(new HttpError("Failed to grade card.", 500))
  }
  session.endSession();

  res.status(200).json({
    message: "Graded card",
    //study_cards: req.session.studySessions[req.params.deckId].study_cards,
  });
};

exports.getStudy = getStudy;
exports.submitStudy = submitStudy;
exports.gradeCard = gradeCard;
