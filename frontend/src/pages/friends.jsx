import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket, connectSocket } from "../service/socket"; 
import { 
  getFriends, getPendingRequests, searchUsers, addFriend, 
  acceptFriend, rejectFriend 
} from "../api/friendRequestService";
import { createPrivateChat, getChats, createGroupChat } from "../api/chatService";

import ChatBox from "../Componentes/ChatBox";
import GroupInfoModal from "../Componentes/GroupInfoModal";
import "./Friends.css";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("amigos"); 
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [isModalGroupOpen, setIsModalGroupOpen] = useState(false);

  // UseRef para controlar mensagens já processadas e evitar duplicidade
  const processedMessages = useRef(new Set());

  const totalUnreadGroups = useMemo(() => {
    return groups.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [groups]);

  const loadData = useCallback(async () => {
    try {
      const [friendsData, pendingData, chatsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getChats()
      ]);
      
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPending(Array.isArray(pendingData) ? pendingData : []);
      
      const incomingGroups = Array.isArray(chatsData) ? chatsData.filter(c => c.isGroup) : [];

      setGroups(prevGroups => {
        return incomingGroups.map(newG => {
          const existingG = prevGroups.find(p => p.id === newG.id);
          return {
            ...newG,
            unreadCount: existingG ? existingG.unreadCount : (newG.unreadCount || 0)
          };
        });
      });

      incomingGroups.forEach(g => socket.emit("join_chat", g.id));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return navigate("/login");
    const user = JSON.parse(userJson);
    
    connectSocket(user.id);
    socket.emit("identify", user.id);

    // Função de tratamento da mensagem
    const handleNewMessage = (newMessage) => {
      // 🛡️ BLOQUEIO DE DUPLICIDADE: Se o ID da mensagem já foi processado, ignora
      if (processedMessages.current.has(newMessage.id)) return;
      processedMessages.current.add(newMessage.id);

      setGroups(prev => prev.map(g => {
        if (g.id === newMessage.chatId) {
          const isNotOpened = activeChat?.chatId !== newMessage.chatId;
          return { 
            ...g, 
            unreadCount: isNotOpened ? (g.unreadCount || 0) + 1 : 0 
          };
        }
        return g;
      }));
    };

    socket.on("chat:new_message", handleNewMessage);

    loadData();

    return () => {
      // Limpeza rigorosa para não duplicar ouvintes
      socket.off("chat:new_message", handleNewMessage);
    };
  }, [navigate, loadData, activeChat]); // activeChat aqui garante que o ouvinte saiba qual chat está aberto

  const onOpenChat = async (target, isGroup = false) => {
    if (isGroup) {
      setActiveChat({ chatId: target.id, friend: { name: target.name, isGroup: true } });
      setGroups(prev => prev.map(g => g.id === target.id ? { ...g, unreadCount: 0 } : g));
    } else {
      try {
        const chat = await createPrivateChat(target.id);
        setActiveChat({ chatId: chat.id, friend: target });
      } catch (err) { alert("Erro ao abrir chat."); }
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFriend = async (id) => {
    try {
      await addFriend(id);
      alert("Solicitação enviada!");
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) { alert("Erro ao enviar solicitação."); }
  };

  return (
    <div className="friends-container">
      <header className="friends-header">
        <h2>Gym<span>Club</span></h2>
        <p className="subtitle">Comunidade e Atletas</p>
      </header>

      <div className="friends-tabs">
        <button className={activeTab === "amigos" ? "active" : ""} onClick={() => setActiveTab("amigos")}>
          Amigos
        </button>
        <button className={activeTab === "solicitacoes" ? "active" : ""} onClick={() => setActiveTab("solicitacoes")}>
          Pedidos {pending.length > 0 && <span className="tab-badge">{pending.length}</span>}
        </button>
        <button className={activeTab === "grupos" ? "active" : ""} onClick={() => setActiveTab("grupos")}>
          Grupos {totalUnreadGroups > 0 && <span className="tab-badge-orange">{totalUnreadGroups}</span>}
        </button>
        <button className={activeTab === "buscar" ? "active" : ""} onClick={() => setActiveTab("buscar")}>🔍</button>
      </div>

      <div className="friends-list">
        {activeTab === "grupos" && (
          <div className="groups-section">
            <button className="btn-create-group" onClick={() => setIsModalGroupOpen(true)}>+ Criar Novo Grupo</button>
            {groups.map(g => (
              <div key={g.id} className="user-card-item group-card" onClick={() => onOpenChat(g, true)}>
                <div className="user-avatar-small group-icon-box">
                  👥
                  {g.unreadCount > 0 && <div className="unread-badge-dot">{g.unreadCount}</div>}
                </div>
                <div className="user-details">
                  <div className="card-header-row">
                    <h4>{g.name}</h4>
                    {g.unreadCount > 0 && <span className="new-indicator">NOVA</span>}
                  </div>
                  <span>{g.participants?.length || 0} membros</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "amigos" && friends.map(f => (
          <div key={f.id} className="user-card-item">
            <div className="user-avatar-small">{f.name?.charAt(0)}</div>
            <div className="user-details"><h4>{f.name}</h4><span>Nível {f.level || 1}</span></div>
            <button className="btn-chat" onClick={() => onOpenChat(f)}>💬</button>
          </div>
        ))}

        {activeTab === "solicitacoes" && pending.map(req => (
          <div key={req.id} className="user-card-item">
            <div className="user-avatar-small">{req.sender?.name?.charAt(0)}</div>
            <div className="user-details"><h4>{req.sender?.name}</h4><span>Quer treinar com você</span></div>
            <div className="action-buttons">
              <button className="btn-accept" onClick={async () => { await acceptFriend(req.id); loadData(); }}>✓</button>
              <button className="btn-reject" onClick={async () => { await rejectFriend(req.id); loadData(); }}>✕</button>
            </div>
          </div>
        ))}

        {activeTab === "buscar" && (
          <div className="search-section">
             <div className="friends-search-bar">
                <input type="text" placeholder="Nome do atleta..." value={searchQuery} onChange={handleSearch} />
             </div>
            {searchResults.map(u => (
              <div key={u.id} className="user-card-item">
                <div className="user-avatar-small">{u.name?.charAt(0)}</div>
                <div className="user-details"><h4>{u.name}</h4></div>
                <button className="btn-add-friend" onClick={() => handleAddFriend(u.id)}>+</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <GroupInfoModal isOpen={isModalGroupOpen} onClose={() => setIsModalGroupOpen(false)} onAddMembers={loadData} />
      {activeChat && <ChatBox chatId={activeChat.chatId} friend={activeChat.friend} onClose={() => setActiveChat(null)} />}
    </div>
  );
}