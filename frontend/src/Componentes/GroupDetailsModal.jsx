import React, { useEffect, useMemo, useState } from "react";
import { getFriends } from "../api/friendRequestService";
import { addGroupMember, leaveGroup, removeMember, deleteGroup } from "../api/chatService";
import "./GroupDetailsModal.css";
import CustomAlert from "./CustomAlert";

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
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

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
      console.error("Erro ao carregar amigos:", err);
    }
  };

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const handleAddMembers = async () => {
    if (!selectedIds.length || !groupDetails?.id) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map((memberId) => addGroupMember(groupDetails.id, memberId)));
      setSelectedIds([]);
      await onGroupUpdated();
      showAlert("Sucesso", "Membros adicionados com sucesso.", "success");
    } catch (err) {
      showAlert("Erro", "Nao foi possivel adicionar os membros. Verifique suas permissoes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (!groupDetails?.id || !memberId) return;
    
    setAlertConfig({
      isOpen: true,
      title: "Confirmar Remocao",
      message: "Deseja realmente remover este membro do grupo?",
      type: "info",
      confirmText: "Remover",
      cancelText: "Cancelar",
      onCancel: () => setAlertConfig({ isOpen: false }),
      onConfirm: async () => {
        setAlertConfig({ isOpen: false });
        setIsLoading(true);
        try {
          await removeMember(groupDetails.id, memberId);
          await onGroupUpdated();
          showAlert("Sucesso", "Membro removido com sucesso.", "success");
        } catch (err) {
          showAlert("Erro", "Nao foi possivel remover o membro.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleLeaveGroup = () => {
    if (!groupDetails?.id) return;
    
    setAlertConfig({
      isOpen: true,
      title: "Sair do Grupo",
      message: "Deseja realmente sair desta conversa?",
      type: "error",
      confirmText: "Sair agora",
      cancelText: "Ficar",
      onCancel: () => setAlertConfig({ isOpen: false }),
      onConfirm: async () => {
        setAlertConfig({ isOpen: false });
        setIsLoading(true);
        try {
          await leaveGroup(groupDetails.id);
          onGroupDeleted();
          onClose();
        } catch (err) {
          showAlert("Erro", "Nao foi possivel sair do grupo.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleDeleteGroup = () => {
    if (!groupDetails?.id) return;
    
    setAlertConfig({
      isOpen: true,
      title: "Excluir Grupo",
      message: "Esta acao apagara a conversa para todos os membros. Continuar?",
      type: "error",
      confirmText: "Excluir para todos",
      cancelText: "Cancelar",
      onCancel: () => setAlertConfig({ isOpen: false }),
      onConfirm: async () => {
        setAlertConfig({ isOpen: false });
        setIsLoading(true);
        try {
          await deleteGroup(groupDetails.id);
          onGroupDeleted();
          onClose();
        } catch (err) {
          showAlert("Erro", "Nao foi possivel excluir o grupo.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
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
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>Integrantes</h3>
            <div className="member-list">
              {groupDetails.participants?.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info-row">
                    <span className="member-name-text">{member.user?.name || "Atleta"}</span>
                    <span className={`member-role-tag ${member.role?.toLowerCase()}`}>{member.role}</span>
                  </div>
                  <div className="member-actions-row">
                    {member.userId === currentUserId && <span className="member-you-tag">VOCE</span>}
                    {isAdmin && member.userId !== currentUserId && (
                      <button className="btn-remove-member" onClick={() => handleRemoveMember(member.userId)} disabled={isLoading}>
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && friends.length > 0 && (
            <div className="section">
              <h3>Adicionar Membros</h3>
              <div className="user-selection-scroll">
                {friends.map((friend) => (
                  <label key={friend.id} className={`friend-checkbox-card ${selectedIds.includes(friend.id) ? "active" : ""}`}>
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
                    <div className="friend-info-mini">
                       <span className="f-name">{friend.name}</span>
                       <span className="f-lvl">Lvl {friend.level}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button className="btn-add-exec" onClick={handleAddMembers} disabled={isLoading || selectedIds.length === 0}>
                {isLoading ? "ADICIONANDO..." : "CONFIRMAR ADICAO"}
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer-chat">
          {isAdmin ? (
            <button className="btn-danger-chat" onClick={handleDeleteGroup} disabled={isLoading}>
              EXCLUIR GRUPO
            </button>
          ) : (
            <button className="btn-leave-chat" onClick={handleLeaveGroup} disabled={isLoading}>
              SAIR DO GRUPO
            </button>
          )}
          <button className="btn-close-modal" onClick={onClose} disabled={isLoading}>
            FECHAR
          </button>
        </div>
      </div>
      
      <CustomAlert config={alertConfig} />
    </div>
  );
}
