const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");

const Card = require("../models/card.js");
const Deck = require("../models/deck.js");
const deck = require("../models/deck.js");

const getCard = async (req, res, next) => {};

const createCard = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(new HttpError("Not Authenticated.", 401));
  }

  const deckId = req.params.deckId;
  const { front, back } = req.body;

  let deck;
  try {
    deck = await Deck.findById(deckId)
  } catch (err) {
    const error = new HttpError("Could not find Deck.", 404);
    return next(error);
  }

  if (!deck) {
    const error = new HttpError("Could not find Deck with ID=" + deckId, 404);
    return next(error);
  }

  if (req.user._id.toString() != deck.creator.toString()) {
    return next(new HttpError("Not Authorized.", 401));
  }

  const createdCard = new Card({
    deck: deckId,
    front,
    back,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCard.save({ session: sess });
    deck.cards.push(createdCard);
    deck.size++;
    await deck.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("2 Creating card failed.", 500);
    return next(error);
  }

  res.status(201).json({ card: createdCard });
};

const deleteCard = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log(req.user);
    return next(new HttpError("Not Authenticated.", 401));
  }

  const cardId = req.body.cardId;

  let card;
  try {
    card = await Card.findById(cardId).populate({
      path: "deck",
      populate: { path: "creator" },
    });
  } catch (err) {
    const error = new HttpError("Could not find Card with ID=" + cardId, 404);
    return next(error);
  }

  if (!card) {
    const error = new HttpError("Could not find Card with ID=" + cardId, 404);
    return next(error);
  }

  if (card.deck.creator._id != req.user._id) {
    return next(new HttpError("Not Authorized.", 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await card.deleteOne({ session: sess });
    card.deck.cards.pull(card);
    card.deck.size--;
    await card.deck.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not delete Card.", 500);
    console.log(err);
    return next(error);
  }

  res.status(200).json({ message: "Deleted Card." });
};

exports.getCard = getCard;
exports.createCard = createCard;
exports.deleteCard = deleteCard;