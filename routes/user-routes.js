const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const User = require("../models/user");
const Deck = require("../models/deck");
const Card = require("../models/card");
const mongoose = require("mongoose");

const userController = require("../controllers/user-controller");
const { getAllDecks } = require("../controllers/deck-controller");
const { startOfDay } = require("date-fns");

router.get("/test/", async (req, res, next) => {
  console.log(req.session);
  res.status(200).json({ message: "yay" });
});
router.get("/:id", userController.getUser);
router.get("/:id/decks", userController.getUserDecks);

module.exports = router;

/*
[
  {
    '$match': {
      '_id': new ObjectId('67a6d0f01b3a3f23c22da954')
    }
  }, {
    '$lookup': {
      'from': 'cards', 
      'localField': 'decks', 
      'foreignField': 'deck', 
      'as': 'cards'
    }
  }, {
    '$unwind': {
      'path': '$cards', 
      'includeArrayIndex': 'string', 
      'preserveNullAndEmptyArrays': false
    }
  }, {
    '$project': {
      '_id': 0, 
      'card': '$cards'
    }
  }, {
    '$match': {
      'card.r': {
        '$ne': -1
      }
    }
  }, {
    '$set': {
      't': {
        '$dateDiff': {
          'startDate': '$card.date_last_reviewed', 
          'endDate': new Date(), 
          'unit': 'day'
        }
      }
    }
  }, {
    '$set': {
      'card.r': {
        '$pow': [
          {
            '$add': [
              1, {
                '$multiply': [
                  {
                    '$divide': [
                      19, 81
                    ]
                  }, {
                    '$divide': [
                      '$t', '$card.s'
                    ]
                  }
                ]
              }
            ]
          }, -0.5
        ]
      }
    }
  }, {
    '$merge': {
      'into': 'cards', 
      'on': 'card._id', 
      'whenMatched': 'merge', 
      'whenNotMatched': 'insert'
    }
  }
]

*/
