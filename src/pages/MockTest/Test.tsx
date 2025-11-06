import React, { useEffect } from "react";
import Navigation from "./component/Navigation";
import { useTestSession } from "./hooks/useTestSession";
import TestHeader from "./component/TestHeader";
import PartSelector from "./component/PartSelector";
import QuestionList from "./component/QuestionList";
import { useParams } from "react-router-dom";
import { useViewSession } from "./hooks/useViewTestSession";
import LoadingSkeleton from "../../components/common/LoadingSpinner/LoadingSkeleton";
import { useBlockNavigation } from "./hooks/useBlockNavigation";

interface TestProps {
  isView: boolean; // true: review detail result
}

export const Test: React.FC<TestProps> = ({ isView }) => {
  //Chọn hook theo mode
  const hookData = isView ? useViewSession() : useTestSession();

  const {
    session,
    parts,
    currentPart,
    setCurrentPart,
    currentQuestion,
    setCurrentQuestion,
    questionsInPart,
    handleNavigateQuestion,
    handleGoBack,
    loading,
    error,
    // Các ham trong useTestSession
    handleAnswer,
    handleNextPart,
    handleSubmitSession,
    answers,
  } = hookData as ReturnType<typeof useTestSession> &
    ReturnType<typeof useViewSession>;

  useBlockNavigation(!isView, handleSubmitSession);

  useEffect(() => {
    if (!isView) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        event.returnValue = "";
        // Dòng này bắt buộc để trình duyệt hiển thị popup:
        // “Changes you made may not be saved. [Leave] [Cancel]”
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isView]);

  // ⚠️ 2. Cảnh báo khi bấm nút quay lại
  const handleBackClick = async () => {
    if (!isView) {
      const confirmExit = window.confirm(
        "Bạn có chắc muốn thoát không? Bài làm sẽ được nộp."
      );
      if (confirmExit) {
        await handleSubmitSession(true); // nộp bài nhung khong redirect den trang ket qua
        handleGoBack(); // quay lại trang trước
      }
    } else {
      handleGoBack();
    }
  };

  if (loading) {
    return <LoadingSkeleton/>
  }

   if (error) {
    return (
      <div className="flex justify-center items-center mt-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const isLastPart = parts.indexOf(currentPart) === parts.length - 1;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row justify-between flex-1 overflow-hidden">
        {/* Left: Main content */}
        <div className="flex-1 flex flex-col justify-start items-center p-4 overflow-auto">
          <TestHeader
            session={session}
            onGoBack={handleBackClick}
            isView={isView}
          />

          <PartSelector
            parts={parts}
            currentPart={currentPart}
            setCurrentPart={setCurrentPart}
            setCurrentQuestion={setCurrentQuestion}
          />

          <QuestionList
            questionsInPart={questionsInPart}
            answers={answers}
            handleAnswer={!isView ? handleAnswer : undefined}
            isView={isView}
          />

          {!isLastPart && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextPart}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Tiếp theo
              </button>
            </div>
          )}
        </div>

        {/* Right: Navigation */}
        <div className="p-4 bg-white h-full w-fit overflow-y-scroll">
          <Navigation
            isView={isView}
            time={session?.testConfig?.timeLimit ?? 0}
            questions={questionsInPart}
            currentPart={currentPart}
            currentQuestion={currentQuestion}
            answers={answers}
            onNavigate={handleNavigateQuestion}
            onSubmit={!isView ? handleSubmitSession : undefined}
          />
        </div>
      </div>
    </div>
  );
};
