import React, {useEffect, useState} from 'react';
import CommentDetail from './CommentDetail';
import { Comment } from '../Comment/types'
import { isLoggedIn } from "../../config/axios";
import LoginModal from "../../layouts/common/LoginModal";
import { toast, ToastContainer } from "react-toastify";
import { createComment, deleteComment, editComment, getCommentByTestId, reactComment } from '../../service/commentService';

interface CommentSectionProps {
  comments: Comment[];
  testId: string;
  isLoggedIn?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ testId }) => {
  const [comments, setCommentsList] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch comments when component mounts or testId changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!testId) return;
      
      try {
        // setCommentsLoading(true);
        // setCommentsError(null);
        const commentsData = await getCommentByTestId(testId, currentPage);
        setCommentsList(commentsData.data || []);
        setTotalComments(commentsData.pagination.totalComments || 0);
      } catch (error) {
        console.error('Error fetching comments:', error);
        // setCommentsError('Failed to load comments');
      } finally {
        // setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [testId, currentPage]);

  const onLike = async (commentId: string) => {
    await reactComment(commentId)
    setCommentsList((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              isLike: !comment.isLike,
              noOfLikes: comment.isLike
                ? (comment.noOfLikes || 0) - 1
                : (comment.noOfLikes || 0) + 1,
            }
          : comment
      )
    );
  };

  const onDelete = async (commentId: string) => {
    await deleteComment(commentId)
    setCommentsList((prevComments) => prevComments.filter((comment) => comment._id !== commentId)
    );
  };

  const onEdit = async (commentId: string, content: string) => {
    const response = await editComment(commentId, content);
    console.log(response);
    setCommentsList((prevComments) => 
      prevComments.map((comment) => 
        comment._id === commentId ? response : comment
      )
    );
  };

  const handleComment = async () => {
    try{
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }

      const response = await createComment(testId, comment);
      setCommentsList([response, ...comments]);
      setTotalComments(totalComments + 1);
      setComment('');
      console.log('Comment posted successfully:', response);
      //toast.success("Comment posted successfully!");
    }
    catch (error: any){
      console.error('Error posting comment:', error);
      setComment('');
      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra! Vui lòng thử lại.");
      }
    }
  }
  
  return (
    <>
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Bình luận ({totalComments})
      </h3>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Viết bình luận của bạn..."
          onChange={(e) => setComment(e.target.value)} value={comment}
        />
        <div className="flex justify-end mt-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleComment}>
            Gửi bình luận
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentDetail 
              isChild={false} 
              key={comment._id} 
              comment={comment} 
              onLike={onLike} 
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
      {totalComments > 10 && (
        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
              ← Trước
            </button>
            
            {Array.from({ length: Math.ceil(totalComments / 10) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`px-3 py-2 text-sm rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === Math.ceil(totalComments / 10)}
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalComments / 10), prev + 1))}>
              Sau →
            </button>
          </nav>
        </div>
      )}
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

export default CommentSection;