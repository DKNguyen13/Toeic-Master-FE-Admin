import api from '../config/axios.js';

// Get Test detail
export const getTestDetail = async (slug) => {
    const response = await api.get(`/test/${slug}`);
    return response.data;
}

// Get all Tests for user
export const getAllTest = async (page, limit) => {
    const response = await api.get(`/test`, {
      params: {
        page,
        limit
      },
    });
    return response.data.data;
}

// Get all Tests
export const getAllTestForAdmin = async (page, limit) => {
    const response = await api.get(`/test/admin`, {
      params: {
        page,
        limit
      },
    });
    return response.data.data;
}

// Delete test
export const modifyTest = async(slug) => {
  const response =  await api.patch(`/test/${slug}`);
  console.log('delete test',response);
}

// Import test from Excel
export const importTest = async (formData) => {
  const response = await api.post('/admin/tests/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}