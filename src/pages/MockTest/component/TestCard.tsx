// import React from "react";
// import { BookOpen, Users, Timer, MessageSquare } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface TestCardProps {
//   slug: string; // prop to identify the toeic test
//   title: string;
//   questions: number;
//   time: number; // time in minutes
//   attempts: number;
//   totalComments: number;
// }

// const TestCard: React.FC<TestCardProps> = ({
//   slug,
//   title,
//   questions,
//   time,
//   attempts,
//   totalComments,
// }) => {
//   const navigate = useNavigate(); // useNavigate hook to navigate between routes

//   const handleViewDetail = () => {
//     navigate(`/test/${slug}`, {
//       state: { attempts },
//     }); // Redirect to the mock-test page with the specific id
//   };

//   return (
//     <div
//       onClick={handleViewDetail}
//       className="cursor-pointer border rounded-xl shadow-md p-5 bg-white w-80
//                  hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-out
//                  flex flex-col justify-between"
//     >
//       {/* Tiêu đề */}
//       <div>
//         <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-4">
//           {title}
//         </h2>

//         {/* Grid thông tin */}
//         <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-600 text-sm">
//           <div className="flex items-center gap-1">
//             <BookOpen size={16} /> <span>{questions} câu hỏi</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Timer size={16} /> <span>{time} phút</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Users size={16} /> <span>{attempts} lượt làm</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <MessageSquare size={16} />
//             <span>{totalComments ?? 0} bình luận</span>
//           </div>
//         </div>
//       </div>

//       {/* Nút xem chi tiết */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           handleViewDetail();
//         }}
//         className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
//       >
//         Xem chi tiết
//       </button>
//     </div>
//   );
// };

// export default TestCard;

import React from "react";
import { BookOpen, Users, Timer, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestCardProps {
  slug: string;
  title: string;
  questions: number;
  time: number;
  attempts: number;
  totalComments: number;
}

const TestCard: React.FC<TestCardProps> = ({
  slug,
  title,
  questions,
  time,
  attempts,
  totalComments,
}) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/test/${slug}`, {
      state: { attempts },
    }); // Redirect to the mock-test page with the specific id
  };

  return (
    <div
      onClick={handleViewDetail}
      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 w-80
                 border border-gray-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10
                 transition-all duration-500 ease-out hover:-translate-y-2"
    >
      {/* Gradient Overlay - hiệu ứng khi hover với tone xanh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 
                      group-hover:from-blue-500/5 group-hover:to-blue-600/8 
                      transition-all duration-500" />
      
      {/* Accent Bar - xanh blue */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 
                      transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <div className="relative p-6 flex flex-col justify-between h-full">
        {/* Header Section */}
        <div>
          {/* Icon Badge - xanh blue */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 
                          shadow-lg shadow-blue-500/30 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <BookOpen size={24} className="text-white" />
          </div>

          {/* Title - hover với xanh blue */}
          <h2 className="text-xl font-bold text-gray-800 line-clamp-2 mb-5 
                         group-hover:text-blue-600
                         transition-all duration-300">
            {title}
          </h2>

          {/* Stats Grid - giữ màu icon gốc */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 
                           group-hover:bg-white/80 transition-colors duration-300">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-medium">{questions} câu hỏi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                  <Timer size={16} />
                </div>
                <span className="text-sm font-medium">{time} phút</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 
                           group-hover:bg-white/80 transition-colors duration-300">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-1.5 rounded-lg bg-green-100 text-green-600">
                  <Users size={16} />
                </div>
                <span className="text-sm font-medium">{attempts} lượt</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                  <MessageSquare size={16} />
                </div>
                <span className="text-sm font-medium">{totalComments ?? 0} bình luận</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button - xanh blue */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail();
          }}
          className="mt-6 w-full relative overflow-hidden group/btn
                     bg-gradient-to-r from-blue-600 to-blue-700 
                     text-white py-3.5 rounded-xl font-semibold
                     shadow-md shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                     transition-all duration-300
                     flex items-center justify-center gap-2"
        >
          <span className="relative z-10">Xem chi tiết</span>
          <ArrowRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" />
          
          {/* Button hover effect - tone xanh đậm hơn */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 
                         opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};

export default TestCard;