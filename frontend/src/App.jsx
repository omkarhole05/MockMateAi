import { useState } from "react";
import SetupPage from "./pages/SetupPage";
import InterviewPage from "./pages/InterviewPage";

function App() {
  const [interviewData, setInterviewData] = useState(null);

  return (
    <>
      {interviewData ? (
        <InterviewPage
          interviewData={interviewData}
          setInterviewData={setInterviewData}
        />
      ) : (
        <SetupPage setInterviewData={setInterviewData} />
      )}
    </>
  );
}

export default App;