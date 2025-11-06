import api from '../config/axios.js';

export const startSession = async (payload) => {
    const res = await api.post('/session/start', payload);
    return res.data.data;
};

export const getSession = async (sessionId) => {
    const res = await api.get(`/session/${sessionId}`);
    return res.data.data;
    
};

export const getSessionQuestions = async (sessionId) => {
    const res = await api.get(`/session/${sessionId}/questions`);
    return res.data.data;
};

export const submitBulkAnswers = async (sessionId, answers) => {
    const res = await api.post(`/session/${sessionId}/answers/bulk`, {answers});
    return res.data.data;
};

export const submitSession = async (sessionId) => {
    const res = await api.post(`/session/${sessionId}/submit`);
    return res.data.data;
};

export const getSessionResults = async (sessionId) => {
    const res = await api.get(`/session/${sessionId}/results`);
    return res.data.data;
};

export const getSessionsUser = async (page, limit) => {
    const res = await api.get(`/session/user?page=${page}&limit=${limit}`);
    return res.data.data;
};

export const getUserStatistics = async () => {
    const res = await api.get('/session/user/statistics');
    return res.data.data;
};