import React, { useState, useEffect } from "react";
import { Question } from "../interface/interfaces";

interface NavigationProps {
  isView: boolean;
  questions: Question[];
  currentPart: number;
  currentQuestion: number;
  answers?: (string | null)[]; // ✅ cho phép optional
  onNavigate: (indexInPart: number) => void;
  onSubmit?: () => void;
  time?: number;
}

const Navigation: React.FC<NavigationProps> = ({
  isView,
  questions,
  currentPart,
  currentQuestion,
  answers,
  onNavigate,
  onSubmit,
  time,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const hasTime = typeof time === "number" && time > 0;
  const [remainingTime, setRemainingTime] = useState(hasTime ? time * 60 : 0);

  useEffect(() => {
    if (typeof time === "number" && time > 0) {
      setRemainingTime(time * 60);
    }
  }, [time]);

  // 🔹 Đếm ngược thời gian
  useEffect(() => {
    if (!isView && hasTime && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onSubmit) onSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isView, hasTime, remainingTime, onSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // 🔹 Lọc câu hỏi thuộc part hiện tại
  const questionsInPart = questions.filter((q) => q.partNumber === currentPart);

  // 🔹 Hiển thị nút câu hỏi
  const renderQuestionButtons = () =>
    questionsInPart.map((q, idx) => {
      // ✅ Kiểm tra có câu trả lời hay không, an toàn hơn
      const answered =
        Array.isArray(answers) &&
        typeof answers[q.globalQuestionNumber - 1] === "string" &&
        answers[q.globalQuestionNumber - 1] != "";

      return (
        <button
          key={q._id}
          onClick={() => onNavigate(idx)}
          className={`border rounded-md text-center text-sm p-1 transition-all duration-200
            ${
              currentQuestion === idx
                ? "bg-blue-500 text-white"
                : answered
                ? "bg-green-500 text-white"
                : "hover:bg-blue-500 hover:text-white"
            }`}
        >
          {q.globalQuestionNumber}
        </button>
      );
    });

  return (
    <div className="max-w-xs mx-auto p-4 bg-white h-full bottom-5 w-44">
      <div className="space-y-4">
        {/* 🔹 Đếm giờ chỉ hiện khi đang làm bài */}
        {!isView && hasTime && (
          <div className="flex justify-between mb-4">
            <span className="text-sm">Thời gian còn lại:</span>
            <span className="font-semibold text-xl text-blue-600">
              {remainingTime > 0 ? formatTime(remainingTime) : "Hết giờ"}
            </span>
          </div>
        )}

        {/* 🔹 Chế độ fullscreen */}
        {!isView && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={toggleFullScreen}
              className="text-sm text-blue-500 hover:underline"
            >
              {isFullScreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            </button>
          </div>
        )}

        {/* 🔹 Danh sách câu hỏi */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {renderQuestionButtons()}
        </div>

        {/* 🔹 Nút nộp bài */}
        {!isView && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                if (onSubmit) onSubmit();
              }}
              className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600"
            >
              Nộp bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
