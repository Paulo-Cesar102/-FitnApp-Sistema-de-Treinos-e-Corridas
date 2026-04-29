import { api } from "./api";

export const createGroupChat = async (name: string, memberIds: string[]) => {
  try {
    const res = await api.post("/chats/group", { name, memberIds });
    return res.data;
  } catch (err: any) {
    console.error("Erro ao criar chat em grupo:", err?.response?.data || err);
    throw err;
  }
};

export const createPrivateChat = async (targetUserId: string) => {
  try {
    const res = await api.post("/chats/private", { targetUserId });
    return res.data;
  } catch (err: any) {
    console.error("Erro ao criar chat privado:", err?.response?.data || err);
    throw err;
  }
};

export const addGroupMember = async (chatId: string, userId: string) => {
  try {
    const res = await api.post(`/chats/${chatId}/members`, { userId });
    return res.data;
  } catch (err: any) {
    console.error("Erro ao adicionar membro:", err?.response?.data || err);
    throw err;
  }
};

export const removeMember = async (chatId: string, userId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}/members/${userId}`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao remover membro:", err?.response?.data || err);
    throw err;
  }
};

export const leaveGroup = async (chatId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}/leave`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao sair do grupo:", err?.response?.data || err);
    throw err;
  }
};

export const deleteGroup = async (chatId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao deletar grupo:", err?.response?.data || err);
    throw err;
  }
};

export const sendMessage = async (chatId: string, content: string, workoutId?: string) => {
  try {
    const res = await api.post("/messages", { chatId, content, workoutId });
    return res.data;
  } catch (err: any) {
    console.error("Erro ao enviar mensagem:", err?.response?.data || err);
    throw err;
  }
};

export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

export const getMessages = async (chatId: string) => {
  try {
    const res = await api.get(`/messages/${chatId}`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao buscar mensagens:", err?.response?.data || err);
    return [];
  }
};

export const markAsRead = async (chatId: string) => {
  try {
    const res = await api.put(`/messages/${chatId}/read`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao marcar como lido:", err?.response?.data || err);
    return null;
  }
};

export const clearChatHistory = async (chatId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}/clear`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao limpar chat:", err?.response?.data || err);
    throw err;
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao deletar mensagem:", err?.response?.data || err);
    throw err;
  }
};

export const saveSharedWorkout = async (workoutData: any) => {
  try {
    const res = await api.post("/chats/save-workout", { workoutData });
    return res.data;
  } catch (err: any) {
    console.error("Erro ao salvar treino compartilhado:", err?.response?.data || err);
    throw err;
  }
};

export const getGroupInfo = async (chatId: string) => {
  try {
    const res = await api.get(`/chats/${chatId}/info`);
    return res.data;
  } catch (err: any) {
    console.error("Erro ao buscar informacoes do grupo:", err?.response?.data || err);
    throw err;
  }
};
