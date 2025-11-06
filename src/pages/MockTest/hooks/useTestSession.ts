import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSessionResults, getSessionsUser, submitBulkAnswers, submitSession } from "../../../service/sessionService";
import { useSessionBase } from "./useSessionBase";


export const useTestSession = () => {

  const navigate = useNavigate();
  
  const sessionId = localStorage.getItem("toeic-session-id");

  const base = useSessionBase(sessionId);
  const {
    questions,
    currentPart,
    parts,
    setCurrentPart,
    setCurrentQuestion,
  } = base;

  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [unsentAnswers, setUnsentAnswers] = useState<
    { questionId: string; selectedAnswer: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indexToLetter = ["A", "B", "C", "D"];

  const handleAnswer = (indexInPart: number, answerIndex: number) => {
    const questionsInPart = questions.filter(
      (q) => q.partNumber === currentPart
    );
    const question = questionsInPart[indexInPart];
    
    if (!question) {
      console.error("Question not found at index:", indexInPart);
      return;
    }

    const selectedLetter = indexToLetter[answerIndex];
    
    // ✅ Lưu answer letter thay vì index
    const updatedAnswers = [...answers];
    updatedAnswers[question.globalQuestionNumber - 1] = selectedLetter;
    setAnswers(updatedAnswers);

    // ✅ Cập nhật unsent answers
    setUnsentAnswers((prev) => {
      const filtered = prev.filter((ans) => ans.questionId !== question._id);
      return [
        ...filtered,
        {
          questionId: question._id,
          selectedAnswer: selectedLetter,
          timeSpent: 0,  // TODO: Tính thời gian thực tế
        },
      ];
    });
  };

  const handleNextPart = async () => {
    try {
      setError(null); // reset lỗi cũ
      setLoading(true);
      const nextPartIndex = parts.indexOf(currentPart) + 1;
      if (nextPartIndex < parts.length) {
        // submit answers
        const questionsInCurrentPart = questions.filter(
          (q) => q.partNumber === currentPart
        );
        const answersToSubmit = unsentAnswers.filter((ans) =>
          questionsInCurrentPart.some((q) => q._id === ans.questionId)
        );

        if (answersToSubmit.length) {
          await submitBulkAnswers(sessionId!, answersToSubmit);
          setUnsentAnswers((prev) =>
            prev.filter(
              (ans) =>
                !answersToSubmit.some((s) => s.questionId === ans.questionId)
            )
          );
        }

        setCurrentPart(parts[nextPartIndex]);
        setCurrentQuestion(0);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi chuyển phần tiếp theo");
    }
    finally{
      setLoading(false);
    }
    
  };

  const handleSubmitSession = async (noRedirect = false) => {
    try {
      setError(null); // reset lỗi cũ
      setLoading(true);

      if (unsentAnswers.length) {
      await submitBulkAnswers(sessionId!, unsentAnswers);
      setUnsentAnswers([]);
      }
      await submitSession(sessionId!);
      if (!noRedirect) {
        navigate(`/session/${sessionId}/results`);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi chuyển phần tiếp theo");
    }
    finally{
      setLoading(false);
    }
    
  };

  return {
    ...base, // thừa kế từ useSessionBase
    answers,
    handleAnswer,
    handleNextPart,
    handleSubmitSession,
    loading,
    error
  };
};

export const useResult = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getSessionResults(id);
        
        const result = res.session;
        const answers = res.ansers;

        if (result) {
          setResultData(result);
        }
        if(answers) {
          setUserAnswers(answers);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    } else {
      setError("No session ID found");
      setLoading(false);
    }
  }, [id]);

  return {
    loading,
    error,
    resultData,
    userAnswers
  };
};

interface Pagination {
  current: number;
  pages: number;
  total: number;
}

export const useSessionsUser = (initialPage = 1, limit = 10) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: initialPage,
    pages: 1,
    total: 0,
  });
  
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getSessionsUser(page, limit); // gọi API có phân trang
        if(!res) {
          setError('Chưa có dữ liệu làm bài thi');
          return;
        }
        if (res?.sessions) {
          setSessions(res.sessions);
        }
        if (res?.pagination) {
          setPagination(res.pagination);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [page, limit]);

  return {
    loading,
    error,
    sessions,
    pagination,
    setPage, // Dùng để đổi trang
  };
};