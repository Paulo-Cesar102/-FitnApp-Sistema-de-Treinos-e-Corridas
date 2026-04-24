import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendMessage, getMessages, markAsRead, getGroupInfo, deleteMessage } from "../api/chatService";
import MessageList from "./MessageList";
import GroupDetailsModal from "./GroupDetailsModal";
import "./ChatBox.css";

export default function ChatBox({ chatId, friend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [clearedTimestamp, setClearedTimestamp] = useState(null);
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

  useEffect(() => {
    if (!chatId) return;
    const stored = localStorage.getItem(`cleared-chat-${chatId}`);
    setClearedTimestamp(stored ? Number(stored) : null);
  }, [chatId]);

  // --- CARREGA MENSAGENS ---
  const loadMessages = useCallback(async () => {
    if (!chatId || !user?.id) return;
    try {
      const data = await getMessages(chatId);
      const msgs = Array.isArray(data) ? data : data?.messages || [];
      const stored = localStorage.getItem(`cleared-chat-${chatId}`);
      const clearedAt = stored ? Number(stored) : null;
      const visibleMessages = clearedAt
        ? msgs.filter((m) => new Date(m.createdAt).getTime() > clearedAt)
        : msgs;

      setMessages(visibleMessages);
      if (visibleMessages.some((m) => m.senderId !== user.id && !m.read)) {
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

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Deseja apagar essa mensagem para todos?")) return;

    try {
      await deleteMessage(messageId);
      loadMessages();
    } catch (err) {
      console.error("Erro ao apagar mensagem:", err);
    }
  };

  const handleClearForMe = () => {
    if (!chatId) return;
    const timestamp = Date.now();
    localStorage.setItem(`cleared-chat-${chatId}`, timestamp.toString());
    setClearedTimestamp(timestamp);
    setMessages([]);
    alert("Mensagens anteriores foram limpas para você. As novas aparecerão normalmente.");
  };

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
          <span
            className="friend-name"
            onClick={friend?.isGroup ? () => setIsGroupInfoOpen(true) : undefined}
            style={{ cursor: friend?.isGroup ? "pointer" : "default" }}
          >
            {groupDetails?.name || friend?.name || "Carregando..."}
            {friend?.isGroup && groupDetails?.participants?.length ? (
              <span className="group-count"> • {groupDetails.participants.length} membros</span>
            ) : null}
          </span>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={handleClearForMe} title="Limpar mensagens para mim">
            🧹
          </button>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="chat-messages">
        {clearedTimestamp && messages.length === 0 ? (
          <div className="clear-note">
            Mensagens anteriores foram limpas para você. Novas mensagens aparecerão automaticamente.
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onDeleteMessage={handleDeleteMessage} 
            groupDetails={groupDetails} 
          />
        )}
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

      <GroupDetailsModal
        isOpen={isGroupInfoOpen}
        onClose={() => setIsGroupInfoOpen(false)}
        groupDetails={groupDetails}
        currentUserId={user.id}
        onGroupUpdated={() => {
          loadGroupData();
          loadMessages();
        }}
        onGroupDeleted={() => {
          setIsGroupInfoOpen(false);
          onClose();
        }}
      />
    </div>
  );
}