const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cardSchema = new Schema({
  deck: { type: mongoose.Types.ObjectId, required: true, ref: "Deck" },
  front: { type: String, required: true },
  back: { type: String, required: true },
  r: { type: Number, default: -1 },
  i: { type: Number, default: -1 },
  s: { type: Number, default: -1 },
  d: { type: Number, default: -1 },
  date_last_reviewed: { type: Date },
});

module.exports = mongoose.model("Card", cardSchema);
