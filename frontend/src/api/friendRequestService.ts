import { api } from "./api";

// 👥 LISTAR AMIGOS
export const getFriends = async () => {
  try {
    const response = await api.get("/friends");
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar amigos:", error.response?.data || error.message);
    throw error;
  }
};

// ⏳ LISTAR PENDENTES
export const getPendingRequests = async () => {
  try {
    const response = await api.get("/friends/pending");
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar pendentes:", error.response?.data || error.message);
    throw error;
  }
};

// 🔍 BUSCAR USUÁRIOS
export const searchUsers = async (query: string) => {
  try {
    const response = await api.get(`/friends/search?query=${query}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro na busca:", error.response?.data || error.message);
    throw error;
  }
};

// ➕ ENVIAR SOLICITAÇÃO
export const addFriend = async (receiverId: string) => {
  try {
    console.log("Enviando solicitação para:", receiverId);
    
    // 🔥 Garanta que o objeto tenha exatamente o nome que o Controller espera
    const response = await api.post("/friends/request", {
      receiverId: receiverId 
    });

    return response.data;
  } catch (error: any) {
    // Aqui você vai ver se o erro é "Solicitação já pendente" ou "Não pode adicionar a si mesmo"
    console.error("Erro ao adicionar amigo:", error.response?.data?.message || error.message);
    alert(error.response?.data?.message || "Erro ao enviar solicitação");
    throw error;
  }
};

// ✅ ACEITAR
export const acceptFriend = async (requestId: string) => {
  try {
    const response = await api.post("/friends/accept", {
      requestId: requestId
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao aceitar amigo:", error.response?.data || error.message);
    throw error;
  }
};

// ❌ RECUSAR
export const rejectFriend = async (requestId: string) => {
  try {
    const response = await api.post("/friends/reject", {
      requestId: requestId
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao recusar amigo:", error.response?.data || error.message);
    throw error;
  }
};

// 🗑️ REMOVER AMIGO
export const deleteFriend = async (id: string) => {
  try {
    const response = await api.delete(`/friends/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao remover amigo:", error.response?.data || error.message);
    throw error;
  }
};