const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deckSchema = new Schema({
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true },
  date_last_reviewed: { type: Date, default: undefined },
  date_last_visited: { type: Date, default: Date.now(), required: true },
  new_per_day: { type: Number, default: 20 },
  learned_today: { type: Number, default: 0 },
  cards: [{ type: mongoose.Types.ObjectId, ref: "Card" }],
  review_cards: [{ type: mongoose.Types.ObjectId, ref: "Card" }],
  learn_cards: [{ type: mongoose.Types.ObjectId, ref: "Card" }],
  size: { type: Number, default: 0 },
});

module.exports = mongoose.model("Deck", deckSchema);
