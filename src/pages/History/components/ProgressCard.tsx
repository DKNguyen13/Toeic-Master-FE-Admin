import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ProgressCardProps {
  progress: number; // Giá trị tiến độ (0-100)
  level: string; // Cấp độ hiện tại (A1, A2, B1, ...)
  totalTests: number; // Số bài thi đã thực hiện
  averageScore: number; // Điểm trung bình
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  level,
  totalTests,
  averageScore,
}) => {
  const levelClass = level === "A1" ? "text-yellow-500" : "text-gray-500"; // Áp dụng màu cho cấp độ
  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Cấp độ hiện tại</h2>
        <div className={`text-xl font-bold ${levelClass}`}>{level}</div>
      </div>
      <div className="flex justify-center mt-4">
        <div style={{ width: 120, height: 120 }}>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            strokeWidth={10}
            styles={{
              path: {
                stroke: "#3b82f6", // Màu đường tiến độ
              },
              text: {
                fill: "#3b82f6", // Màu chữ
                fontSize: "24px",
                fontWeight: "bold",
              },
            }}
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Số bài thi đã thực hiện: {totalTests}</p>
        <p className="text-gray-600">Điểm trung bình: {averageScore}</p>
      </div>
    </div>
  );
};

export default ProgressCard;
