import { api } from "./api";

//  Criar chat privado
export const createPrivateChat = async (friendId: string) => {
  const res = await api.post("/chats/private", { friendId });
  return res.data;
};

//  Criar grupo
export const createGroupChat = async (name: string, userIds: string[]) => {
  const res = await api.post("/chats/group", { name, userIds });
  return res.data;
};

//  Enviar mensagem (Texto ou Treino)
export const sendMessage = async (chatId: string, content: string, workoutId?: string) => {
  try {
    if (!chatId || (!content?.trim() && !workoutId)) {
      throw new Error("Dados insuficientes para enviar a mensagem.");
    }

    const res = await api.post("/chats/message", {
      chatId,
      content: content.trim(),
      workoutId,
    });

    return res.data;
  } catch (err: any) {
    console.error("❌ [API] sendMessage error:", err?.response?.data || err);
    throw err;
  }
};

//  Listar todos os chats do usuário
export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

//  Buscar mensagens de um chat específico
export const getMessages = async (chatId: string) => {
  try {
    if (!chatId) return [];
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getMessages error:", err?.response?.data || err);
    return [];
  }
};

//  Marcar mensagens como lidas
export const markAsRead = async (chatId: string) => {
  try {
    if (!chatId) return null;
    const res = await api.post(`/chats/${chatId}/read`);
    return res.data;
  } catch (err: any) {
    console.error("❌ markAsRead error:", err?.response?.data || err);
    return null;
  }
};

//  Limpar histórico INTEIRO do chat
export const clearChatHistory = async (chatId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}/clear`);
    return res.data;
  } catch (err: any) {
    console.error("❌ clearChat error:", err?.response?.data || err);
    throw err;
  }
};

//  Apagar APENAS UMA mensagem (para todos)
export const deleteMessage = async (messageId: string) => {
  try {
    // Sincronizado com: router.delete("/message/:messageId", ...)
    const res = await api.delete(`/chats/message/${messageId}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ deleteMessage error:", err?.response?.data || err);
    throw err;
  }
};

//  Salvar treino recebido no chat
export const saveSharedWorkout = async (workoutData: any) => {
  try {
    const res = await api.post("/chats/save-workout", { workoutData });
    return res.data;
  } catch (err: any) {
    console.error("❌ saveSharedWorkout error:", err?.response?.data || err);
    throw err;
  }
};