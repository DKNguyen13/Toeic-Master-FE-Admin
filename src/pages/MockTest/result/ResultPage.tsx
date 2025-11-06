import React from "react";
import Result from "./Result";
import { useResult } from "../hooks/useTestSession";

const ResultPage: React.FC = () => {
  const {
    loading,
    error,
    resultData
  } = useResult();

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!resultData) return <p className="text-center">No result found</p>;

  return (
    <Result
      id = {resultData.id}
      testTitle={resultData.test.title}
      totalQuestions={resultData.results.totalQuestions}
      correctAnswers={resultData.results.correctCount}
      wrongAnswers={resultData.results.incorrectCount}
      skippedQuestions={resultData.results.skippedCount}
      totalScore={resultData.results.totalScore}
      listeningScore={resultData.results.listeningScore}
      readingScore={resultData.results.readingScore}
      isFullTest= {resultData.sessionType?.toLowerCase() === 'full-test'}
    />
  );
};

export default ResultPage;
