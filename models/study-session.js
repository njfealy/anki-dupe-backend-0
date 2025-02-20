const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studySessionSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  deck: { type: mongoose.Types.ObjectId, required: true, ref: "Deck" },
  cards: [{ type: mongoose.Types.ObjectId, required: true, ref: "Card" }],
});

module.exports = mongoose.model("StudySession", studySessionSchema);
