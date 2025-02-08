const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cardSchema = new Schema({
  deck: { type: mongoose.Types.ObjectId, required: true, ref: "Deck" },
  front: { type: String, required: true },
  back: { type: String, required: true },
});

module.exports = mongoose.model("Card", cardSchema);
