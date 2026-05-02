import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { sendMessage, getMessages, markAsRead, getGroupInfo, deleteMessage } from "../api/chatService";
import { socket } from "../service/socket"; // 🔥 Importação do Socket
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

  // --- RECUPERA USUÁRIO LOGADO ---
  const user = useMemo(() => {
    try {
      const savedUser = sessionStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  }, []);

  // --- CARREGA INFOS DO GRUPO (NOMES DOS MEMBROS) ---
  const loadGroupData = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await getGroupInfo(chatId);
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
      
      // Marcar como lido se houver mensagens novas de outros
      if (visibleMessages.some((m) => m.senderId !== user.id && !m.read)) {
        await markAsRead(chatId);
        socket.emit("chat:read", { chatId, userId: user.id });
      }
    } catch (err) { console.error(err); }
  }, [chatId, user?.id]);

  // --- CICLO DE VIDA E SOCKETS ---
  useEffect(() => {
    if (!chatId || !user?.id) return;

    loadGroupData();
    loadMessages();

    // 🔗 Entrar na sala do Chat
    socket.emit("join_chat", chatId);

    // 👂 Ouvir novos eventos
    const handleNewMessage = (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prev) => {
          // Evita duplicatas caso o remetente também receba o próprio evento
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Se a mensagem for de outro, marcar como lido automaticamente
        if (newMessage.senderId !== user.id) {
          markAsRead(chatId).catch(console.error);
          socket.emit("chat:read", { chatId, userId: user.id });
        }
      }
    };

    const handleDeleteMessage = (messageId) => {
      setMessages((prev) => prev.filter(m => m.id !== messageId));
    };

    const handleChatCleared = (clearedChatId) => {
      if (clearedChatId === chatId) {
        setMessages([]);
      }
    };

    const handleMessagesRead = ({ chatId: readChatId, userId: readerId }) => {
      if (readChatId === chatId && readerId !== user.id) {
        setMessages((prev) => prev.map(m => ({ ...m, read: true })));
      }
    };

    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:delete_message", handleDeleteMessage);
    socket.on("chat:cleared", handleChatCleared);
    socket.on("chat:read", handleMessagesRead);

    return () => {
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:delete_message", handleDeleteMessage);
      socket.off("chat:cleared", handleChatCleared);
      socket.off("chat:read", handleMessagesRead);
      socket.emit("leave_chat", chatId);
    };
  }, [chatId, user?.id, loadGroupData, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Deseja apagar essa mensagem para todos?")) return;

    try {
      await deleteMessage(messageId);
      // O socket "chat:delete_message" cuidará de atualizar o estado para todos
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
    alert("Mensagens anteriores foram limpas para você.");
  };

  const handleSend = async () => {
    if (!text.trim() || !chatId) return;
    try {
      await sendMessage(chatId, text);
      // Não precisamos de loadMessages() aqui, pois o socket "chat:new_message" 
      // vai disparar e atualizar a lista para nós e para o outro.
      setText("");
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