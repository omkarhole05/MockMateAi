const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  interviewId: String,
  skills: [String],
  difficulty: String,
  type: String,
  status: {
    type: String,
    default: "ongoing"
  },
  history: [
    {
      question: String,
      answer: String,
      evaluation: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
   skippedCount: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model("Interview", interviewSchema);