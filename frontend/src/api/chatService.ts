import { api } from "./api";

// 💬 criar chat privado
export const createPrivateChat = async (friendId: string) => {
  const res = await api.post("/chats/private", { friendId });
  return res.data;
};

// 📩 enviar mensagem (VERSÃO BLINDADA)
export const sendMessage = async (chatId: string, content: string) => {
  try {
    console.log("📤 [API] sendMessage:", { chatId, content });

    const res = await api.post("/chats/message", {
      chatId,
      content,
    });

    console.log("✅ [API] response:", res.data);

    return res.data;
  } catch (err: any) {
    console.error("❌ [API] sendMessage error:", err?.response?.data || err);
    throw err;
  }
};

// 📋 chats do usuário
export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

// 💬 mensagens de um chat
export const getMessages = async (chatId: string) => {
  try {
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getMessages error:", err?.response?.data || err);
    return [];
  }
};

// 🔥 marcar como lida
export const markAsRead = async (chatId: string) => {
  try {
    const res = await api.post(`/chats/${chatId}/read`);
    return res.data;
  } catch (err: any) {
    console.error("❌ markAsRead error:", err?.response?.data || err);
    return null;
  }
};