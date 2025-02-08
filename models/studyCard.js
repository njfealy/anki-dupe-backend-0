const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studyCardSchema = new Schema({
  card: { type: mongoose.Types.ObjectId, required: true, ref: "Card" },
  study: { type: mongoose.Types.ObjectId, requried: true, ref: "Study" },
  r: { type: Number },
  s: { type: Number },
  d: { type: Number },
  date_last_reviewed: { type: Date },
});

module.exports = mongoose.model("StudyCard", studyCardSchema);
