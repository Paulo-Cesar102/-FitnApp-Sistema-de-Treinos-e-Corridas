import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendMessage, getMessages, markAsRead, getGroupInfo } from "../api/chatService";
import MessageList from "./MessageList"; 
import "./ChatBox.css"; 

export default function ChatBox({ chatId, friend, onClose, onDeleteMessage }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [groupDetails, setGroupDetails] = useState(null); 
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  // --- RECUPERA USUÁRIO LOGADO ---
  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  }, []);

  // --- CARREGA INFOS DO GRUPO (NOMES DOS MEMBROS) ---
  const loadGroupData = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await getGroupInfo(chatId);
      // Este log confirmará que o pai recebeu os dados
      console.log("✅ ChatBox: groupDetails carregado", data);
      setGroupDetails(data);
    } catch (err) {
      console.error("❌ ChatBox: Erro ao carregar nomes:", err);
    }
  }, [chatId]);

  // --- CARREGA MENSAGENS ---
  const loadMessages = useCallback(async () => {
    if (!chatId || !user?.id) return;
    try {
      const data = await getMessages(chatId);
      const msgs = Array.isArray(data) ? data : data?.messages || [];
      setMessages(msgs);

      if (msgs.some(m => m.senderId !== user.id && !m.read)) {
        await markAsRead(chatId);
      }
    } catch (err) { console.error(err); }
  }, [chatId, user?.id]);

  // --- CICLO DE VIDA ---
  useEffect(() => {
    if (!chatId) return;
    loadGroupData();
    loadMessages();
    
    intervalRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chatId, loadMessages, loadGroupData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !chatId) return;
    try {
      await sendMessage(chatId, text);
      setText("");
      loadMessages();
    } catch (err) { console.error(err); }
  };

  if (!user) return null;

  return (
    <div className="chat-box gymclub-theme">
      {/* HEADER */}
      <div className="chat-header">
        <div className="friend-info">
          <div className="online-dot"></div>
          <span className="friend-name">
            {groupDetails?.name || friend?.name || "Carregando..."}
          </span>
        </div>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="chat-messages">
        {/* CORREÇÃO CRÍTICA: Passando groupDetails para o filho */}
        <MessageList 
          messages={messages} 
          onDeleteMessage={onDeleteMessage} 
          groupDetails={groupDetails} 
        />
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Digite uma mensagem..."
        />
        <button onClick={handleSend} className="send-btn">➤</button>
      </div>
    </div>
  );
}