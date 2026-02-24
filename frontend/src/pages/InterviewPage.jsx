import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  SkipForward,
  Send,
  BarChart3,
  LogOut
} from "lucide-react";
import API from "../services/api";

function InterviewPage({ interviewData, setInterviewData }) {
  const interviewId = interviewData?.interviewId;

  const [currentQuestion, setCurrentQuestion] = useState(
    interviewData?.question || "Loading..."
  );
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalReport, setFinalReport] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // =============================
  // AUTO RESIZE TEXTAREA
  // =============================
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [answer]);

  // =============================
  // TEXT TO SPEECH
  // =============================
  useEffect(() => {
    if (!currentQuestion) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  }, [currentQuestion]);

  // =============================
  // INIT SPEECH RECOGNITION
  // =============================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  // =============================
  // SUBMIT ANSWER
  // =============================
  const submitAnswer = async () => {
    if (!answer.trim() || loading || isFinished) return;
    if (isRecording) stopRecording();

    try {
      setLoading(true);
      setIsTyping(true);

      const res = await API.post("/answer", {
        interviewId,
        answer
      });

      setTimeout(() => {
        if (res.data.nextQuestion) {
          setCurrentQuestion(res.data.nextQuestion);
          setTotalQuestions((prev) => prev + 1);
        }
        setIsTyping(false);
      }, 1000);

      setAnswer("");
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    if (loading || isFinished) return;
    if (isRecording) stopRecording();

    try {
      setLoading(true);
      setIsTyping(true);

      const res = await API.post("/answer", {
        interviewId,
        answer: "__SKIPPED__"
      });

      setTimeout(() => {
        if (res.data.nextQuestion) {
          setCurrentQuestion(res.data.nextQuestion);
          setTotalQuestions((prev) => prev + 1);
          setSkippedCount((prev) => prev + 1);
        }
        setIsTyping(false);
      }, 1000);

      setAnswer("");
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async () => {
    if (loading || isFinished) return;
    if (isRecording) stopRecording();

    try {
      setLoading(true);

      if (answer.trim()) {
        await API.post("/answer", {
          interviewId,
          answer
        });
      }

      const res = await API.post("/finish", { interviewId });
      setFinalReport(res.data.finalReport);
      setIsFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    if (isRecording) stopRecording();
    setInterviewData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-5 bg-black/40 backdrop-blur-md border-b border-white/10">
        <h1 className="text-white text-3xl font-semibold">
          MockMate AI
        </h1>

        <div className="flex gap-6 text-white text-sm items-center">
          <div>Total: {totalQuestions}</div>
          <div>Skipped: {skippedCount}</div>

          <button
            onClick={endSession}
            className="flex items-center cursor-pointer gap-2 bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-xl"
          >
            <LogOut size={18} />
            End
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8">

          {!isFinished ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Question {totalQuestions}
              </h2>

              <p
                key={currentQuestion}
                className="text-gray-800 text-lg mb-6 animate-fadeIn"
              >
                {currentQuestion}
              </p>

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                  <span className="text-gray-500 text-sm ml-2">
                    MockMate is preparing next question...
                  </span>
                </div>
              )}

              {/* Voice Controls (Restored Clean Version) */}
              <div className="mb-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex cursor-pointer items-center gap-2 bg-blue-700 hover:bg-blue-800 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded-xl"
                  >
                    <Mic size={18} />
                    Record
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-red-500 font-semibold animate-pulse">
                      Listening...
                    </span>

                    <button
                      onClick={stopRecording}
                      className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-200 text-white px-4 py-2 rounded-xl"
                    >
                      <Square size={18} />
                      Stop
                    </button>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Speak or type your answer..."
                className="w-full border rounded-xl p-4 mb-6 resize-none overflow-hidden transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-between">
                <button
                  onClick={getFeedback}
                  className="flex cursor-pointer items-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                >
                  <BarChart3 size={18} />
                  Get Feedback
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={skipQuestion}
                    className="flex cursor-pointer items-center gap-2 bg-yellow-500 hover:bg-yellow-600 hover:scale-105 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                  >
                    <SkipForward size={18} />
                    Skip
                  </button>

                  <button
                    onClick={submitAnswer}
                    className="flex items-center cursor-pointer gap-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                  >
                    <Send size={18} />
                    Submit
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Final Evaluation
              </h2>

              <div className="bg-gray-100 p-6 rounded-xl whitespace-pre-wrap animate-fadeIn">
                {finalReport}
              </div>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default InterviewPage;