const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const deckController = require("../controllers/deck-controller");

// //router.get("/", decksController.getDeckInfos);

// router.post(
//   "/create",
//   [check("name").not().isEmpty()],
//   decksController.createDeck
// );

router.post("/", deckController.createDeck)
router.get("/all", deckController.getAllDecks)
router.post("/:deckId/card", deckController.addCard)
router.patch("/:deckId/cards/:cardId", deckController.editCard)
router.delete("/:deckId/cards/:cardId", deckController.deleteCard)
router.get("/:deckId", deckController.getDeck)
router.patch("/:deckId", deckController.renameDeck)
router.delete("/:deckId", deckController.deleteDeck)
router.post("/:deckId/copy", deckController.copyDeck)

module.exports = router;