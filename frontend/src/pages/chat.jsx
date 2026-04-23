import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  getChats, 
  getMessages, 
  sendMessage, 
  createGroupChat,
  deleteMessage,
  getGroupInfo,
  updateGroupDescription,
  addGroupMembers,
  removeGroupMember
} from "../api/chatService";
import { getFriends } from "../api/friendRequestService";

import ChatList from "../Componentes/ChatList";
import MessageList from "../Componentes/MessageList";
import MessageInput from "../Componentes/MessageInput";
import GroupInfoModal from "../Componentes/GroupInfoModal";

import "../pages/chat.css";

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const intervalRef = useRef(null);
  
  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser || savedUser === "undefined") return null;
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Erro ao processar JSON do user:", error);
      return null;
    }
  });

  // --- CARREGAR LISTA DE GRUPOS ---
  const loadChats = useCallback(async () => {
    try {
      const chatsData = await getChats();
      const groupChats = chatsData.filter(chat => chat.isGroup === true);
      setChats(groupChats);
    } catch (error) {
      console.error("Erro ao carregar chats:", error);
    }
  }, []);

  // --- CARREGAR AMIGOS PARA CRIAÇÃO DE GRUPO ---
  const loadFriends = useCallback(async () => {
    try {
      const friendsData = await getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
    }
  }, []);

  // --- CARREGAR MENSAGENS ---
  const loadMessages = useCallback(async () => {
    if (!selectedChat?.id || !user?.id) return;
    try {
      const messagesData = await getMessages(selectedChat.id);
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];
      setMessages(messagesArray);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  }, [selectedChat?.id, user?.id]);

  // --- CARREGAR INFOS DO GRUPO (Onde os nomes moram) ---
  const loadGroupInfo = useCallback(async () => {
    if (!selectedChat?.id) return;
    try {
      const info = await getGroupInfo(selectedChat.id);
      // Garantimos que a estrutura tenha 'participants' para o MessageList entender
      const normalizedInfo = {
        ...info,
        participants: info.participants || info.members || []
      };
      setGroupInfo(normalizedInfo);
      console.log("✅ Dados do grupo atualizados:", normalizedInfo);
    } catch (error) {
      console.error("Erro ao carregar informações do grupo:", error);
    }
  }, [selectedChat?.id]);

  // --- EFEITOS INICIAIS ---
  useEffect(() => {
    loadChats();
    loadFriends();
  }, [loadChats, loadFriends]);

  // --- POLLING DE MENSAGENS ---
  useEffect(() => {
    if (!selectedChat?.id) return;
    
    loadMessages();
    loadGroupInfo(); // Carrega os nomes sempre que trocar de chat

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(loadMessages, 3000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedChat?.id, loadMessages, loadGroupInfo]);

  // --- HANDLERS ---
  function handleSelectChat(chat) {
    setSelectedChat(chat);
    setShowGroupInfo(false);
    setMessages([]); // Limpa mensagens anteriores para não confundir
    setGroupInfo(null); // Reseta info para forçar novo carregamento
  }

  async function handleSend(content) {
    if (!selectedChat || !content.trim() || !user?.id) return;
    try {
      await sendMessage(selectedChat.id, content);
      loadMessages();
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  }

  async function handleDeleteMessage(messageId) {
    try {
      await deleteMessage(messageId);
      loadMessages();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    try {
      const group = await createGroupChat(groupName, selectedUsers);
      setChats((prev) => [...prev, group]);
      setSelectedChat(group);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="chat-sidebar">
        <h3 className="sidebar-title">📱 Seus Grupos</h3>
        <button className="btn-create-group" onClick={() => setShowCreateGroup(true)}>
          + Novo Grupo
        </button>
        <ChatList
          chats={chats}
          onSelect={handleSelectChat}
          selectedChat={selectedChat}
        />
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="chat-main">
        {showCreateGroup ? (
          <div className="create-group-form">
            <h3>Criar Novo Grupo</h3>
            <input
              type="text"
              placeholder="Nome do grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input-group-name"
            />
            <h4>Selecionar Membros:</h4>
            <div className="user-selection">
              {friends.map((friend) => (
                <label key={friend.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(friend.id)}
                    onChange={() => toggleUserSelection(friend.id)}
                  />
                  <span>{friend.name}</span>
                </label>
              ))}
            </div>
            <div className="button-group">
              <button className="btn-confirm" onClick={handleCreateGroup}>Criar</button>
              <button className="btn-cancel" onClick={() => setShowCreateGroup(false)}>Cancelar</button>
            </div>
          </div>
        ) : selectedChat ? (
          <>
            <div className="chat-header">
              <h2 
                onClick={() => setShowGroupInfo(true)}
                style={{ cursor: 'pointer' }}
              >
                {selectedChat.name}
              </h2>
            </div>

            {/* O PONTO CHAVE: Passando groupInfo para a prop groupDetails */}
            <MessageList 
              messages={messages}
              onDeleteMessage={handleDeleteMessage}
              groupDetails={groupInfo} 
            />

            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="empty-chat">
            <p>Selecione um grupo para treinar e conversar! 🏋️‍♂️</p>
          </div>
        )}
      </div>

      <GroupInfoModal
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        groupData={groupInfo}
        onAddMembers={loadGroupInfo}
        onRemoveMember={loadGroupInfo}
        onUpdateDescription={loadGroupInfo}
      />
    </div>
  );
}