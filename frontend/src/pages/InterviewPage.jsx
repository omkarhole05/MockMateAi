import { useState } from "react";
import API from "../services/api";

function InterviewPage({ interviewData, setInterviewData }) {

  const [interviewId] = useState(interviewData?.interviewId);
  const [currentQuestion, setCurrentQuestion] = useState(
    interviewData?.question || "Loading..."
  );

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalReport, setFinalReport] = useState("");

  // 🔥 NEW STATES
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [skippedCount, setSkippedCount] = useState(0);

  // =============================
  // SUBMIT ANSWER
  // =============================
  const submitAnswer = async () => {
    if (!answer.trim() || loading || isFinished) return;

    try {
      setLoading(true);

      const res = await API.post("/answer", {
        interviewId,
        answer
      });

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        setTotalQuestions(prev => prev + 1); // 🔥 increment total
      }

      setAnswer("");

    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // SKIP QUESTION
  // =============================
  const skipQuestion = async () => {
    if (loading || isFinished) return;

    try {
      setLoading(true);

      const res = await API.post("/answer", {
        interviewId,
        answer: "__SKIPPED__"
      });

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        setTotalQuestions(prev => prev + 1);  // 🔥 increment total
        setSkippedCount(prev => prev + 1);    // 🔥 increment skipped
      }

      setAnswer("");

    } catch (err) {
      console.error("Error skipping question:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FINISH INTERVIEW
  // =============================
  const finishInterview = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await API.post("/finish", {
        interviewId
      });

      setFinalReport(res.data.finalReport);
      setIsFinished(true);

    } catch (err) {
      console.error("Error finishing interview:", err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // END SESSION
  // =============================
  const endSession = () => {
    setInterviewData(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Top Navbar */}
      <div className="flex justify-between items-center px-8 py-5 bg-black/40 backdrop-blur-md border-b border-white/10">

        <h1 className="text-white text-3xl font-semibold">
          MockMate AI
        </h1>

        {/* 🔥 Live Stats */}
        <div className="flex items-center gap-6 text-sm text-white">

          <div className="bg-white/10 px-4 py-2 rounded-xl">
            Question No: {totalQuestions}
          </div>

          <div className="bg-yellow-500/80 px-4 py-2 rounded-xl">
            Skipped: {skippedCount}
          </div>

          <button
            onClick={endSession}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
          >
            End Session
          </button>

        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-6">

        <div className="w-full max-w-4xl h-[75vh] bg-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">

          {/* Question / Evaluation Area */}
          <div className="flex-1 flex items-center justify-center p-10">

            {!isFinished ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-2xl w-full">
                <h2 className="text-xl font-semibold mb-4">
                  Interview Question {totalQuestions}
                </h2>

                <p className="text-gray-700 text-lg leading-relaxed">
                  {currentQuestion}
                </p>

                {loading && (
                  <p className="text-gray-400 mt-4 animate-pulse">
                    AI is preparing next question...
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl w-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Final Evaluation
                </h2>

                <div className="mb-4 text-sm text-gray-600">
                  <p>Total Questions: {totalQuestions}</p>
                  <p>Skipped Questions: {skippedCount}</p>
                </div>

                <p className="text-gray-700 whitespace-pre-line">
                  {finalReport}
                </p>
              </div>
            )}

          </div>

          {/* Input Section */}
          {!isFinished && (
            <div className="border-t px-8 py-6 bg-gray-900">

              <textarea
                rows="3"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full resize-none bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-4"
              />

              <div className="flex justify-between items-center">

                <button
                  onClick={finishInterview}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  Get Feedback
                </button>

                <div className="flex gap-4">

                  <button
                    onClick={skipQuestion}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    Skip
                  </button>

                  <button
                    onClick={submitAnswer}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    Submit Answer
                  </button>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default InterviewPage;