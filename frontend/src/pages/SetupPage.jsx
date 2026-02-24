import { useState } from "react";
import API from "../services/api";

function SetupPage({ setInterviewData }) {
  const [skills, setSkills] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [type, setType] = useState("Technical");
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    if (!skills.trim()) return alert("Enter at least one skill");

    try {
      setLoading(true);

      const response = await API.post("/start", {
        skills: skills.split(",").map(s => s.trim()),
        difficulty,
        type
      });

      setInterviewData({
        interviewId: response.data.interviewId,
        question: response.data.question
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-6">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT BRAND PANEL */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-12 flex flex-col justify-center hidden md:flex">

          <h1 className="text-5xl font-bold mb-4 ">
            MockMate AI
          </h1>

          <h2 className="text-2xl font-semibold mb-6 opacity-95">
            Your Personal AI Interview Coach
          </h2>

          <p className="text-lg opacity-90 leading-relaxed mb-8">
            Practice realistic mock interviews tailored to your skills.
            Get instant feedback. Improve faster. Land your dream job.
          </p>

          <div className="space-y-4 text-sm opacity-85">
            <p>- Unlimited Practice Sessions</p>
            <p>- Technical & HR Interviews</p>
            <p>- Smart AI Feedback</p>
            <p>- Domain-Based Questioning</p>
          </div>

        </div>

        {/* RIGHT CONFIG PANEL */}
        <div className="w-full md:w-1/2 p-12">

          <h2 className="text-3xl font-semibold mb-8 text-gray-800">
            Start Your Mock Interview
          </h2>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Enter Your Skills
            </label>
            <input
              type="text"
              placeholder="Java, React, SQL, Node.js"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-600">
              Experience Level
            </label>

            <div className="flex gap-3">
              {["Basic", "Medium", "Advanced"].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    difficulty === level
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-gray-600">
              Interview Type
            </label>

            <div className="flex gap-3">
              {["Technical", "HR"].map(option => (
                <button
                  key={option}
                  onClick={() => setType(option)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    type === option
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? "Launching Interview..." : "Start Interview"}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Powered by MockMate AI • Smart Interview Practice Platform
          </p>

        </div>
      </div>
    </div>
  );
}

export default SetupPage;