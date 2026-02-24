const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ---------------- GENERATE QUESTION ----------------
exports.generateQuestion = async (
  skills,
  difficulty,
  type,
  history
) => {
  try {
    const previousQ = history
      .map((item, index) => {
        return `Q${index + 1}: ${item.question}
A${index + 1}: ${item.answer}`;
      })
      .join("\n\n");

    const prompt = `
You are conducting a professional mock interview.

Skills: ${skills.join(", ")}
Difficulty: ${difficulty}
Interview Type: ${type}

Previous Interview History:
${previousQ}

Ask the next interview question.
behave like interviewer.
Do NOT repeat previous questions.
Keep it under 40 words.
Do not give answer.
`;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "start the interview by asking for introduction first as You are a interviewer."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ---------------- FINAL REPORT ----------------
// ---------------- FINAL REPORT ----------------
exports.generateFinalReport = async (
  history,
  totalQuestions,
  skippedCount
) => {
  try {

    const formattedHistory = history
      .map((item, index) => {
        return `Question ${index + 1}: ${item.question}
Answer ${index + 1}: ${item.answer}`;
      })
      .join("\n\n");

    const prompt = `
You are evaluating a mock interview.

Total Questions: ${totalQuestions}
Skipped Questions: ${skippedCount}

Here is the full interview:

${formattedHistory}

Provide:

1. Overall Score (out of 10)
2. Strengths (mention the concepts that user is best) in one line only
3. English (tell about english of answer on the basis of grammer and tone of answer) in one line only
4. Areas to Improve (mention the concepts that user has to improve) in one line only
5. Final Advice
but Give everything in one line only.

Be structured and professional.
`;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer providing feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.log(error);
    throw error;
  }
};