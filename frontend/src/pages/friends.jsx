import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { socket, connectSocket } from "../service/socket"; 
import { 
  getFriends, getPendingRequests, searchUsers, sendFriendRequest, 
  acceptFriend, rejectFriend 
} from "../api/friendRequestService";
import { createPrivateChat, getChats, markAsRead } from "../api/chatService";

import ChatBox from "../Componentes/ChatBox";
import GroupInfoModal from "../Componentes/GroupInfoModal";
import CustomAlert from "../Componentes/CustomAlert";
import "./friends.css";

// Ícones Minimalistas Premium
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function Friends() {
  const [activeTab, setActiveTab] = useState("amigos"); 
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friendChats, setFriendChats] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [isModalGroupOpen, setIsModalGroupOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

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
      
      const currentUserId = localStorage.getItem("userId");
      const allChats = Array.isArray(chatsData) ? chatsData : [];
      const incomingGroups = allChats.filter(c => 
        c.isGroup === true || c.is_group === true || c.type === 'group' || c.group_id
      );
      
      const privateChatMap = {};
      allChats
        .filter((chat) => !chat.isGroup && !chat.is_group && chat.participants?.length === 2)
        .forEach((chat) => {
          const other = chat.participants.find((p) => p.userId !== currentUserId);
          if (other?.userId) {
            privateChatMap[other.userId] = {
              chatId: chat.id,
              unreadCount: Number(chat.unreadCount || 0)
            };
          }
        });

      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPending(Array.isArray(pendingData) ? pendingData : []);
      setGroups(incomingGroups);
      setFriendChats(privateChatMap);

      incomingGroups.forEach(g => {
        if (g.id) socket.emit("join_chat", g.id);
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);

  const showAlert = (title, message, type) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

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
    socket.on("group:member_added", handleSocketUpdate);
    socket.on("group:member_left", handleSocketUpdate);
    socket.on("group:deleted", handleSocketUpdate);
    socket.on("friend:new_request", handleSocketUpdate);

    loadData();

    return () => {
      socket.off("chat:new_message");
      socket.off("group:created");
      socket.off("group:member_added");
      socket.off("group:member_left");
      socket.off("group:deleted");
      socket.off("friend:new_request");
    };
  }, [loadData]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results || []);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const onOpenChat = async (target, isGroup = false) => {
    const existingChat = friendChats[target.id];
    let chatId = target.id;

    if (isGroup) {
      setActiveChat({ chatId, friend: { name: target.name, isGroup: true } });
    } else {
      try {
        if (existingChat?.chatId) {
          chatId = existingChat.chatId;
        } else {
          const chat = await createPrivateChat(target.id);
          chatId = chat.id;
        }
        setActiveChat({ chatId, friend: target });
      } catch (err) { 
        console.error("Erro ao abrir chat:", err);
        return; 
      }
    }

    const hasUnread = existingChat?.unreadCount > 0;
    if (chatId && hasUnread) {
      await markAsRead(chatId);
      socket.emit("chat:read", { chatId });
      loadData();
    }
  };

  const handleAddFriend = async (uId) => {
    try {
      await sendFriendRequest(uId);
      showAlert("Sucesso", "Pedido de amizade enviado.", "success");
    } catch (err) {
      showAlert("Aviso", "Nao foi possivel enviar o pedido.", "error");
    }
  };

  return (
    <div className="friends-container fade-in">
      <header className="friends-header">
        <h2 className="gym-title">Gym<span>Club</span></h2>
        <p className="subtitle">COMUNIDADE E ATLETAS</p>
      </header>

      <div className="friends-tabs-v3">
        <button className={activeTab === "amigos" ? "active" : ""} onClick={() => setActiveTab("amigos")}>
          Amigos
        </button>
        <button className={activeTab === "solicitacoes" ? "active" : ""} onClick={() => setActiveTab("solicitacoes")}>
          Pedidos {pending.length > 0 && <span className="tab-badge-v3">{pending.length}</span>}
        </button>
        <button className={activeTab === "grupos" ? "active" : ""} onClick={() => setActiveTab("grupos")}>
          Grupos {totalUnreadGroups > 0 && <span className="tab-badge-v3 orange">{totalUnreadGroups}</span>}
        </button>
        <button className={activeTab === "buscar" ? "active" : ""} onClick={() => setActiveTab("buscar")}><SearchIcon /></button>
      </div>

      <div className="friends-list-content">
        {activeTab === "amigos" && (
          friends.length === 0 ? <div className="empty-panel-msg">Sua lista de amigos esta vazia.</div> :
          friends.map(f => {
            const chatInfo = friendChats[f.id];
            return (
              <div key={f.id} className="user-card-item glass">
                <div className="user-avatar-v3">{f.name?.charAt(0).toUpperCase()}</div>
                <div className="user-details-v3">
                  <h4>{f.name}</h4>
                  {chatInfo?.unreadCount > 0 && (
                    <span className="unread-tag-v3">{chatInfo.unreadCount} NOVA</span>
                  )}
                </div>
                <button className="btn-action-chat" onClick={() => onOpenChat(f)}>
                  <MailIcon />
                </button>
              </div>
            );
          })
        )}

        {activeTab === "grupos" && (
          <div className="groups-section">
            <button className="btn-create-group-v3" onClick={() => setIsModalGroupOpen(true)}>
              <PlusIcon /> NOVO GRUPO
            </button>
            {groups.length === 0 ? <div className="empty-panel-msg">Nenhum grupo encontrado.</div> :
              groups.map(g => (
                <div key={g.id} className="user-card-item group-card-v3 glass" onClick={() => onOpenChat(g, true)}>
                  <div className="group-avatar-v3">
                    <UsersIcon />
                    {g.unreadCount > 0 && <div className="unread-dot-badge"></div>}
                  </div>
                  <div className="user-details-v3">
                    <div className="card-header-row">
                      <h4>{g.name}</h4>
                      {g.unreadCount > 0 && <span className="new-label-v3">NOVA</span>}
                    </div>
                    <span className="members-count">{g.participants?.length || 0} INTEGRANTES</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "solicitacoes" && (
          pending.length === 0 ? <div className="empty-panel-msg">Sem pedidos pendentes.</div> :
          pending.map(req => (
            <div key={req.id} className="user-card-item glass">
              <div className="user-avatar-v3">{req.sender?.name?.charAt(0)}</div>
              <div className="user-details-v3">
                <h4>{req.sender?.name}</h4>
                <span className="req-subtext">ENVIOU UM PEDIDO</span>
              </div>
              <div className="action-pair-v3">
                <button className="btn-accept-v3" onClick={async () => { await acceptFriend(req.id); loadData(); }}>ACEITAR</button>
                <button className="btn-reject-v3" onClick={async () => { await rejectFriend(req.id); loadData(); }}>X</button>
              </div>
            </div>
          ))
        )}

        {activeTab === "buscar" && (
          <div className="search-area-v3">
             <div className="friends-search-bar-v3">
                <SearchIcon />
                <input placeholder="Procurar atleta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
             </div>
             {searchResults.map(u => (
               <div key={u.id} className="user-card-item glass">
                 <div className="user-avatar-v3">{u.name?.charAt(0)}</div>
                 <div className="user-details-v3"><h4>{u.name}</h4></div>
                 <button className="btn-add-friend-v3" onClick={() => handleAddFriend(u.id)}><PlusIcon /></button>
               </div>
             ))}
          </div>
        )}
      </div>

      <GroupInfoModal isOpen={isModalGroupOpen} onClose={() => setIsModalGroupOpen(false)} onAddMembers={loadData} />
      {activeChat && <ChatBox chatId={activeChat.chatId} friend={activeChat.friend} onClose={() => { setActiveChat(null); loadData(); }} />}
      <CustomAlert config={alertConfig} />
    </div>
  );
}
