import React, { useState, useEffect } from "react";
import {
  getFriends,
  deleteFriend,
} from "../api/friendRequestService";
import { createPrivateChat } from "../api/chatService";
import ChatBox from "../Componentes/ChatBox";
import "./Friends.css";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [unread, setUnread] = useState({});

  const loadData = async () => {
    try {
      const f = await getFriends();
      setFriends(f || []);

      // 🔥 fake unread
      const fakeUnread = {};
      f.forEach(user => {
        fakeUnread[user.id] = Math.floor(Math.random() * 3);
      });
      setUnread(fakeUnread);

    } catch (err) {
      console.error("Erro ao carregar amigos:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 💬 abrir chat
  const onOpenChat = async (friend) => {
    try {
      const chat = await createPrivateChat(friend.id);

      // zera badge
      setUnread(prev => ({
        ...prev,
        [friend.id]: 0
      }));

      setActiveChat({
        chatId: chat.id,
        friend
      });

    } catch (err) {
      console.error(err);
      alert("Erro ao abrir chat");
    }
  };

  // ❌ remover amigo
  const onRemove = async (friendId) => {
    if (window.confirm("Remover amizade?")) {
      try {
        await deleteFriend(friendId);
        setFriends(prev => prev.filter(f => f.id !== friendId));
      } catch {
        alert("Erro ao remover amigo");
      }
    }
  };

  return (
    <div className="friends-container">

      <header className="friends-header">
        <h2>Gym<span>Club</span></h2>
        <p className="subtitle">Conecte-se com outros atletas</p>
      </header>

      <div className="friends-list">
        {friends.length === 0 ? (
          <p className="empty-msg">Nenhum amigo ainda...</p>
        ) : (
          friends.map((f) => (
            <div key={f.id} className="user-card-item">

              <div className="user-avatar-small">
                {f.name?.charAt(0)}
              </div>

              <div className="user-details">
                <h4>{f.name}</h4>
                <span>Nível {f.level || 1}</span>
              </div>

              {/* 🔥 BADGE */}
              {unread[f.id] > 0 && (
                <div className="badge-msg">
                  {unread[f.id]}
                </div>
              )}

              <div className="action-buttons">

                <button
                  className="btn-chat"
                  onClick={() => onOpenChat(f)}
                >
                  💬
                </button>

                <button
                  className="btn-action-ghost"
                  onClick={() => onRemove(f.id)}
                >
                  Remover
                </button>

              </div>
            </div>
          ))
        )}
      </div>

      {/* 💬 CHAT */}
      {activeChat && (
        <ChatBox
          chatId={activeChat.chatId}
          friend={activeChat.friend}
          onClose={() => setActiveChat(null)}
        />
      )}

    </div>
  );
}