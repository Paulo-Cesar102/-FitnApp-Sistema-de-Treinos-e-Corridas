import { api } from "./api";

// 👥 LISTAR AMIGOS
export const getFriends = async () => {
  const response = await api.get("/friends");
  return response.data;
};

// ⏳ LISTAR PENDENTES
export const getPendingRequests = async () => {
  const response = await api.get("/friends/pending");
  return response.data;
};

// 🔍 BUSCAR USUÁRIOS
export const searchUsers = async (query: string) => {
  const response = await api.get(`/friends/search?query=${query}`);
  return response.data;
};

// ➕ ENVIAR SOLICITAÇÃO
export const addFriend = async (receiverId: string) => {
  console.log("Enviando solicitação para:", receiverId);

  const response = await api.post("/friends/request", {
    receiverId // 🔥 só isso agora
  });

  return response.data;
};

// ✅ ACEITAR
export const acceptFriend = async (requestId: string) => {
  const response = await api.post("/friends/accept", {
    requestId
  });

  return response.data;
};

// ❌ RECUSAR
export const rejectFriend = async (requestId: string) => {
  const response = await api.post("/friends/reject", {
    requestId
  });

  return response.data;
};

// 🗑️ REMOVER AMIGO
export const deleteFriend = async (id: string) => {
  const response = await api.delete(`/friends/${id}`);
  return response.data;
};