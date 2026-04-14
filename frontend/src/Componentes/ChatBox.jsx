import React, { useEffect, useState, useRef, useCallback } from "react";
import { sendMessage, getMessages, markAsRead } from "../api/chatService";
import "./ChatBox.css"; 
export default function ChatBox({ chatId, friend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  // --- BUSCA O USUÁRIO LOGADO ---
  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser || savedUser === "undefined") return null;
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Erro ao processar JSON do user:", error);
      return null;
    }
  });

  // --- CARREGAR MENSAGENS ---
  const loadMessages = useCallback(async () => {
    try {
      if (!chatId || !user?.id) return;

      const data = await getMessages(chatId);
      const msgs = Array.isArray(data) ? data : data?.messages || [];

      setMessages(msgs);

      // Marca como lida se houver mensagens novas do amigo
      const hasUnread = msgs.some(
        (m) => m.senderId !== user.id && !m.read
      );

      if (hasUnread) {
        await markAsRead(chatId);
      }
    } catch (err) {
      console.error("Erro na carga de mensagens:", err);
    }
  }, [chatId, user?.id]);

  // --- POLLING (ATUALIZAÇÃO AUTOMÁTICA A CADA 3 SEG) ---
  useEffect(() => {
    if (!chatId) return;

    loadMessages();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(loadMessages, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chatId, loadMessages]);

  // --- AUTO-SCROLL PARA A ÚLTIMA MENSAGEM ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ENVIAR MENSAGEM ---
  const handleSend = async () => {
    if (!text.trim() || !chatId || !user?.id) return;

    try {
      await sendMessage(chatId, text);
      setText(""); 
      await loadMessages(); 
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // --- TELA DE ERRO (CASO NÃO IDENTIFIQUE O USUÁRIO) ---
  if (!user) {
    return (
      <div className="chat-box gymclub-theme">
        <div className="chat-header">
          <span>Atenção</span>
          <button onClick={onClose} className="close-btn">✖</button>
        </div>
        <div style={{ padding: "30px", textAlign: "center", color: "#ff5c1a" }}>
          <p>Sessão expirada. Faça login novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box gymclub-theme">
      {/* HEADER DO CHAT */}
      <div className="chat-header">
        <div className="friend-info">
          <div className="online-dot"></div>
          <span className="friend-name">{friend?.name || "Atleta"}</span>
        </div>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id || `msg-${Math.random()}`}
              className={`msg ${m.senderId === user.id ? "sent" : "received"}`}
            >
              {m.content}
            </div>
          ))
        ) : (
          <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            Nenhuma mensagem aqui ainda. Mande um salve para o parceiro!
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT DE MENSAGEM */}
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Qual o treino de hoje?..."
        />
        <button onClick={handleSend} className="send-btn">
          ➤
        </button>
      </div>
    </div>
  );
}