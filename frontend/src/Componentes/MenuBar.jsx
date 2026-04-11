import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MenuBar.css";

// Ícones Vetorizados Premium
const HomeIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const DumbbellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.65 21.35a2 2 0 0 1-2.83 0l-5.66-5.66a2 2 0 0 1 0-2.83l.06-.06a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83Z"/><path d="m2 2 2.83 2.83"/><path d="M4 4l-2 2"/><path d="m4 4 2-2"/><path d="m4 4 5.66 5.66a2 2 0 0 0 2.83 0l.06-.06a2 2 0 0 0 0-2.83L6.89 1.11a2 2 0 0 0-2.83 0l-2.83 2.83Z"/><path d="m22 22-2.83-2.83"/><path d="M20 20l2-2"/><path d="m20 20-2 2"/></svg>;
const UserIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { id: "home", label: "Início", path: "/home", icon: <HomeIcon /> },
    { id: "exercicio", label: "Treinos", path: "/exercicio", icon: <DumbbellIcon /> },
    { id: "perfil", label: "Perfil", path: "/perfil", icon: <UserIcon /> },
  ];

  return (
    <nav className="tab-bar-container">
      <div className="tab-bar-content">
        {menus.map((item) => {
          // Verifica se a rota atual é a mesma do item para aplicar o estilo laranja
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
      {/* Indicador visual de sistema para simular barra do iPhone */}
      <div className="system-indicator" />
    </nav>
  );
}