import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import GymCheckIn from "../Componentes/GymCheckIn";
import GymRanking from "../Componentes/GymRanking";
import GymAnnouncements from "../Componentes/GymAnnouncements";
import GymPersonals from "../Componentes/GymPersonals";
import JoinGym from "../Componentes/JoinGym";
import { OwnerDashboard } from "../Componentes/OwnerDashboard";
import { PersonalDashboard } from "../Componentes/PersonalDashboard";
import "./academy.css";

export default function Academy() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [gymId, setGymId] = useState(localStorage.getItem("gymId"));
  const [gymName, setGymName] = useState(localStorage.getItem("gymName") || "Minha Academia");
  const [token] = useState(localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("checkin");

  const tabs = [
    { id: "checkin", label: "Check-in" },
    { id: "ranking", label: "Ranking" },
    { id: "announcements", label: "Avisos" },
    { id: "personals", label: "Equipe" },
  ];

  const handleJoined = (newGymId) => {
    setGymId(newGymId);
    localStorage.setItem("gymId", newGymId);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("gymId");
    localStorage.removeItem("gymName");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Se for dono de academia, mostra o dashboard específico
  if (role === "GYM_OWNER") {
    return (
      <OwnerDashboard 
        gymId={gymId} 
        gymName={gymName} 
        token={token} 
        onLogout={handleLogout} 
      />
    );
  }

  // Se for Personal, mostra o dashboard de personal
  if (role === "PERSONAL") {
    return (
      <PersonalDashboard
        gymId={gymId}
        gymName={gymName}
        onLogout={handleLogout}
      />
    );
  }

  // Se não estiver em nenhuma academia, mostra tela para entrar
  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <JoinGym onJoined={handleJoined} />;
  }

  // Visualização padrão para alunos
  return (
    <div className="academy-container">
      <header className="academy-header-top">
        <div className="app-logo">
          Gym<span>Club</span>
        </div>
      </header>
      
      <div className="academy-header">
        <h1>{gymName}</h1>
        <p>Ranking, avisos e personals da sua unidade</p>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "checkin" && <GymCheckIn />}
        {activeTab === "ranking" && <GymRanking />}
        {activeTab === "announcements" && <GymAnnouncements />}
        {activeTab === "personals" && <GymPersonals />}
      </div>
    </div>
  );
}
