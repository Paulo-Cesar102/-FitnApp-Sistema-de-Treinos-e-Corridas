import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { socket, connectSocket } from "../service/socket"; 
import { 
  getFriends, getPendingRequests, searchUsers, addFriend, 
  acceptFriend, rejectFriend 
} from "../api/friendRequestService";
import { createPrivateChat, getChats, markAsRead } from "../api/chatService";

import ChatBox from "../Componentes/ChatBox";
import GroupInfoModal from "../Componentes/GroupInfoModal";
import "./Friends.css";

export default function Friends() {
  const [activeTab, setActiveTab] = useState("amigos"); 
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [isModalGroupOpen, setIsModalGroupOpen] = useState(false);

  const processedMessages = useRef(new Set());

  const totalUnreadGroups = useMemo(() => {
    return groups.reduce((acc, curr) => acc + (Number(curr.unreadCount) || 0), 0);
  }, [groups]);

  const loadData = useCallback(async () => {
    try {
      const [friendsData, pendingData, chatsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getChats()
      ]);
      
      // Garante que amigos sejam salvos se existirem
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPending(Array.isArray(pendingData) ? pendingData : []);
      
      // Filtro de Grupos: Se não tiver a flag, ele tenta identificar pelo tipo ou nome
      const allChats = Array.isArray(chatsData) ? chatsData : [];
      const incomingGroups = allChats.filter(c => 
        c.isGroup === true || 
        c.is_group === true || 
        c.type === 'group' || 
        c.group_id // Caso o back use group_id como referência
      );
      
      setGroups(incomingGroups);

      incomingGroups.forEach(g => {
        if (g.id) socket.emit("join_chat", g.id);
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      connectSocket(userId);
      socket.emit("identify", userId);
    }

    const handleSocketUpdate = () => loadData();

    socket.on("chat:new_message", (msg) => {
      if (processedMessages.current.has(msg.id)) return;
      processedMessages.current.add(msg.id);
      loadData();
    });
    
    socket.on("group:created", handleSocketUpdate);
    socket.on("friend:new_request", handleSocketUpdate);

    loadData();

    return () => {
      socket.off("chat:new_message");
      socket.off("group:created");
      socket.off("friend:new_request");
    };
  }, [loadData]);

  // Busca com Debounce
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const onOpenChat = async (target, isGroup = false) => {
    let chatId = target.id;
    if (isGroup) {
      setActiveChat({ chatId, friend: { name: target.name, isGroup: true } });
    } else {
      try {
        const chat = await createPrivateChat(target.id);
        chatId = chat.id;
        setActiveChat({ chatId, friend: target });
      } catch (err) { return; }
    }

    if (chatId && target.unreadCount > 0) {
      await markAsRead(chatId);
      socket.emit("chat:read", { chatId });
      loadData();
    }
  };

  return (
    <div className="friends-container">
      <header className="friends-header">
        <h2 className="gym-title">Gym<span>Club</span></h2>
        <p className="subtitle">COMUNIDADE E ATLETAS</p>
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

      <div className="friends-list-content">
        {activeTab === "amigos" && (
          friends.length === 0 ? <p className="empty-msg">Sua lista de amigos está vazia.</p> :
          friends.map(f => (
            <div key={f.id} className="user-card-item">
              <div className="user-avatar-small">{f.name?.charAt(0).toUpperCase()}</div>
              <div className="user-details"><h4>{f.name}</h4></div>
              <button className="btn-chat" onClick={() => onOpenChat(f)}>💬</button>
            </div>
          ))
        )}

        {activeTab === "grupos" && (
          <div className="groups-section">
            <button className="btn-create-group" onClick={() => setIsModalGroupOpen(true)}>+ Criar Novo Grupo</button>
            {groups.length === 0 ? <p className="empty-msg">Nenhum grupo encontrado.</p> :
              groups.map(g => (
                <div key={g.id} className="user-card-item group-card" onClick={() => onOpenChat(g, true)}>
                  <div className="user-avatar-small group-icon-box">
                    👥 {g.unreadCount > 0 && <div className="unread-badge-dot">{g.unreadCount}</div>}
                  </div>
                  <div className="user-details">
                    <div className="card-header-row">
                      <h4>{g.name}</h4>
                      {g.unreadCount > 0 && <span className="new-indicator">NOVA</span>}
                    </div>
                    <span>{g.participants?.length || 0} membros</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "solicitacoes" && (
          pending.length === 0 ? <p className="empty-msg">Sem pedidos pendentes.</p> :
          pending.map(req => (
            <div key={req.id} className="user-card-item">
              <div className="user-avatar-small">{req.sender?.name?.charAt(0)}</div>
              <div className="user-details">
                <h4>{req.sender?.name}</h4>
                <span>Enviou um pedido</span>
              </div>
              <div className="action-pair">
                <button className="btn-circle-accept" onClick={async () => { await acceptFriend(req.id); loadData(); }}>✓</button>
                <button className="btn-circle-reject" onClick={async () => { await rejectFriend(req.id); loadData(); }}>✕</button>
              </div>
            </div>
          ))
        )}

        {activeTab === "buscar" && (
          <div className="search-area">
             <div className="friends-search-bar">
                <input placeholder="Procurar atleta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
             </div>
             {searchResults.map(u => (
               <div key={u.id} className="user-card-item">
                 <div className="user-avatar-small">{u.name?.charAt(0)}</div>
                 <div className="user-details"><h4>{u.name}</h4></div>
                 <button className="btn-add-friend" onClick={async () => { await addFriend(u.id); alert("Pedido enviado!"); }}>+</button>
               </div>
             ))}
          </div>
        )}
      </div>

      <GroupInfoModal isOpen={isModalGroupOpen} onClose={() => setIsModalGroupOpen(false)} onAddMembers={loadData} />
      {activeChat && <ChatBox chatId={activeChat.chatId} friend={activeChat.friend} onClose={() => { setActiveChat(null); loadData(); }} />}
    </div>
  );
}