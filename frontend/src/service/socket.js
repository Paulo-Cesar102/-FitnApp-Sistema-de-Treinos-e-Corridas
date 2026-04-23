import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export const connectSocket = (userId) => {
  if (!userId || socket.connected) return;

  socket.connect();

  // 🔥 EVENTO CRUCIAL: Sempre que conectar ou reconectar, se identifica
  socket.on("connect", () => {
    console.log("🟢 Conectado e identificando usuário:", userId);
    socket.emit("identify", userId);
  });
};