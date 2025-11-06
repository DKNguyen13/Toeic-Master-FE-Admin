import React from "react";
import { FaRegClock, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

interface HistoryTestCardProps {
  id: string; // sessionCode hoặc sessionId
  title: string; // Tên bài test
  totalScore?: number; // Điểm doi voi bai thi full test
  result: number; // ket qua hoan thanh bao nhieu cau vd: 4/6
  totalQuestions: number; // tong so cau hoi cua bai test/practice
  accuracy?: number; // Độ chính xác (%)
  time: string; // Thời gian làm bài (hoặc thời lượng)
  createdAt: string; // Ngày làm
  sessionType: string; // "practice" | "full"
}

const HistoryTestCard: React.FC<HistoryTestCardProps> = ({
  id,
  title,
  totalScore,
  result,
  totalQuestions,
  accuracy,
  time,
  createdAt,
  sessionType,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const typeLabel =
    sessionType === "practice"
      ? "Luyện tập"
      : sessionType === "full-test"
      ? "Full test"
      : "Khác";

  return (
    <div
      className="
        bg-white border border-gray-200 
        shadow-sm rounded-lg p-4 
        flex flex-col gap-2
        transition-transform duration-300 
        hover:shadow-md hover:-translate-y-1
      "
    >
      {/* Tiêu đề */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            sessionType === "full-test"
              ? "bg-blue-100 text-orange-600"
              : "bg-green-100 text-green-700"
          }`}
        >
          {typeLabel}
        </span>
      </div>

      {/* Thông tin kết quả */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <p>
          Kết quả:{" "}
          <span className="text-blue-600 font-semibold">
            {`${result} / ${totalQuestions}`}
          </span>
          {sessionType === "full-test" && (
            <span className="ml-2 text-orange-600 font-semibold">
              (Điểm: {totalScore ?? "—"})
            </span>
          )}
        </p>
        <p>
          Độ chính xác:{" "}
          <span className="text-green-600 font-semibold">
            {accuracy ? `${accuracy}%` : "—"}
          </span>
        </p>
      </div>

      {/* Thời gian & ngày làm */}
      <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FaRegClock /> {time}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt /> {formattedDate}
          </span>
        </div>

        <Link to={`/session/${id}/results`}>
          <button
            className="
              bg-blue-600 text-white px-4 py-1.5 text-sm rounded 
              hover:bg-blue-700 transition-colors duration-300
            "
          >
            Xem chi tiết
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HistoryTestCard;
