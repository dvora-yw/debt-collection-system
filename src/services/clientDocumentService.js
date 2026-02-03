import api from './api';

export const listAll = () => api.get('/client-documents');
export const listByClient = (clientId) => api.get(`/client-documents/client/${clientId}`);
export const getById = (id) => api.get(`/client-documents/${id}`);
export const createDocumentRecord = (payload) => api.post('/client-documents', payload);
export const updateDocumentRecord = (id, payload) => api.put(`/client-documents/${id}`, payload);
export const deleteDocument = (id) => api.delete(`/client-documents/${id}`);

// Multipart uploads — requires backend endpoints (recommended)
export const uploadDocument = async (clientId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  // Try common endpoint variants to improve compatibility with backend
  const endpoints = [
    { method: 'post', url: '/client-documents/upload', withClientId: true },
    { method: 'post', url: `/client-documents/client/${clientId}/upload` },
    { method: 'post', url: `/clients/${clientId}/documents/upload` },
  ];
  let lastError;
  for (const ep of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (ep.withClientId) formData.append('clientId', clientId);
      const res = await api[ep.method](ep.url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res;
    } catch (err) {
      lastError = err;
      // Try next variant on 404/400/405
      const status = err?.response?.status;
      if (![404, 400, 405].includes(status)) break;
    }
  }
  // Fallback: create a record via JSON if binary upload API is not available
  try {
    const payload = {
      clientId,
      fileName: file?.name,
      mimeType: file?.type,
    };
    return await createDocumentRecord(payload);
  } catch (e) {
    throw lastError || e || new Error('Upload failed');
  }
};

export const replaceDocument = async (id, file) => {
  const endpoints = [
    { method: 'put', url: `/client-documents/${id}/replace` },
    { method: 'put', url: `/client-documents/${id}` },
  ];
  let lastError;
  for (const ep of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api[ep.method](ep.url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res;
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      if (![404, 400, 405].includes(status)) break;
    }
  }
  throw lastError || new Error('Replace failed');
};

export default {
  listAll,
  listByClient,
  getById,
  createDocumentRecord,
  updateDocumentRecord,
  deleteDocument,
  uploadDocument,
  replaceDocument,
};
