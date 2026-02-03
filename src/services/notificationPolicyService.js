import api from './api';

// Fetch notification policy for a given client
export const getNotificationPolicy = (clientId) =>
  api.get(`/clients/${clientId}/notification-policy`);

// Save or update notification policy for a given client
export const saveNotificationPolicy = (clientId, policy) =>
  api.post(`/clients/${clientId}/notification-policy`, policy);
