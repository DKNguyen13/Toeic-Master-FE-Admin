import DetailToeicTest from "./DetailTest.js";
import { useLocation, useParams } from "react-router-dom";
import { useTestData, useStartTest } from "../../hooks/useTestData.js";
import LoadingSkeleton from "../../components/common/LoadingSpinner/LoadingSkeleton.js";

const sampleComments = [
  {
    id: "1",
    user: "John Doe",
    date: "2024-01-15",
    text: "This test really helped me improve my listening skills. The explanations are clear and detailed.",
    pinned: true,
  },
  {
    id: "2",
    user: "Sarah Kim",
    date: "2024-01-14",
    text: "Part 7 reading passages are challenging but realistic. Great practice for the actual TOEIC exam.",
  },
  {
    id: "3",
    user: "Mike Chen",
    date: "2024-01-13",
    text: "The timer feature is very helpful for practice. I can focus on specific parts that need improvement.",
  },
];

function MockDetailTests() {
  const { slug } = useParams();
  const location = useLocation();
  const totalAttempts = location.state?.attempts ?? 0;

  const { testData, loading, error } = useTestData(slug);
  const {
    selectedParts,
    setSelectedParts,
    selectedTime,
    setSelectedTime,
    handleStartPractice,
    sessionLoading,
    sessionError,
    showLoginModal,
    setShowLoginModal
  } = useStartTest(testData);

  if (loading) {
    return <LoadingSkeleton/>
  }

  if (error) {
    return (
      <div className="flex justify-center items-center mt-12">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  console.log('Test data: ', testData);
  return (
    <div className="min-h-screen bg-background">
      <DetailToeicTest
        testName={testData.data.test.title}
        durationMinutes={120}
        totalParts={7}
        totalQuestions={200}
        practicedCount={totalAttempts}
        commentsCount={testData.data.test.statistics?.totalComments || 0}
        parts={testData.data.parts}
        defaultActiveTab="practice"
        selectedParts={selectedParts}
        setSelectedParts={setSelectedParts}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        onStartPractice={handleStartPractice}
        sessionLoading={sessionLoading}
        sessionError={sessionError}
        comments={sampleComments}
        testId={testData.data.test._id}
        showLoginModal = {showLoginModal}
        setShowLoginModal = {setShowLoginModal}
      />
    </div>
  );
}

export default MockDetailTests;
