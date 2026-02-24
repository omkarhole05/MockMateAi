const { v4: uuidv4 } = require("uuid");
const Interview = require("../models/interview.js");
const {
  generateQuestion,
  generateFinalReport
} = require("../services/aiService");

const MAX_QUESTIONS = 10;

// START INTERVIEW
exports.startInterview = async (req, res) => {
  try {
    const { skills, difficulty, type } = req.body;

    if (!skills || !difficulty || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const interviewId = uuidv4();

    const firstQuestion = await generateQuestion(
      skills,
      difficulty,
      type,
      []
    );

    const interview = new Interview({
      interviewId,
      skills,
      difficulty,
      type,
      history: [
        {
          question: firstQuestion,
          answer: ""
        }
      ]
    });

    await interview.save();

    res.json({ interviewId, question: firstQuestion });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error starting interview" });
  }
};

// SUBMIT ANSWER (NO EVALUATION HERE)
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    const interview = await Interview.findOne({ interviewId });

    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    const lastEntry = interview.history[interview.history.length - 1];

    // Save answer
    lastEntry.answer = answer;

    // If max questions reached → stop asking new
    if (interview.history.length >= MAX_QUESTIONS) {
      interview.status = "completed";
      await interview.save();

      return res.json({
        message: "Interview completed. Click finish to get feedback."
      });
    }

    // Generate next question
    const nextQuestion = await generateQuestion(
      interview.skills,
      interview.difficulty,
      interview.type,
      interview.history
    );

    interview.history.push({
      question: nextQuestion,
      answer: ""
    });

    await interview.save();

    res.json({
      nextQuestion
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error submitting answer" });
  }
};


// FINISH INTERVIEW (ALL FEEDBACK HERE)
exports.finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findOne({ interviewId });

    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    const report = await generateFinalReport(interview.history);

    interview.status = "completed";
    await interview.save();

    res.json({ finalReport: report });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finishing interview" });
  }
};

//akfjhabkfhkahfuh skip
exports.answerQuestion = async (req, res) => {
  const { interviewId, answer } = req.body;

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({ message: "Interview not found" });
  }

  // Increase total questions
  interview.totalQuestions += 1;

  if (answer === "__SKIPPED__") {
    interview.skippedCount += 1;
  } else {
    interview.history.push({
      question: interview.currentQuestion,
      answer
    });
  }

  const nextQuestion = await generateQuestion(
    interview.skills,
    interview.difficulty,
    interview.type,
    interview.history
  );

  interview.currentQuestion = nextQuestion;

  await interview.save();

  res.json({ nextQuestion });
};