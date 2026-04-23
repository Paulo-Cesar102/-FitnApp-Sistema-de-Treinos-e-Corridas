import { api } from "./api";

//  Criar chat privado
export const createPrivateChat = async (friendId: string) => {
  const res = await api.post("/chats/private", { friendId });
  return res.data;
};

//  Criar grupo
// Ajustado para receber um objeto, facilitando a chamada do Modal
export const createGroupChat = async ({ name, participantIds }: { name: string, participantIds: string[] }) => {
  // Mapeamos 'participantIds' para 'userIds' caso sua rota no backend espere 'userIds'
  const res = await api.post("/chats/group", { name, userIds: participantIds });
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

//  Obter informações do grupo (incluindo membros)
export const getGroupInfo = async (chatId: string) => {
  try {
    const res = await api.get(`/chats/${chatId}/info`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getGroupInfo error:", err?.response?.data || err);
    throw err;
  }
};

//  Atualizar descrição do grupo
export const updateGroupDescription = async (chatId: string, description: string) => {
  try {
    const res = await api.patch(`/chats/${chatId}/description`, { description });
    return res.data;
  } catch (err: any) {
    console.error("❌ updateGroupDescription error:", err?.response?.data || err);
    throw err;
  }
};

//  Adicionar membros ao grupo
export const addGroupMembers = async (chatId: string, userIds: string[]) => {
  try {
    const res = await api.post(`/chats/${chatId}/members`, { userIds });
    return res.data;
  } catch (err: any) {
    console.error("❌ addGroupMembers error:", err?.response?.data || err);
    throw err;
  }
};

//  Remover membro do grupo
export const removeGroupMember = async (chatId: string, memberId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}/members/${memberId}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ removeGroupMember error:", err?.response?.data || err);
    throw err;
  }
};

//  Deletar grupo
export const deleteGroup = async (chatId: string) => {
  try {
    const res = await api.delete(`/chats/${chatId}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ deleteGroup error:", err?.response?.data || err);
    throw err;
  }
};