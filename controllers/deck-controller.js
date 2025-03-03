const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");
const Deck = require("../models/deck");
const User = require("../models/user");
const Card = require("../models/card");
const mongoose = require("mongoose");
const { urlencoded } = require("body-parser");
const { subDays, differenceInDays } = require("date-fns");

const w = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655,
  0.6621,
];

const getDeck = async (req, res, next) => {
  let deck;
  try {
    deck = await Deck.findById(req.params.deckId)
      .populate("cards")
      .populate({ path: "creator", populate: { path: "picture username" } });
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  res.status(200).json({ message: "Deck found.", deck });
};

const getAllDecks = async (req, res, next) => {
  let decks;
  try {
    decks = await Deck.find().populate({
      path: "creator",
      populate: { path: "picture username" },
    });
  } catch (err) {
    return next(new HttpError("Could not find decks.", 404));
  }
  if (!decks) return next(new HttpError("Could not find decks.", 404));

  res.status(200).json({ message: "Decks found.", decks });
};

const createDeck = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch (err) {
    return next(new HttpError("Could not find user.", 404));
  }
  if (!user) return next(new HttpError("Could not find user.", 404));

  const createdDeck = new Deck({
    creator: req.user._id,
    name: req.body.name,
    size: 0,
    cards: [],
    date_last_reviewed: subDays(new Date(), 2),
    date_last_visited: new Date(),
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await createdDeck.save({ session });
    user.decks.push(createdDeck);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return next(new HttpError("Failed to create deck.", 500));
  }
  session.endSession();
  res.status(201).json({ message: "Deck created.", deck: createdDeck });
};

const copyDeck = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let original;
  try {
    original = await Deck.findById(req.params.deckId).populate("cards");
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!original) return next(new HttpError("Deck not found.", 404));

  let user;
  try {
    user = await User.find(req.user._id).populate("decks");
  } catch (err) {
    return next(new HttpError("Could not find user.", 404));
  }
  if (!user) return next(new HttpError("Could not find user.", 404));

  const copy = new Deck(original.toObject({ retainKeyOrder: true }));
  copy._id = mongoose.Types.ObjectId();
  copy.creator = req.user._id;
  copy.date_last_reviewed = subDays(new Date(), 2);
  copy.date_last_visited = new Date();
  copy.new_per_day = 20;
  copy.learned_today = 0;
  copy.cards_review = 0;
  copy.cards_learn = 0;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await copy.save({ session });
    user.decks.push(copy);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return next(new HttpError("Failed to copy deck.", 500));
  }
  await session.endSession();

  res.status(201).json({ message: "Successfully copied deck.", deck: copy });
};

const renameDeck = async (req, res, next) => {
  console.log("rename")
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch (err) {
    return next(new HttpError("User not found.", 404));
  }
  if (!user) return next(new HttpError("User not found.", 404));

  if (req.user._id.toString() != deck.creator.toString())
    return next(new HttpError("Not authorized to rename this deck.", 401));

  deck.name = req.body.newName;

  try {
    await deck.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to rename deck.", 500));
  }

  res.status(200).json({ message: "Successfully renamed deck." });
};

const deleteDeck = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch (err) {
    return next(new HttpError("User not found.", 404));
  }
  if (!user) return next(new HttpError("User not found.", 404));

  if (req.user._id.toString() != deck.creator.toString())
    return next(new HttpError("Not authorized to delete this deck.", 401));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await deck.deleteOne({ session });
    user.decks.pull(deck);
    await user.save({ session });
    await Card.deleteMany({ deck }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    return next(new HttpError("Failed to delete deck.", 500));
  }
  await session.endSession();

  res.status(200).json({ message: "Successfully deleted deck." });
};

const addCard = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  if (req.user._id.toString() != deck.creator.toString())
    return next(new HttpError("Not authorized to add this card.", 401));

  const createdCard = new Card({
    deck: deck._id,
    front: req.body.front,
    back: req.body.back,
    r: -1,
    s: -1,
    d: -1,
    date_last_reviewed: new Date(),
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await createdCard.save({ session });
    deck.cards.push(createdCard);
    deck.size++;
    deck.learn_cards.push(createdCard);
    await deck.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    return next(new HttpError("Failed to add card to deck.", 500));
  }
  await session.endSession();
  res
    .status(201)
    .json({ message: "Successfully added card to deck.", card: createdCard });
};

const editCard = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  if (req.user._id.toString() != deck.creator.toString())
    return next(new HttpError("Not authorized to edit card.", 401));

  let card;
  try {
    card = await Card.findById(req.params.cardId);
  } catch (err) {
    return next(new HttpError("Card not found.", 404));
  }
  if (!card) return next(new HttpError("Card not found.", 404));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    card.front = req.body.newFront;
    card.back = req.body.newBack;
    await card.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return next(new HttpError("Failed to edit card.", 500));
  }
  await session.endSession();
  res.status(200).json({ message: "Successfully edited card." });
};

const deleteCard = async (req, res, next) => {
  if (!req.isAuthenticated())
    return next(new HttpError("Not authenticated.", 401));

  let deck;
  try {
    deck = await Deck.findById(req.params.deckId);
  } catch (err) {
    return next(new HttpError("Deck not found.", 404));
  }
  if (!deck) return next(new HttpError("Deck not found.", 404));

  if (req.user._id.toString() != deck.creator.toString())
    return next(new HttpError("Not authorized to delete card.", 401));

  let card;
  try {
    card = await Card.findById(req.params.cardId);
  } catch (err) {
    return next(new HttpError("Card not found.", 404));
  }
  if (!card) return next(new HttpError("Card not found.", 404));

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await card.deleteOne({ session });
    deck.cards.pull(card);
    deck.size--;
    await deck.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    return next(new HttpError("Failed to delete card from deck.", 500));
  }
  await session.endSession();
  res.status(201).json({ message: "Successfully deleted card from deck." });
};

exports.getDeck = getDeck;
exports.getAllDecks = getAllDecks;
exports.createDeck = createDeck;
exports.copyDeck = copyDeck;
exports.renameDeck = renameDeck;
exports.deleteDeck = deleteDeck;

exports.addCard = addCard;
exports.editCard = editCard;
exports.deleteCard = deleteCard;
