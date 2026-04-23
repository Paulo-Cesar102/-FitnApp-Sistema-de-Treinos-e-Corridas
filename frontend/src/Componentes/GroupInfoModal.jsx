import { useState, useEffect } from "react";
import { getFriends } from "../api/friendRequestService";
import "../Componentes/GroupInfoModal.css";

export default function GroupInfoModal({ 
  isOpen, 
  onClose, 
  groupData, // Agora contém { participants: [ { user: { name } } ] }
  onAddMembers, 
  onRemoveMember, 
  onUpdateDescription
}) {
  const [friends, setFriends] = useState([]);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
  const [description, setDescription] = useState(groupData?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  // Ajuste: Extraímos os membros formatados da estrutura do Prisma
  const [groupMembers, setGroupMembers] = useState([]);
  
  const [currentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser || savedUser === "undefined") return null;
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Erro ao processar JSON do user:", error);
      return null;
    }
  });

  const isCreator = currentUser?.id === groupData?.creatorId;

  useEffect(() => {
    if (isOpen && groupData) {
      loadFriends();
      setDescription(groupData?.description || "");
      
      // Mapeia os participantes vindos do backend para um formato plano
      if (groupData.participants) {
        const formattedMembers = groupData.participants.map(p => ({
          id: p.userId, // ID do usuário
          name: p.user?.name || "Usuário" // Nome vindo do include do Prisma
        }));
        setGroupMembers(formattedMembers);
      }
    }
  }, [isOpen, groupData]);

  const loadFriends = async () => {
    try {
      const friendsData = await getFriends();
      // Filtrar amigos que já não estão no grupo
      const currentMemberIds = groupData?.participants?.map(p => p.userId) || [];
      const availableFriends = friendsData.filter(
        friend => !currentMemberIds.includes(friend.id)
      );
      setFriends(availableFriends);
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsersToAdd((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (selectedUsersToAdd.length > 0) {
      onAddMembers(selectedUsersToAdd);
      setSelectedUsersToAdd([]);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Tem certeza que deseja remover este membro?")) {
      onRemoveMember(memberId);
      setGroupMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  const handleSaveDescription = () => {
    onUpdateDescription(description);
    setIsEditingDescription(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{groupData?.name || "Informações do Grupo"}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Descrição */}
          <div className="section">
            <h3>Descrição do Grupo</h3>
            {isEditingDescription && isCreator ? (
              <div className="description-edit">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="description-textarea"
                />
                <div className="button-group">
                  <button className="btn-save" onClick={handleSaveDescription}>Salvar</button>
                  <button className="btn-cancel" onClick={() => setIsEditingDescription(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="description-view">
                <p>{description || "Sem descrição"}</p>
                {isCreator && (
                  <button className="btn-edit" onClick={() => setIsEditingDescription(true)}>Editar</button>
                )}
              </div>
            )}
          </div>

          {/* Membros - AQUI APARECE O NOME */}
          <div className="section">
            <h3>Membros ({groupMembers.length})</h3>
            <div className="members-list">
              {groupMembers.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <span className="member-name">
                      {member.name} {/* Agora exibe o nome mapeado */}
                    </span>
                    {member.id === groupData?.creatorId && (
                      <span className="creator-badge">Criador</span>
                    )}
                  </div>
                  
                  {isCreator && member.id !== currentUser?.id && (
                    <button
                      className="btn-remove-member"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Membros */}
          {isCreator && (
            <div className="section">
              <h3>Adicionar Novos Membros</h3>
              {friends.length > 0 ? (
                <div className="add-members">
                  <div className="user-selection">
                    {friends.map((friend) => (
                      <label key={friend.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedUsersToAdd.includes(friend.id)}
                          onChange={() => toggleUserSelection(friend.id)}
                        />
                        <span>{friend.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedUsersToAdd.length > 0 && (
                    <button className="btn-add-members" onClick={handleAddMembers}>
                      Adicionar {selectedUsersToAdd.length} membro(s)
                    </button>
                  )}
                </div>
              ) : (
                <p className="no-friends-message">Nenhum amigo disponível</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}