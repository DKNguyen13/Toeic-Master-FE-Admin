import React, { useState, useEffect } from 'react';
import { deleteComment, getChildrenComment } from '../../service/commentService';
import CommentDetail from './CommentDetail'; // Import component CommentDetail
import { Comment } from '../Comment/types'


interface CommentChildrenProps {
  parentCommentId: string;
  commentChildren: Comment[];
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}

const CommentChildren: React.FC<CommentChildrenProps> = ({ 
  parentCommentId,
  commentChildren,
  onLike,
  onReply,
  onEdit,
  onDelete
}) => {
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="text-gray-500">Loading replies...</div>
      </div>
    );
  }

  return (
    <div className="ml-8 mt-4 space-y-3 pl-4">
      {commentChildren.map((comment) => (
        <CommentDetail
          isChild={true}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CommentChildren;