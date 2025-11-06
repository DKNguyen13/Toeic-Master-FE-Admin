import React from "react";
import QuestionItem from "./QuestionItem";

interface QuestionListProps {
  isView: boolean;
  questionsInPart: any[];
  answers: (string | null)[];
  handleAnswer?: (questionIndex: number, optionIndex: number) => void;
}

const groupQuestions = (questions: any[]) => {
  const groups: Record<string, any[]> = {};
  const singles: any[] = [];

  questions.forEach((q) => {
    if ([3, 4, 6, 7].includes(q.partNumber) && q.group.groupId) {
      const groupId = q.group.groupId;
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(q);
    } else {
      singles.push(q); // câu đơn lẻ: part 1,2,5
    }
  });

  return { groups: Object.values(groups), singles };
};

const QuestionList: React.FC<QuestionListProps> = ({
  questionsInPart,
  answers,
  handleAnswer,
  isView,
}) => {
  const { groups, singles } = groupQuestions(questionsInPart);

  return (
    <div className="w-full max-w-7xl">
      {/* Nhóm câu (Part 3,4,6,7) */}
      {groups.map((group) => {
        const firstQuestion = group[0];
        const hasImage = !!firstQuestion.group.image;

        return (
          <div
            key={firstQuestion._id}
            className={`mb-6 flex flex-col md:flex-row gap-4 border-b border-gray-200 pb-4`}
          >
            {/* Nếu có ảnh thì hiển thị ảnh bên trái */}
            {hasImage && (
              <div className="md:w-1/2 w-full overflow-auto max-h-[600px] flex justify-center items-center">
                <img
                  src={firstQuestion.group.image}
                  alt={`group-${firstQuestion.group.groupId}`}
                  className="rounded-lg max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Nội dung câu: chiếm 1/2 nếu có ảnh, full width nếu không */}
            <div
              className={`flex flex-col gap-4 pr-2 ${
                hasImage
                  ? "md:w-1/2 w-full overflow-auto max-h-[600px]"
                  : "w-full"
              }`}
            >
              {group.map((question) => (
                <QuestionItem
                  key={question._id}
                  isView={isView}
                  question={question}
                  questionIndex={questionsInPart.findIndex(
                    (q) => q._id === question._id
                  )}
                  answers={answers}
                  handleAnswer={handleAnswer}
                  hideImage={hasImage} // nếu có ảnh thì ẩn ảnh trong QuestionItem
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Các câu đơn lẻ (Part 1,2,5) */}
      <div className="w-full flex flex-col gap-6">
        {singles.map((question) => (
          <div key={question._id} className="w-full max-w-4xl mx-auto px-4">
            <QuestionItem
              isView={isView}
              question={question}
              questionIndex={questionsInPart.findIndex(
                (q) => q._id === question._id
              )}
              answers={answers}
              handleAnswer={handleAnswer}
              hideImage={false} // vẫn hiển thị ảnh nếu có
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
