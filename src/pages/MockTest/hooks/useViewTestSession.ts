import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSessionResults } from "../../../service/sessionService";
import { Question, UserAnswer } from "../interface/interfaces";
import { da } from "date-fns/locale";

export const useViewSession = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [parts, setParts] = useState<number[]>([]);
  const [currentPart, setCurrentPart] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {id} = useParams();

  useEffect(() => {

    if (!id) {
      setError("Không tìm thấy bài thi");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getSessionResults(id);
        console.log(data.answers);
        // ✅ Kiểm tra dữ liệu hợp lệ
        if (!data || !data.session || !Array.isArray(data.answers) || data.answers.length === 0) {
          setError("Không tìm thấy dữ liệu cho bài thi này");
          return;
        }

        // lưu session info
        setSession(data.session);

        // Chuẩn bị dữ liệu câu hỏi từ UserAnswer[]
        const qs: Question[] = data.answers.map((ans: UserAnswer) => {
          const q = ans.questionId;
          return {
            _id: q._id,
            questionNumber: q.questionNumber,
            globalQuestionNumber: ans.questionNumber,
            question: ans.questionId.question,
            partNumber: q.partNumber,
            group: q.group,
            choices: q.choices,
            userAnswer: {
              selectedAnswer: ans.selectedAnswer,
              timeSpent: ans.timeSpent,
              isSkipped: ans.isSkipped,
              isFlagged: ans.isFlagged,
            },
          };
        });

        setQuestions(qs);

        // Lấy các part có trong câu hỏi
        const allParts = Array.from(new Set(qs.map((q) => q.partNumber))).sort(
          (a, b) => a - b
        );
        setParts(allParts);
        setCurrentPart(allParts[0] || 1);

        // Tạo map đáp án người dùng & đáp án đúng
        const userAns: Record<string, string | null> = {};
        const correctAns: Record<string, string> = {};

        data.answers.forEach((ans: UserAnswer) => {
          const qId = ans.questionId._id;
          userAns[qId] = ans.selectedAnswer;
          correctAns[qId] = ans.questionId.correctAnswer;
        });

        setUserAnswers(userAns);
        setCorrectAnswers(correctAns);

      } catch (err) {
        setError("Không thể tải dữ liệu bài thi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Điều hướng câu hỏi trong part
  const handleNavigateQuestion = (indexInPart: number) => {
    const questionsInPart = questions.filter((q) => q.partNumber === currentPart);
    setCurrentQuestion(indexInPart);
    const element = document.getElementById(
      `question-${questionsInPart[indexInPart].globalQuestionNumber}`
    );
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleNextPart = async () => {
      const nextPartIndex = parts.indexOf(currentPart) + 1;
      if (nextPartIndex < parts.length) {
        setCurrentPart(parts[nextPartIndex]);
        setCurrentQuestion(0);
      }
    };

  const handleGoBack = () => navigate(-1);

  //Tạo danh sách câu hỏi cho part hiện tại
  const questionsInPart = questions
    .filter((q) => q.partNumber === currentPart)
    .map((q) => ({
      ...q,
      choices: q.choices.map((c) => ({
        ...c,
        isUserChoice: c.label === userAnswers[q._id],
        isCorrect: c.label === correctAnswers[q._id],
      })),
    }));

  return {
    loading,
    error,
    session,
    parts,
    currentPart,
    currentQuestion,
    questionsInPart,
    handleNavigateQuestion,
    handleGoBack,
    setCurrentPart,
    setCurrentQuestion,
    handleNextPart
  };
};
