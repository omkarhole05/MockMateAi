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
You are a professional, realistic mock interviewer conducting a live interview.

Interview Configuration:
Skills: ${skills.join(", ")}
Difficulty: ${difficulty}
Type: ${type}

Previous Interview History:
${previousQ}

IMPORTANT STRUCTURE RULES (STRICTLY FOLLOW):
1.be human
2. From the candidate’s introduction, identify and remember their name.
3. After learning the candidate’s name, use it naturally in future questions.
   Example:
   - "So Omkar, can you explain JVM architecture?"
   - "Alright Omkar, tell me about React hooks."
   another ALSO

4. Maintain a professional but conversational tone.
   Be realistic like a real interviewer — not robotic.

5. You must distribute questions evenly across all provided skills.
6. Ask 3 to 4 consecutive questions from one skill before switching to the next skill.
7. After completing one full cycle of all skills, restart the rotation.
8. If the last answer was "__SKIPPED__", ask a different simple and easy concept from the selected skill.
9. Do NOT repeat previous questions.
10. Keep question under 40 words.
11. Do NOT provide the answer.

Before generating the question, internally decide which skill should be asked next based on rotation,
then generate only that question.
Determine which skill should be asked next based on balanced rotation across skills.

Now generate the next interview question.
`;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: " You are a interviewer."
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
You are a senior technical interview panel evaluating a candidate.

INTERVIEW SUMMARY:
Total Questions: ${totalQuestions}
Skipped Questions: ${skippedCount}

Full Interview Transcript:
${formattedHistory}

EVALUATION INSTRUCTIONS (STRICT):

1. Score each selected skill individually out of 10.
   - Consider technical accuracy, depth of explanation, clarity, and confidence.
   - Deduct marks for skipped answers.
   - Deduct marks for incorrect or vague explanations.
   - Reward structured, detailed, and correct explanations.

2. Provide an Overall Score out of 10 based on:
   - Technical knowledge (50%)
   - Depth & clarity (20%)
   - Communication quality (15%)
   - Time efficiency & consistency (15%)

3. Strengths:
   - Mention specific concepts or topics the candidate demonstrated strong understanding in.
   - Keep it concise (one line).

4. English & Communication:
   - Evaluate grammar, clarity, vocabulary, professionalism, and tone.
   - Mention if answers were confident, structured, or hesitant.
   - One line only.

5. Areas to Improve:
   - Mention exact technical concepts or areas needing improvement.
   - One line only.

6. Final Advice:
   - Provide actionable professional advice in one line.

IMPORTANT FORMAT RULES:
- Give everything in ONE structured paragraph.
- Clearly separate sections using labels:
  Skill Scores:
  Overall Score:
  Strengths:
  English:
  Areas to Improve:
  Final Advice:
- Do not exceed 8–10 sentences total.
- Be realistic and strict, not overly generous.
- Do not explain your scoring logic.

Generate the final evaluation.
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