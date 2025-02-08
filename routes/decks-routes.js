const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const decksController = require("../controllers/decks-controller");
const cardController = require("../controllers/card-controller");

router.get("/", decksController.getDeckInfos);

router.post(
  "/create",
  [check("name").not().isEmpty()],
  decksController.createDeck
);
router.delete("/deck/:deckId/delete", decksController.deleteDeck);
router.post("/deck/:deckId/createCard", cardController.createCard);
router.delete("/deck/:deckId/deleteCard", cardController.deleteCard);
router.get("/deck/:deckId", decksController.getDeck);

module.exports = router;
