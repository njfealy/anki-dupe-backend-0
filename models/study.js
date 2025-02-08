const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studySchema = new Schema({
  deck: { type: mongoose.Types.ObjectId, ref: "Deck"},
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  last_visited: { type: Date },
  cards_review: { type: Number },
  cards_learn: { type: Number },
  studyCards: [{ type: mongoose.Types.ObjectId, ref: "StudyCard" }],
});

module.exports = mongoose.Model("Study", studySchema);
