const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  finishInterview
} = require("../controllers/interviewController");

router.post("/start", startInterview);
router.post("/answer", submitAnswer);
router.post("/finish", finishInterview);

module.exports = router;