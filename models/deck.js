const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deckSchema = new Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true, default: 0 },
  cards: [
    { type: mongoose.Types.ObjectId, required: true, default: [], ref: "Card" },
  ],
});

module.exports = mongoose.model("Deck", deckSchema);
