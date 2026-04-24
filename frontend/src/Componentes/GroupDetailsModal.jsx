import React, { useEffect, useMemo, useState } from "react";
import { getFriends } from "../api/friendRequestService";
import { addGroupMember, leaveGroup, removeMember, deleteGroup } from "../api/chatService";
import "./GroupDetailsModal.css";

export default function GroupDetailsModal({
  isOpen,
  onClose,
  groupDetails,
  currentUserId,
  onGroupUpdated,
  onGroupDeleted,
}) {
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = useMemo(() => {
    return groupDetails?.participants?.some(
      (member) => member.userId === currentUserId && member.role === "ADMIN"
    );
  }, [groupDetails, currentUserId]);

  useEffect(() => {
    if (!isOpen) return;
    loadFriends();
    setSelectedIds([]);
  }, [isOpen, groupDetails]);

  const loadFriends = async () => {
    try {
      const allFriends = await getFriends();
      const participantIds = groupDetails?.participants?.map((member) => member.userId) || [];
      setFriends(allFriends.filter((friend) => !participantIds.includes(friend.id)));
    } catch (err) {
      console.error("Erro ao carregar amigos para adicionar ao grupo:", err);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedIds.length || !groupDetails?.id) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map((memberId) => addGroupMember(groupDetails.id, memberId)));
      setSelectedIds([]);
      await onGroupUpdated();
      alert("Membros adicionados com sucesso.");
    } catch (err) {
      console.error("Erro ao adicionar membros:", err);
      alert("Não foi possível adicionar os membros. Verifique se você é administrador.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!groupDetails?.id || !memberId) return;
    if (!window.confirm("Tem certeza que deseja remover este membro do grupo?")) return;
    setIsLoading(true);
    try {
      await removeMember(groupDetails.id, memberId);
      await onGroupUpdated();
      alert("Membro removido com sucesso.");
    } catch (err) {
      console.error("Erro ao remover membro:", err);
      alert("Não foi possível remover o membro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupDetails?.id) return;
    if (!window.confirm("Deseja sair deste grupo?")) return;
    setIsLoading(true);
    try {
      await leaveGroup(groupDetails.id);
      alert("Você saiu do grupo.");
      onGroupDeleted();
    } catch (err) {
      console.error("Erro ao sair do grupo:", err);
      alert("Não foi possível sair do grupo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupDetails?.id) return;
    if (!window.confirm("Excluir este grupo apagará a conversa para todos. Deseja continuar?")) return;
    setIsLoading(true);
    try {
      await deleteGroup(groupDetails.id);
      alert("Grupo excluído com sucesso.");
      onGroupDeleted();
    } catch (err) {
      console.error("Erro ao excluir grupo:", err);
      alert("Não foi possível excluir o grupo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !groupDetails) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{groupDetails.name || "Grupo"}</h2>
            <p>{groupDetails.participants?.length || 0} membro(s)</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>Integrantes</h3>
            <div className="member-list">
              {groupDetails.participants?.map((member) => (
                <div key={member.id} className="member-item">
                  <span>{member.user?.name || "Atleta sem nome"}</span>
                  <span className="member-role">{member.role}</span>
                  {isAdmin && member.userId !== currentUserId && (
                    <button className="btn-remove" onClick={() => handleRemoveMember(member.userId)} disabled={isLoading}>
                      Remover
                    </button>
                  )}
                  {member.userId === currentUserId && <span className="member-you">Você</span>}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="section">
              <h3>Adicionar novos membros</h3>
              <div className="user-selection">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <label key={friend.id} className={`checkbox-label ${selectedIds.includes(friend.id) ? "active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(friend.id)}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(friend.id)
                              ? prev.filter((id) => id !== friend.id)
                              : [...prev, friend.id]
                          );
                        }}
                      />
                      <span className="member-name">{friend.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-friends-message">Nenhum amigo disponível para adicionar.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="button-group">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Fechar
          </button>
          {isAdmin ? (
            <button className="btn-danger" onClick={handleDeleteGroup} disabled={isLoading}>
              Excluir Grupo
            </button>
          ) : null}
          <button className="btn-leave" onClick={handleLeaveGroup} disabled={isLoading}>
            Sair do Grupo
          </button>
          {isAdmin && (
            <button className="btn-save" onClick={handleAddMembers} disabled={isLoading || selectedIds.length === 0}>
              {isLoading ? "Aguarde..." : "Adicionar Membros"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
