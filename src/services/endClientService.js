import api from './api';

export const getEndClientsByClient = (clientId) => api.get(`/end-clients/by-client/${clientId}`);

const endClientService = {
  getEndClientsByClient,
};

export default endClientService;
