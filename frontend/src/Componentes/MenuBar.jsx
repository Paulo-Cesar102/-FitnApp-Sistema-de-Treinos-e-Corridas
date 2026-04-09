import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MenuBar.css";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { id: "home", label: "Início", path: "/home", icon: "🏠" },
    { id: "exercicio", label: "Treinos", path: "/exercicio", icon: "🏆" }, // Ícone de troféu como no seu layout
    { id: "perfil", label: "Perfil", path: "/perfil", icon: "👤" }, // Ajustado para bater com o Layout do App.js
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