const express = require("express");
const router = express.Router({mergeParams: true});
const studyController = require("../controllers/study-controller")

// router.get("/:deckId", studyController.getStudy)
// router.post("/:deckId", studyController.createStudy)
// router.patch("/:deckId", studyController.resetStudy)
// router.get("/:deckId/lesson", studyController.getLesson)

router.get("/", studyController.getStudy)
router.patch("/:cardId", studyController.gradeCard)
router.patch("/", studyController.submitStudy)



module.exports = router;