import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../service/socket";
import { getPendingRequests } from "../api/friendRequestService";
import { getChats } from "../api/chatService"; // Necessário para pegar as msgs
import "./MenuBar.css";

// --- Ícones ---
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BarbellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20" />
    <path d="M6 7v10" />
    <path d="M4 9v6" />
    <path d="M18 7v10" />
    <path d="M20 9v6" />
  </svg>
);

const FriendsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- Lógica de Notificações Adicionada ---
  const [totalNotifications, setTotalNotifications] = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [requests, chats] = await Promise.all([
        getPendingRequests(),
        getChats() // Puxa todos os chats do GymClub
      ]);

      const requestsCount = Array.isArray(requests) ? requests.length : 0;
      // Soma o unreadCount de cada chat retornado pela API
      const unreadCount = Array.isArray(chats) 
        ? chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0) 
        : 0;

      setTotalNotifications(requestsCount + unreadCount);
    } catch (e) {
      console.error("Erro badge:", e);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    socket.on("friend:new_request", fetchCounts);
    socket.on("chat:new_message", fetchCounts); // Atualiza quando chega msg nova no grupo/privado

    return () => {
      socket.off("friend:new_request", fetchCounts);
      socket.off("chat:new_message", fetchCounts);
    };
  }, [fetchCounts]);
  // ------------------------------------------

  const menus = [
    { id: "home", label: "Início", path: "/home", icon: <HomeIcon /> },
    { id: "exercicio", label: "Treinos", path: "/exercicio", icon: <BarbellIcon /> },
    { id: "friends", label: "Amigos", path: "/amigos", icon: <FriendsIcon />, hasBadge: true },
    { id: "perfil", label: "Perfil", path: "/perfil", icon: <UserIcon /> },
  ];

  return (
    <nav className="tab-bar-container">
      <div className="tab-bar-content">
        {menus.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <div className="pill-container">
                <span className="tab-icon">
                  {item.icon}
                  {/* Badge dinâmica adicionada aqui */}
                  {item.hasBadge && totalNotifications > 0 && (
                    <span className="notification-badge-small">{totalNotifications}</span>
                  )}
                </span>
              </div>
              <span className="tab-label">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="system-indicator" />
    </nav>
  );
}