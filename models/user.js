const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  googleId: { type: String, required: false },
  picture: { type: String },
  decks: [{ type: mongoose.Types.ObjectId, ref: "Deck", default: [] }],
  studies: [{ type: mongoose.Types.ObjectId, ref: "Study", default: [] }],
});

module.exports = mongoose.model("User", userSchema);
