import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  SkipForward,
  Send,
  BarChart3,
  LogOut,
  Clock
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
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewTime, setInterviewTime] = useState(0);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const interviewIntervalRef = useRef(null);

  useEffect(() => {
    interviewIntervalRef.current = setInterval(() => {
      setInterviewTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interviewIntervalRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [answer]);

  useEffect(() => {
    if (!currentQuestion) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  }, [currentQuestion]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer((prev) => prev + finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    setIsRecording(true);
    setRecordingTime(0);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  };

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
      clearInterval(interviewIntervalRef.current);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endSession = () => {
    if (isRecording) stopRecording();
    clearInterval(interviewIntervalRef.current);
    setInterviewData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">

      {/* Navbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-8 py-4 md:py-5 bg-black/40 backdrop-blur-md border-b border-white/10">

        <div className="text-2xl md:text-3xl text-white font-bold tracking-wide">
          MockMate <span className="text-indigo-400">AI</span>
        </div>

        <div className="flex flex-wrap gap-3 md:gap-6 text-white text-xs md:text-sm items-center">

          <div>Total: {totalQuestions}</div>
          <div>Skipped: {skippedCount}</div>

          <div className="flex items-center gap-2 bg-indigo-600 px-3 md:px-4 py-2 rounded-xl">
            <Clock size={16} />
            {formatTime(interviewTime)}
          </div>

          <button
            onClick={endSession}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all duration-200 px-3 md:px-4 py-2 rounded-xl"
          >
            <LogOut size={16} />
            End
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-4 md:p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-5 md:p-8">

          {!isFinished ? (
            <>
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Question {totalQuestions}
              </h2>

              <p
                key={currentQuestion}
                className="text-gray-800 text-base md:text-lg mb-6"
              >
                {currentQuestion}
              </p>

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

              {/* Voice Controls */}
              <div className="mb-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 transition-all duration-200 text-white px-4 py-2 rounded-xl"
                  >
                    <Mic size={16} />
                    Record
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="text-red-500 font-semibold animate-pulse">
                      Listening... ({formatTime(recordingTime)})
                    </span>

                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all duration-200 text-white px-4 py-2 rounded-xl"
                    >
                      <Square size={16} />
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
                className="w-full border rounded-xl p-4 mb-6 resize-none overflow-hidden min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                

                <div className="flex flex-row sm:flex-row gap-4">
                  <button
                    onClick={skipQuestion}
                    className="flex items-center w-full justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                  >
                    <SkipForward size={16} />
                    Skip
                  </button>

                  <button
                    onClick={submitAnswer}
                    className="flex items-center w-full justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                  >
                    <Send size={16} />
                    Submit
                  </button>

                  
                </div>
                <button
                  onClick={getFeedback}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition-all duration-200 text-white px-6 py-2 rounded-xl"
                >
                  <BarChart3 size={16} />
                  Get Feedback
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
                Final Evaluation
              </h2>

              <div className="bg-gray-100 p-4 md:p-6 rounded-xl whitespace-pre-wrap">
                {finalReport}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;