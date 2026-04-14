import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./MenuBar.css";

// Ícones
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);

const DumbbellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14.4 14.4 9.6 9.6"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

// 🔥 NOVO ÍCONE AMIGOS
const FriendsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="9" cy="7" r="4"/>
    <circle cx="17" cy="7" r="3"/>
    <path d="M2 21v-2a4 4 0 0 1 4-4h6"/>
  </svg>
);

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { id: "home", label: "Início", path: "/home", icon: <HomeIcon /> },
    { id: "exercicio", label: "Treinos", path: "/exercicio", icon: <DumbbellIcon /> },
    { id: "friends", label: "Amigos", path: "/amigos", icon: <FriendsIcon /> },
    { id: "perfil", label: "Perfil", path: "/perfil", icon: <UserIcon /> },
  ];

  return (
    <>
      <nav className="tab-bar-container">
        <div className="tab-bar-content">
          {menus.map((item) => {
            const isActive = location?.pathname === item.path;

            return (
              <button
                key={item.id}
                className={`tab-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <div className="pill-container">
                  <span className="tab-icon">{item.icon}</span>
                </div>
                <span className="tab-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="system-indicator" />
      </nav>
    </>
  );
}