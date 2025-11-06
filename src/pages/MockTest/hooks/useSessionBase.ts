import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Question, Session } from "../interface/interfaces";
import { getSession, getSessionQuestions } from "../../../service/sessionService";

export const useSessionBase = (sessionId: string | null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPart, setCurrentPart] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [parts, setParts] = useState<number[]>([]);

  useEffect(() => {

    const fetchData = async () => {
    
      try {
        setLoading(true);
        if (!sessionId) {
          setError("Không tìm thấy bài thi.");
          return;
        }
        const sessionData = await getSession(sessionId);
        if (!sessionData || !sessionData.session) {
          setError("Bài thi không tồn tại hoặc đã bị xóa.");
          return;
        }
        setSession(sessionData.session);

        const questionsData = await getSessionQuestions(sessionId);
        const qs: Question[] = questionsData.questions || [];
        console.log(questionsData);

        if (qs.length === 0) {
          setError("Không có câu hỏi nào trong bài thi này.");
          return;
        }

        setQuestions(qs);

        const allParts = Array.from(new Set(qs.map((q) => q.partNumber))).sort(
          (a, b) => a - b
        );
        setParts(allParts);
        setCurrentPart(allParts[0] || 1);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu bài thi. Vui lòng thử lại sau.");
      }
      finally{
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleNavigateQuestion = (indexInPart: number) => {
    const questionsInPart = questions.filter((q) => q.partNumber === currentPart);
    setCurrentQuestion(indexInPart);
    const element = document.getElementById(
      `question-${questionsInPart[indexInPart].globalQuestionNumber}`
    );
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleGoBack = () => navigate(-1);

  const questionsInPart = questions
    .filter((q) => q.partNumber === currentPart)
    .map((q) => {
      const isSimplePart = [1, 2].includes(q.partNumber);
      return {
        ...q,
        displayContent: isSimplePart ? null : q.question,
        displayImage: q.group?.image,
        displayChoices: q.choices.map((c) => ({
          ...c,
          displayText: isSimplePart ? c.label : `${c.label}. ${c.text}`,
        })),
      };
    });

  return {
    session,
    questions,
    parts,
    currentPart,
    currentQuestion,
    questionsInPart,
    setCurrentPart,
    setCurrentQuestion,
    handleGoBack,
    handleNavigateQuestion,
    loading,
    error
  };
};
