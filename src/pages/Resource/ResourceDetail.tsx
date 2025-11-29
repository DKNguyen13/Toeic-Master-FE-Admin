import api, { isLoggedIn } from "../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaHeart } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import LoginModal from "../../layouts/common/LoginModal";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";

const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLoginModal] = useState(!isLoggedIn());
  const navigate = useNavigate();

  // State favorite
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Fetch lesson detail
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const endpoint = isLoggedIn() ? `/lessons/${id}` : `/lessons/public/${id}`;
        const res = await api.get(endpoint);
        const data = res.data.data;
        setLesson(data);
        setIsFavorite(data.isFavorite || false);
        setFavoriteCount(data.favoriteCount || 0);
      } catch (err : any) {
        if (err.response?.status === 403) {
        setLesson({
          title: "Nâng cấp tài khoản để xem bài học này",
          content: `<p class='text-center text-red-500 font-semibold'>
            Bài học này chỉ dành cho tài khoản VIP.<br/>
            Vui lòng <a href="/payment" class="text-blue-600 underline hover:text-blue-800 transition">
            nhấn vào đây để nâng cấp </a>🎓
          </p>`
        });
      } else {
        setLesson(null);
      }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1); 
    } else {
      navigate("/admin/lessonmanagement");
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!lesson) return;
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.patch("/wishlist/toggle", { lessonId: lesson._id });
      setIsFavorite(res.data.data.isFavorite);
      setFavoriteCount(prev => prev + (res.data.data.isFavorite ? 1 : -1));
    } catch (err) {
      console.error("Lỗi khi cập nhật wishlist:", err);
    }
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;
  if (!lesson) return <EmptyState message="Dữ liệu bài học đang được cập nhật. Vui lòng thử lại sau!"/>

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-xl mb-8">
      <button onClick={handleGoBack}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>
      <h1 className="text-3xl font-bold mb-10 text-center">{lesson.title}</h1>

      <div className="flex items-center gap-6 text-gray-600 mb-6">
        {/* Views */}
        <div className="flex items-center gap-2">
          <FaEye className="text-gray-400" />
          <span>{lesson.views || 0} lượt xem</span>
        </div>

        {/* Favorite */}
        <div className="flex items-center gap-2 cursor-pointer select-none"
          onClick = { handleToggleFavorite }>
          <FaHeart className = { isFavorite ? "text-red-500" : "text-gray-400"} />
          <span>{favoriteCount} yêu thích</span>
        </div>

        {/* Type */}
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
          {lesson.type}
        </span>
      </div>

      {/* Render content */}
      <div className="article-content prose"
        dangerouslySetInnerHTML={{ __html: lesson.content }}/>
      <div className="mt-12 text-center">
        <button onClick={handleGoBack} className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition">
          <ArrowLeft />
          Quay lại
        </button>
      </div>
      
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => {
            setShowLoginModal(false)
            setTimeout(() => setShowLoginModal(true), 100);
          }}
          onSuccess={() => {
            setShowLoginModal(false);        }}
        />
      )}
    </div>
  );
};

export default LessonDetailPage;
