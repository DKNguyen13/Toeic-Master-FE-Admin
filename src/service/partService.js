import api from '../config/axios.js';

// Update part
export const updatePart = async (partId, partData) => {
    const response = await api.put(`/part/${partId}`, partData)
    //console.log("Update part response:", response.data.data.updatedPart);
    return response.data.data.updatedPart;
}

// Get all Tests
export const getAllParts = async (slug) => {
    const response = await api.get(`/part`, {
      params: {
        slug,
      },
    });
    return response.data.data;
}
