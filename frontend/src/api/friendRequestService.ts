import { api } from "./api";

// LISTAR AMIGOS
export const getFriends = async () => {
  const response = await api.get("/friends");
  return response.data;
};

// LISTAR SOLICITAÇÕES PENDENTES
export const getPendingRequests = async () => {
  const response = await api.get("/friends/pending");
  return response.data;
};

// BUSCAR USUÁRIOS
export const searchUsers = async (name: string) => {
  const response = await api.get(`/users/search?name=${name}`);
  return response.data;
};

// ENVIAR SOLICITAÇÃO DE AMIZADE
export const addFriend = async (userId: string) => {
  const response = await api.post("/friends/request", { receiverId: userId });
  return response.data;
};

// ACEITAR SOLICITAÇÃO
export const acceptFriend = async (requestId: string) => {
  const response = await api.post("/friends/accept", { requestId });
  return response.data;
};

// RECUSAR SOLICITAÇÃO
export const rejectFriend = async (requestId: string) => {
  const response = await api.post("/friends/reject", { requestId });
  return response.data;
};

// REMOVER AMIGO
export const deleteFriend = async (id: string) => {
  const response = await api.delete(`/friends/${id}`);
  return response.data;
};