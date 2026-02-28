import { useState } from "react";
import { Code2, User2 } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 sm:px-6 py-6">

      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-200 to-indigo-500 text-white p-8 md:p-12 flex flex-col justify-center hidden md:flex">
          <h1 className="text-4xl md:text-5xl text-[#182337] font-bold mb-4">
            MockMate AI
          </h1>

          <h2 className="text-xl md:text-2xl font-semibold mb-6 opacity-95">
            Your Personal AI Interview Coach
          </h2>

          <p className="text-base md:text-lg opacity-90 leading-relaxed mb-8">
            Practice realistic mock interviews tailored to your skills.
            Get instant feedback. Improve faster. Land your dream job.
          </p>

          <div className="space-y-3 text-sm opacity-85">
            <p>- Unlimited Practice Sessions</p>
            <p>- Technical & HR Interviews</p>
            <p>- Smart AI Feedback</p>
            <p>- Domain-Based Questioning</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12">

          <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800">
            Start Your Mock Interview
          </h2>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Your Skills
            </label>
            <input
              type="text"
              placeholder="Java, React, SQL, Python"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p className="text-xs text-gray-400 mt-2">
              Comma-separated list of technologies
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-600">
              Difficulty Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {["Basic", "Medium", "Advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex flex-col items-start px-4 py-3 rounded-xl transition w-full ${
                    difficulty === level
                      ? level === "Basic"
                        ? "bg-green-500 text-white shadow"
                        : level === "Medium"
                        ? "bg-yellow-500 text-white shadow"
                        : "bg-red-500 text-white shadow"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <div className="font-semibold">{level}</div>
                  <span className="text-xs mt-1 opacity-80">
                    {level === "Basic" && "Fundamentals & core concepts"}
                    {level === "Medium" && "Applied knowledge & scenarios"}
                    {level === "Advanced" && "System design & deep expertise"}
                  </span>
                </button>
              ))}

            </div>
          </div>

          {/* Interview Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-gray-600">
              Interview Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <button
                onClick={() => setType("Technical")}
                className={`flex flex-col items-start px-4 py-3 rounded-xl transition w-full ${
                  type === "Technical"
                    ? "bg-[#182337] text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Code2 size={18} />
                  Technical
                </div>
                <span className="text-xs mt-1 opacity-80">
                  Coding, system design, algorithms
                </span>
              </button>

              <button
                onClick={() =>
                  setType(
                    "Generate a practical HR/Behavioral interview question that tests soft skills, decision-making, teamwork, and real-life problem handling. difficulty level- very simple and easy."
                  )
                }
                className={`flex flex-col items-start px-4 py-3 rounded-xl transition w-full ${
                  type ===
                  "Generate a practical HR/Behavioral interview question that tests soft skills, decision-making, teamwork, and real-life problem handling. difficulty level- very simple and easy."
                    ? "bg-[#182337] text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <User2 size={18} />
                  HR / Behavioral
                </div>
                <span className="text-xs mt-1 opacity-80">
                  Soft skills, leadership, culture fit
                </span>
              </button>

            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-[#6565ff] text-white py-4 rounded-xl text-lg font-medium hover:bg-[#182337] transition disabled:opacity-50 shadow-lg"
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