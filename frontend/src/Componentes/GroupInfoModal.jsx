import { useState, useEffect } from "react";
import { getFriends } from "../api/friendRequestService";
import "./GroupInfoModal.css";

export default function GroupInfoModal({ 
  isOpen, 
  onClose, 
  groupData, 
  onAddMembers // Nome da prop que vem do Friends.js
}) {
  const [friends, setFriends] = useState([]);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      setGroupName(groupData?.name || "");
      setSelectedUsersToAdd([]);
    }
  }, [isOpen, groupData]);

  const loadFriends = async () => {
    try {
      const data = await getFriends();
      const currentIds = groupData?.participants?.map(p => p.userId) || [];
      setFriends(data.filter(f => !currentIds.includes(f.id)));
    } catch (err) {
      console.error("Erro ao carregar atletas:", err);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim()) return alert("Dê um nome ao grupo!");
    if (selectedUsersToAdd.length === 0 && !groupData) {
      return alert("Selecione pelo menos um atleta!");
    }
    // Chama a função enviando os dados
    onAddMembers(selectedUsersToAdd, groupName);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{groupData ? "Editar Grupo" : "Novo Grupo"}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>Identificação</h3>
            <input 
              type="text" 
              className="description-textarea"
              placeholder="Ex: Powerbuilds..." 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Convidar Amigos</h3>
              <span style={{ color: '#ff4500', fontSize: '12px', fontWeight: 'bold' }}>
                {selectedUsersToAdd.length} selecionados
              </span>
            </div>
            
            <div className="user-selection">
              {friends.length > 0 ? (
                friends.map((f) => (
                  <label key={f.id} className={`checkbox-label ${selectedUsersToAdd.includes(f.id) ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedUsersToAdd.includes(f.id)}
                      onChange={() => setSelectedUsersToAdd(prev => 
                        prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]
                      )}
                    />
                    <span className="member-name">{f.name}</span>
                  </label>
                ))
              ) : (
                <p className="no-friends-message">Nenhum atleta disponível.</p>
              )}
            </div>
          </div>

          <div className="button-group">
            <button className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button 
              className="btn-save" 
              onClick={handleCreate}
              disabled={!groupName.trim()}
            >
              Criar Grupo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}