import { api } from "./api";

export const searchUsers = async (query: string) => {
  try {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    return [];
  }
};

// LISTAR PENDENTES
export const getPendingRequests = async () => {
  try {
    const response = await api.get("/friends/pending");
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar solicitações pendentes:", err);
    return [];
  }
};

export const getFriends = async () => {
  try {
    const response = await api.get("/friends");
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar amigos:", err);
    return [];
  }
};

export const sendFriendRequest = async (receiverId: string) => {
  try {
    console.log("Enviando solicitação para:", receiverId);
    const response = await api.post("/friends/request", {
      receiverId: receiverId
    });
    return response.data;
  } catch (err: any) {
    console.error("Erro ao enviar solicitação:", err?.response?.data || err);
    throw err;
  }
};

// ACEITAR
export const acceptFriend = async (requestId: string) => {
  try {
    const response = await api.post("/friends/accept", { requestId });
    return response.data;
  } catch (err) {
    console.error("Erro ao aceitar amizade:", err);
    throw err;
  }
};

// RECUSAR
export const rejectFriend = async (requestId: string) => {
  try {
    const response = await api.post("/friends/reject", { requestId });
    return response.data;
  } catch (err) {
    console.error("Erro ao recusar amizade:", err);
    throw err;
  }
};

// REMOVER AMIGO
export const deleteFriend = async (id: string) => {
  try {
    const response = await api.delete(`/friends/${id}`);
    return response.data;
  } catch (err) {
    console.error("Erro ao remover amigo:", err);
    throw err;
  }
};
