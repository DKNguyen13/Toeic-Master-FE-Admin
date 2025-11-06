import React from "react";
import ExamCard from "../../Home/component/ExamCard";
import { toeicTests } from "../../../data/toeicMockData";

const MostSolvedExam = () => {
  const examData = toeicTests;
  return (
    <div>
        <h1 className="text-2xl mb-1">Danh sách đã làm nhiều nhất</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 gap-y-12 mb-12 justify-center items-center">
            {examData.map((item, index) => (
              <ExamCard
                id={item.id}
                title={item.title}
                image={item.image}
                questions={item.questions}
                students={item.students}
                level={item.level}
              />
            ))}
        </div>
    </div>
  );
};

export default MostSolvedExam
