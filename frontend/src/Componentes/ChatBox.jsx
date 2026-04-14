import React, { useEffect, useState, useRef, useCallback } from "react";
import { sendMessage, getMessages, markAsRead } from "../api/chatService";

export default function ChatBox({ chatId, friend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  const user = getUser();

  console.log("🔥 USER LOGADO:", user);

  const loadMessages = useCallback(async () => {
    try {
      if (!chatId || !user?.id) return;

      const data = await getMessages(chatId);
      const msgs = Array.isArray(data) ? data : data?.messages || [];

      setMessages(msgs);

      const hasUnread = msgs.some(
        (m) => m.senderId !== user.id && !m.read
      );

      if (hasUnread) {
        await markAsRead(chatId);
      }
    } catch (err) {
      console.error("loadMessages error:", err);
    }
  }, [chatId, user?.id]);

  useEffect(() => {
    loadMessages();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(loadMessages, 3000);

    return () => clearInterval(intervalRef.current);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    console.log("🔥 clicou enviar");

    try {
      if (!text.trim()) return;
      if (!chatId) return;
      if (!user?.id) return;

      await sendMessage(chatId, text);

      setText("");
      await loadMessages();
    } catch (err) {
      console.log("❌ erro send:", err);
    }
  };

  return (
    <div className="chat-box gymclub-theme">

      <div className="chat-header">
        <span>{friend?.name || "Chat"}</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg ${
              m.senderId === user?.id ? "sent" : "received"
            }`}
          >
            {m.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Digite..."
        />

        <button onClick={handleSend} className="send-btn">
          ➤
        </button>
      </div>

    </div>
  );
}