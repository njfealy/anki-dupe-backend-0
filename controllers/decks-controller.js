const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const Deck = require("../models/deck");
const mongoose = require("mongoose");

const getDeckInfos = async (req, res, next) => {
  let decksInfo;
  try {
    decksInfo = await Deck.find({}, "_id name size");
  } catch (err) {
    const error = new HttpError("Could not find all Decks.", 404);
    return next(error);
  }
  res.status(201);
  res.json({ decksInfo });
};

const createDeck = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name } = req.body;
  const createdDeck = new Deck({
    name: name,
  });

  try {
    console.log(name);
    console.log(createdDeck);
    await createdDeck.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating deck failed.", 500);
    return next(error);
  }
  res.status(201).json({ deck: createdDeck });
};

const getDeck = async (req, res, next) => {
  const deckId = req.params.deckId;
  let deck;
  try {
    deck = await Deck.findById(deckId).populate("cards");
  } catch (err) {
    const error = new HttpError("Could not find Deck with ID=" + deckId, 404);
    return next(error);
  }
  console.log("GET deck:", deck);
  res.status(200).json({ deck });
};

const deleteDeck = async (req, res, next) => {
  const deckId = req.params.deckId;
  console.log(deckId);
  let deck;
  try {
    deck = await Deck.findById(deckId);
    console.log(deck);
  } catch (err) {
    const error = new HttpError("Could not find Deck with ID=" + deckId, 404);
    return next(error);
  }

  if (!deck) {
    const error = new HttpError("Could not find Deck with ID=" + deckId, 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await mongoose
      .model("Card")
      .deleteMany({ deck: deckId }, { session: sess });
    await deck.deleteOne({ session: sess });
    await sess.commitTransaction();

    sess.endSession();
  } catch (err) {
    const error = new HttpError("Could not delete with ID=" + deckId, 500);
    console.log(err);
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Successfully deleted Deck with ID=" + deckId });
};

exports.getDeckInfos = getDeckInfos;
exports.createDeck = createDeck;
exports.getDeck = getDeck;
exports.deleteDeck = deleteDeck;
