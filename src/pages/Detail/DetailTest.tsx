import React, { useState } from "react";
import {
  Clock,
  BookOpen,
  Users,
  MessageCircle,
  CheckCircle,
  Info,
  Pin,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import CommentSection from "../../components/Comment/CommentSection";
import LoginModal from "../../layouts/common/LoginModal";
import { ToastContainer } from "react-toastify";

type Comment = {
  _id: string;
  content: string;
  noOfLikes: number;
  noOfChildren: number;
};

type ToeicTestProps = {
  testName: string;
  durationMinutes: number;
  totalParts: number;
  totalQuestions: number;
  practicedCount: number;
  commentsCount: number;
  parts: Array<{
    _id: number;
    title: string;
    partNumber: number;
    totalQuestions: number;
    tags: string[];
  }>;
  comments: Comment[]; // list of comments to display
  defaultActiveTab?: "practice" | "fulltest" | "discussion";

  // props từ DetailTestPage
  selectedParts: number[];
  setSelectedParts: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectedTime: number;
  setSelectedTime: React.Dispatch<React.SetStateAction<number>>;
  onStartPractice: (mode?: "practice" | "fulltest") => void;
  sessionLoading?: boolean;
  sessionError?: string | null;
  showLoginModal: boolean;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  testId: string;
};

type TabType = "practice" | "fulltest" | "discussion";

const DetailToeicTest: React.FC<ToeicTestProps> = ({
  testName,
  durationMinutes = 120,
  totalParts = 7,
  totalQuestions = 200,
  practicedCount,
  commentsCount,
  parts,
  defaultActiveTab = "practice",
  selectedParts,
  setSelectedParts,
  selectedTime,
  setSelectedTime,
  onStartPractice,
  sessionLoading,
  sessionError,
  showLoginModal,
  setShowLoginModal,
  testId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultActiveTab);
  const handlePartToggle = (partNumber: number) => {
    if (selectedParts.includes(partNumber)) {
      // Bỏ phần đã chọn
      setSelectedParts(selectedParts.filter((id) => id !== partNumber));
    } else {
      // Thêm phần mới
      setSelectedParts([...selectedParts, partNumber]);
    }
  };

  const generateTimeOptions = () => {
    const options = [] as { value: number; label: string }[];
    for (let i = 0; i <= 135; i += 5) {
      options.push({
        value: i,
        label: i === 0 ? "Unlimited" : `${i} minutes`,
      });
    }
    return options;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const tabs = [
    { id: "practice" as TabType, label: "Luyện tập", icon: BookOpen },
    { id: "fulltest" as TabType, label: "Thi thử", icon: Clock },
    { id: "discussion" as TabType, label: "Thảo luận", icon: MessageCircle },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Top Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {testName}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Thời gian: {durationMinutes} phút
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">
                  {totalParts} phần, {totalQuestions} câu hỏi
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(practicedCount)}
                  </div>
                  <div className="text-sm text-gray-500">lượt luyện tập</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(commentsCount)}
                  </div>
                  <div className="text-sm text-gray-500">bình luận</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Note */}
        <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-r-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-900">
              Để có kết quả quy đổi điểm chuẩn (ví dụ: thang điểm 990 cho
              TOEIC), vui lòng chọn chế độ <strong>THI THỬ</strong>.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div
            className="flex border-b border-gray-200"
            role="tablist"
            aria-label="Test modes"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Practice Tab */}
            {activeTab === "practice" && (
              <div
                role="tabpanel"
                id="practice-panel"
                aria-labelledby="practice-tab"
                className="space-y-6"
              >
                {/* Pro Tips */}
                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-600 mb-1">
                        Mẹo luyện thi
                      </h3>
                      <p className="text-sm text-gray-900">
                        Luyện tập theo từng phần và chọn thời gian phù hợp sẽ
                        giúp bạn tập trung trả lời chính xác thay vì bị áp lực
                        hoàn thành toàn bộ bài thi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parts Checklist */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chọn phần muốn luyện tập
                  </h3>
                  <div className="grid gap-3">
                    {parts.map((part) => (
                      <div
                        key={part._id}
                        className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={`part-${part._id}`}
                          checked={selectedParts.includes(part.partNumber)}
                          onChange={() => handlePartToggle(part.partNumber)}
                          className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 focus:ring-2"
                          aria-describedby={`part-${part._id}-description`}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`part-${part._id}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {part.title} ({part.totalQuestions} câu hỏi)
                          </label>
                          {part.tags.length > 0 && (
                            <div
                              id={`part-${part._id}-description`}
                              className="flex flex-wrap gap-1 mt-2"
                            >
                              {part.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer Selector */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Giới hạn thời gian
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:w-64">
                      <Select
                        value={String(selectedTime)} // convert để match Select yêu cầu string
                        onValueChange={(val) => setSelectedTime(Number(val))} // convert lại thành number
                        placeholder="Chọn thời gian"
                        options={generateTimeOptions().map((opt) => ({
                          value: String(opt.value),
                          label:
                            opt.label === "Unlimited"
                              ? "Không giới hạn"
                              : `${opt.value} phút`,
                        }))}
                      />
                    </div>
                    <Button
                      onClick={() => onStartPractice("practice")}
                      disabled={selectedParts.length === 0 || sessionLoading}
                      className="w-full sm:w-auto"
                    >
                      {sessionLoading
                        ? "Đang khởi tạo..."
                        : "Bắt đầu luyện tập"}
                    </Button>
                  </div>
                  {sessionError && (
                    <p className="text-red-500 text-sm">{sessionError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Full Test Tab */}
            {activeTab === "fulltest" && (
              <div
                role="tabpanel"
                id="fulltest-panel"
                aria-labelledby="fulltest-tab"
                className="text-center py-12"
              >
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chế độ thi thử
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Làm toàn bộ bài thi {testName} trong điều kiện tính giờ. Kết
                  quả của bạn sẽ được quy đổi sang thang điểm 990.
                </p>

                <Button
                  onClick={() => onStartPractice("fulltest")}
                  disabled={sessionLoading}
                  className="mt-4 w-full sm:w-auto"
                >
                  {sessionLoading ? "Đang khởi tạo..." : "Bắt đầu thi thử"}
                </Button>
                {sessionError && (
                  <p className="text-red-500 text-sm mt-2">{sessionError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Discussion Tab */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="mt-3 mb-5">
              <CommentSection testId={testId} comments={[]} />
            </div>
          </div>
        </div>
      </div>

      <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={() => window.location.reload()}/>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default DetailToeicTest;
