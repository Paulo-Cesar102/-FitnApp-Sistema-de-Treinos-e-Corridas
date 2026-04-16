import { api } from "./api";

// 💬 Criar chat privado
export const createPrivateChat = async (friendId: string) => {
  const res = await api.post("/chats/private", { friendId });
  return res.data;
};

// 📩 Enviar mensagem (Sincronizado com router.post("/message"))
export const sendMessage = async (chatId: string, content: string) => {
  try {
    // Validação para evitar o erro de "chatId ou texto ausente" visto no console
    if (!chatId || !content.trim()) {
      throw new Error("ChatId ou conteúdo da mensagem não fornecidos.");
    }

    // O router espera POST em /chats/message
    // O prefixo /chats já é definido no app.use do server.ts
    const res = await api.post("/chats/message", {
      chatId,
      content,
    });

    return res.data;
  } catch (err: any) {
    console.error("❌ [API] sendMessage error:", err?.response?.data || err);
    throw err;
  }
};

// 📋 Listar todos os chats do usuário
export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

// 💬 Buscar mensagens de um chat específico
export const getMessages = async (chatId: string) => {
  try {
    if (!chatId) return [];

    // O router espera GET em /chats/:chatId/messages
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getMessages error:", err?.response?.data || err);
    return [];
  }
};

// 🔥 Marcar mensagens como lidas
export const markAsRead = async (chatId: string) => {
  try {
    if (!chatId) return null;

    // O router espera POST em /chats/:chatId/read
    const res = await api.post(`/chats/${chatId}/read`);
    return res.data;
  } catch (err: any) {
    console.error("❌ markAsRead error:", err?.response?.data || err);
    return null;
  }
};