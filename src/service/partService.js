import api from '../config/axios.js';


// Get all Tests
export const getAllParts = async (slug) => {
    const response = await api.get(`/part`, {
      params: {
        slug,
      },
    });
    return response.data.data;
}