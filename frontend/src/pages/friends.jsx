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
import "./Friends.css";

// Ícones para a interface
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const UserPlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function Friends() {
  const [activeTab, setActiveTab] = useState("my-friends");
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Carrega os dados iniciais
  const loadData = async () => {
    try {
      const [friendsList, pendingList] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ]);
      setFriends(friendsList || []);
      setPending(pendingList || []);
    } catch (err) {
      console.error("Erro ao carregar dados da comunidade:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 0) {
      setLoadingSearch(true);
      try {
        const results = await searchUsers(val);
        // Filtra para não mostrar o próprio usuário se o backend não fizer isso
        setSearchResults(results || []);
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const onAddFriend = async (id) => {
    await addFriend(id);
    setSearchResults(prev => prev.filter(u => u.id !== id));
  };

  const onAccept = async (requestId) => {
    await acceptFriend(requestId);
    loadData();
  };

  const onReject = async (requestId) => {
    await rejectFriend(requestId);
    loadData();
  };

  const onRemove = async (id) => {
    if (window.confirm("Remover amigo?")) {
      await deleteFriend(id);
      loadData();
    }
  };

  return (
    <div className="friends-container">
      <header className="friends-header">
        <h2>COMUNIDADE <span>GYMPRO</span></h2>
        <p className="subtitle">Conecte-se com outros atletas</p>
      </header>

      <div className="friends-tabs">
        <button className={activeTab === "my-friends" ? "active" : ""} onClick={() => setActiveTab("my-friends")}>
          Amigos ({friends.length})
        </button>
        <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}>
          Solicitações {pending.length > 0 && <span className="tab-badge">{pending.length}</span>}
        </button>
        <button className={activeTab === "search" ? "active" : ""} onClick={() => setActiveTab("search")}>
          Buscar
        </button>
      </div>

      <main className="friends-content">
        {activeTab === "my-friends" && (
          <div className="friends-list">
            {friends.length === 0 ? <p className="empty-msg">Sua lista de amigos está vazia.</p> : 
              friends.map(f => (
                <div key={f.id} className="user-card-item">
                  <div className="user-avatar-small">{f.name?.charAt(0)}</div>
                  <div className="user-details">
                    <h4>{f.name}</h4>
                    <span>Nível {f.level || 1}</span>
                  </div>
                  <button className="btn-action-ghost" onClick={() => onRemove(f.id)}>Remover</button>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "requests" && (
          <div className="friends-list">
            {pending.length === 0 ? <p className="empty-msg">Nenhuma solicitação pendente.</p> : 
              pending.map(r => (
                <div key={r.id} className="user-card-item">
                  <div className="user-avatar-small">{r.sender?.name?.charAt(0)}</div>
                  <div className="user-details">
                    <h4>{r.sender?.name}</h4>
                    <span>Quer treinar com você</span>
                  </div>
                  <div className="action-pair">
                    <button className="btn-circle-accept" onClick={() => onAccept(r.id)}><CheckIcon /></button>
                    <button className="btn-circle-reject" onClick={() => onReject(r.id)}><XIcon /></button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "search" && (
          <div className="search-pane">
            <div className="friends-search-bar">
              <SearchIcon />
              <input 
                placeholder="Buscar por nome ou email..." 
                value={searchQuery} 
                onChange={handleSearch} 
              />
            </div>

            <div className="friends-list">
              {loadingSearch ? (
                <p className="empty-msg">Buscando atletas...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <div key={u.id} className="user-card-item">
                    <div className="user-avatar-small">{u.name?.charAt(0)}</div>
                    <div className="user-details">
                      <h4>{u.name}</h4>
                      <span>{u.email}</span>
                    </div>
                    <button className="btn-add-friend" onClick={() => onAddFriend(u.id)}>
                      <UserPlusIcon />
                    </button>
                  </div>
                ))
              ) : searchQuery.length > 0 ? (
                <p className="empty-msg">Nenhum atleta encontrado com "{searchQuery}"</p>
              ) : (
                <p className="empty-msg">Digite o nome de um amigo para começar a treinar junto!</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}