import IcArrow from "../../assets/icons/IcArrow";
import { Link } from "react-router-dom";
import { NotepadText, CircleUserRound, NotebookPen } from 'lucide-react';
import BannerSlider from "./component/BannerSlider";
//import TestList from "../MockTest/TestList";

export interface Exam {
  id: number;
  title: string;
  image: string;
  questions: number;
  students: number;
  level: "Beginner" | "Intermediate" | "Advanced";
}

const Home = ({ setIsOpen }) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex bg-blue-500 gap-8 min-h-[35vh] pt-5 hidden">
        
        <div className="flex-[65%] pt-6 hidden md:block">
          {/* Left Section */}
          <div className="text-white space-y-6 ml-[12%] mt-[2%] p-6">
        <h2 className="text-4xl font-bold">
        Nền tảng thi thử TOEIC® trực tuyến miễn phí
        Kho đề "XỊN" & được cập nhật mới liên tục!
        </h2>

        <ul className="text-lg list-disc pl-10">
          <li>Tuyển tập những bộ đề gần với đề thi nhất từ nhiều nguồn</li>
          <li>Đánh giá đúng thực lực của người học & sát đề thi thật</li>
          <li>Chatbot hỗ trợ 24/7</li>
        </ul>
        <Link to={"/register"}>
          <button className="mt-5 bg-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition border border-orange-500">
            Bắt đầu ngay
          </button>
        </Link>
          </div>
        </div>
        
        <div className="flex-[35%] relative">
          <img 
          src="src/assets/images/banner-img.svg"
          className="h-[80%] absolute bottom-0 right-10"
        /> 
        </div>
      </div>

      <BannerSlider />

      {/* Features Section - Card-based layout like Login */}
      <div className="flex justify-center w-full py-16 bg-white">
        <div className="max-w-6xl w-full px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
        Tại sao chọn TOEIC MASTER?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
            {/* Feature Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-blue-600 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <NotebookPen size={30}/>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Luyện tập cá nhân hóa
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống bài tập đa dạng giúp bạn làm quen với cấu trúc đề thi
                TOEIC. Chọn chủ đề bạn muốn luyện tập và cải thiện từng kỹ năng
                một cách hiệu quả.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-blue-600 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <NotepadText size={30}/>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Thi thử TOEIC chuẩn
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bài thi thử với giao diện giống hệt bài thi thật, có chấm điểm 
                tự động và phân tích chi tiết kết quả để biết bạn cần cải thiện những gì.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-blue-600 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <CircleUserRound size={30}/>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Theo dõi tiến độ
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Xem điểm số và sự cải thiện qua từng bài thi thử. Phân tích điểm mạnh, 
                điểm yếu theo từng kỹ năng với gợi ý bài tập cá nhân hóa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Luyện tập Section */}
      <section className="flex justify-center mt-12 flex-col items-center">
        <div>
          <h1 className="w-full text-2xl font-bold text-gray-900 justify-start text-start items-start mb-3">
            Luyện tập
          </h1>
          {/* Test list */}
          {/* <TestList limit={4} showPagination={false} compact={true} /> */}
        </div>

        <Link to={"/tests"}>
          <button className="mt-6 px-8 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-700 hover:text-white border border-blue-600 focus:outline-none w-full max-w-[300px] flex mb-12">
            <div className=" justify-center w-full flex flex-row items-center">
              Xem thêm
              <div className="mx-2">
                <IcArrow />
              </div>
            </div>
          </button>
        </Link>
      </section>

      {/* Thi thử Section */}
      <section className="flex justify-between items-center p-10 bg-cover bg-center rounded-lg bg-[url(src/assets/images/mock-test-background.png)]">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-gray-900">Thi Thử</h2>
          <p className="text-lg text-gray-700 mt-4 leading-relaxed">
            Tham gia bài thi thử trực tuyến với giao diện giống hệt bài thi
            thật, giúp bạn làm quen với cấu trúc đề và đánh giá chính xác trình
            độ của mình.
          </p>
          <Link to={"/tests"}>
            <button className="mt-6 px-8 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none">
              Thi Thử Ngay
            </button>
          </Link>
        </div>
      </section>
      {/* Chatbot Section */}
      <section className="flex justify-between items-center p-10 bg-cover bg-center rounded-lg w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
          <div className="max-w-lg items-center align-center">
            <h2 className="text-4xl font-bold text-gray-900">
              Chatbot AI hỗ trợ
            </h2>
            <p className="text-lg text-gray-700 mt-4 leading-relaxed">
              Cần lời khuyên về cách làm bài TOEIC? Bạn có câu hỏi về ngữ pháp,
              từ vựng hay mẹo làm bài? Chatbot AI có thể giúp bạn ngay lập tức!
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="mt-6 px-8 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 focus:outline-none"
            >
              Trò chuyện ngay
            </button>
          </div>
          <div className="max-w-full">
            <img
              className="max-size-[200px]"
              src="src\assets\images\ai-image.png"
              alt="Chatbot AI"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
