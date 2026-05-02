import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
  auth: {
    token: sessionStorage.getItem("token")
  }
});

export const connectSocket = (userId) => {
  if (!userId) return;

  // Atualiza o token antes de tentar conectar
  socket.auth.token = sessionStorage.getItem("token");

  if (socket.connected) {
    // Se já estiver conectado, apenas garante a identificação
    console.log("Socket já conectado, identificando usuário:", userId);
    socket.emit("identify", userId);
    return;
  }
  
  // Limpa ouvintes antigos para evitar duplicação (especialmente em re-renderizações do React)
  socket.off("connect");

  // 🔥 EVENTO CRUCIAL: Sempre que conectar ou reconectar, se identifica
  socket.on("connect", () => {
    console.log("Conectado e identificando usuário:", userId);
    socket.emit("identify", userId);
  });

  socket.connect();
};