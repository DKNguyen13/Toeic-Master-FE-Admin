import api from '../config/axios.js';

export const getCommentByTestId = async (testId, page, limit) => {
  try{
    const response = await api.get(`/comments/test/${testId}`, {
      params: { page, limit },
    });
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const getChildrenComment = async (commentId, page, limit) => {
  try{
    const response = await api.get(`/comments/${commentId}/replies`, {
      params: { page, limit },
    });
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const reactComment = async (commentId) => {
  try{
    const response = await api.post(`/comments/${commentId}/react`);
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const createComment = async (testId, content) => {
  try{
    const response = await api.post(`/comments/`, { content, exam: testId });
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const createReplyComment = async (commentId, content) => {
  try{
    const response = await api.post(`/comments/${commentId}/reply`, { content });
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const deleteComment = async (commentId) => {
  try{
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
  catch (error){
    throw error;
  }
}

export const editComment = async (commentId, content) => {
  try{
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  }
  catch (error){
    throw error;
  }
}