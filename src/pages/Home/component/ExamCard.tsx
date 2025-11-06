import React from "react";
import { BookOpen, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExamCardProps {
  id: string | number; // Added id prop to identify the mock test
  title: string;
  image: string;
  questions: number;
  students: number;
  level: string;
}

const ExamCard: React.FC<ExamCardProps> = ({
  id,
  title,
  image,
  questions,
  students,
  level,
}) => {
  const navigate = useNavigate(); // useNavigate hook to navigate between routes

  const handleStart = () => {
    navigate(`/tests/${id}`); // Redirect to the mock-test page with the specific id
  };

  return (
    <div className="border rounded-xl shadow-md p-4 bg-white w-80">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold mt-3">{title}</h2>
      <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
        <BookOpen size={16} /> <span>Questions: {questions}</span>
        <Users size={16} className="ml-3" /> <span>Students: {students}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
        <Award size={16} /> <span className="font-medium">{level}</span>
      </div>
      <button
        onClick={handleStart}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all"
      >
        Luyện tập ngay
      </button>
    </div>
  );
};

export default ExamCard;
