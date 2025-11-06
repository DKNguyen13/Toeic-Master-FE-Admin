import { useEffect, useState } from "react";
import { getTestDetail } from "../service/testService";
import { useNavigate } from "react-router-dom";
import { startSession } from "../service/sessionService";
import { isLoggedIn } from "../config/axios";

export const useTestData = (slug) => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const data = await getTestDetail(slug); //slug
        if (!data) {
          setError('Không tìm thấy bài thi');
          return;
        }
        setTestData(data);
      } catch (err) {
        setError('Không tìm thấy bài thi');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTestData();
    }
  }, [slug]);

  return { testData, loading, error };
}


export const useStartTest = (testData) => {

  const navigate = useNavigate();
  const [selectedParts, setSelectedParts] = useState([]);
  const [selectedTime, setSelectedTime] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStartPractice = async (mode = "practice") => {
    if (!testData) return;

    // check login
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    const payload = {
      testId: testData.data.test._id,
      sessionType: mode === "fulltest" ? "full-test" : "practice",
      selectedParts: mode === "fulltest" ? [1, 2, 3, 4, 5, 6, 7] : Array.from(selectedParts),
      timeLimit: mode === "fulltest" ? 120 : selectedTime > 0 ? selectedTime : null,
    };

    setSessionLoading(true);
    setSessionError(null);

    try {
      const session = await startSession(payload);
      localStorage.setItem('toeic-session-id', session.id);
      navigate(`/session/${session.id}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || // thông báo từ backend
        err.message ||                 // fallback từ Axios
        "Failed to start session";

      setSessionError(errorMessage);
    } finally {
      setSessionLoading(false);
    }
  };

  return {
    selectedParts,
    setSelectedParts,
    selectedTime,
    setSelectedTime,
    handleStartPractice,
    sessionLoading,
    sessionError,
    showLoginModal,
    setShowLoginModal,
  };
}


