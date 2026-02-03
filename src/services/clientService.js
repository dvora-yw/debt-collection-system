import api from "./api";

export const getClients = () => api.get("/clients");

// Create client using server-side add endpoint which accepts companyName/entityType in body
export const createClient = (data) => api.post('/clients/add', data);

export const createContactsForClient = (clientId, contacts) =>
  api.post(`/clients/${clientId}/contacts`, contacts);

export const deleteClient = (clientId) =>
  api.delete(`/clients/${clientId}`);

