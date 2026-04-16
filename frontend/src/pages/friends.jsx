import React, { useState, useEffect } from "react";
import { 
  getFriends, 
  getPendingRequests, 
  searchUsers, 
  addFriend, 
  acceptFriend, 
  rejectFriend, 
  deleteFriend 
} from "../api/friendRequestService";
import { createPrivateChat } from "../api/chatService";
import ChatBox from "../Componentes/ChatBox";
import "./Friends.css";

export default function Friends() {
  const [activeTab, setActiveTab] = useState("amigos"); 
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "amigos") {
        const data = await getFriends();
        setFriends(Array.isArray(data) ? data : []);
      } else if (activeTab === "solicitacoes") {
        const data = await getPendingRequests();
        setPending(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO PARA ABRIR O CHAT CORRETAMENTE ---
  const onOpenChat = async (friend) => {
    try {
      // Busca ou cria o chat no banco para pegar o ID real
      const chat = await createPrivateChat(friend.id);
      
      // Agora passamos o ID retornado pela API (chat.id)
      setActiveChat({ 
        chatId: chat.id, 
        friend: friend 
      });
    } catch (err) {
      console.error("Erro ao abrir chat:", err);
      alert("Não foi possível iniciar o chat.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const users = await searchUsers(searchQuery);
      setSearchResults(Array.isArray(users) ? users : []);
    } catch (err) {
      alert("Erro na busca");
    }
  };

  const onAccept = async (requestId) => {
    try {
      await acceptFriend(requestId);
      loadData();
    } catch (err) {
      alert("Erro ao aceitar");
    }
  };

  const onRemove = async (id) => {
    if (window.confirm("Remover amizade?")) {
      try {
        await deleteFriend(id);
        setFriends(prev => prev.filter(f => f.id !== id));
      } catch (err) {
        alert("Erro ao remover");
      }
    }
  };

  return (
    <div className="friends-container">
      <header className="friends-header">
        <h2>Gym<span>Club</span></h2>
        <p className="subtitle">Conecte-se com outros atletas</p>
      </header>

      <div className="friends-tabs">
        <button 
          className={activeTab === "amigos" ? "active" : ""} 
          onClick={() => setActiveTab("amigos")}
        >
          Amigos <span className="tab-badge">{friends.length}</span>
        </button>
        <button 
          className={activeTab === "solicitacoes" ? "active" : ""} 
          onClick={() => setActiveTab("solicitacoes")}
        >
          Solicitações <span className="tab-badge">{pending.length}</span>
        </button>
        <button 
          className={activeTab === "buscar" ? "active" : ""} 
          onClick={() => setActiveTab("buscar")}
        >
          Buscar
        </button>
      </div>

      <div className="friends-list">
        {activeTab === "amigos" && (
          friends.length === 0 && !loading ? (
            <p className="empty-msg">Nenhum amigo ainda...</p>
          ) : (
            friends.map(f => (
              <div key={f.id} className="user-card-item">
                <div className="user-avatar-small">{f.name?.charAt(0)}</div>
                <div className="user-details">
                  <h4>{f.name}</h4>
                  <span>Nível {f.level || 1}</span>
                </div>
                <div className="action-buttons">
                  {/* ALTERADO: Agora chama onOpenChat(f) em vez de setActiveChat direto */}
                  <button className="btn-chat" onClick={() => onOpenChat(f)}>💬</button>
                  <button className="btn-action-ghost" onClick={() => onRemove(f.id)}>Remover</button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "solicitacoes" && (
          pending.length === 0 && !loading ? (
            <p className="empty-msg">Nenhuma solicitação pendente.</p>
          ) : (
            pending.map(req => (
              <div key={req.id} className="user-card-item">
                <div className="user-avatar-small">{req.sender?.name?.charAt(0)}</div>
                <div className="user-details">
                  <h4>{req.sender?.name}</h4>
                  <span>Quer ser seu amigo</span>
                </div>
                <div className="action-pair">
                  <button className="btn-circle-accept" onClick={() => onAccept(req.id)}>✓</button>
                  <button className="btn-circle-reject" onClick={() => rejectFriend(req.id).then(loadData)}>✕</button>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "buscar" && (
          <>
            <div className="friends-search-bar">
              <input 
                placeholder="Nome ou ID do atleta..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <span style={{cursor: 'pointer'}} onClick={handleSearch}>🔍</span>
            </div>
            {searchResults.map(u => (
              <div key={u.id} className="user-card-item">
                <div className="user-avatar-small">{u.name?.charAt(0)}</div>
                <div className="user-details">
                  <h4>{u.name}</h4>
                  <span>Nível {u.level || 1}</span>
                </div>
                <button className="btn-add-friend" onClick={() => addFriend(u.id).then(() => alert("Solicitação enviada!"))}>
                  +
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {activeChat && (
        <ChatBox 
          chatId={activeChat.chatId} // Agora o ID real chega aqui!
          friend={activeChat.friend} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}