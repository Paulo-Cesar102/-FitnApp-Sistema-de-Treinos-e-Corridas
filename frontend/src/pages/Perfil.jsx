import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import CustomAlert from "../Componentes/CustomAlert";

const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const DumbbellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.65 21.35a2 2 0 0 1-2.83 0l-5.66-5.66a2 2 0 0 1 0-2.83l.06-.06a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83Z"/><path d="m2 2 2.83 2.83"/><path d="M4 4l-2 2"/><path d="m4 4 2-2"/><path d="m4 4 5.66 5.66a2 2 0 0 0 2.83 0l.06-.06a2 2 0 0 0 0-2.83L6.89 1.11a2 2 0 0 0-2.83 0l-2.83 2.83Z"/><path d="m22 22-2.83-2.83"/><path d="M20 20l2-2"/><path d="m20 20-2 2"/></svg>;
const FlameIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function Perfil() {
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const [userData, setUserData] = useState({
    name: "Atleta GymPro",
    email: "atleta@gympro.com",
    level: 5,
    currentXP: 1250,
    nextLevelXP: 2000,
    totalWorkouts: 42,
    streak: 5
  });

  const progressPercentage = (userData.currentXP / userData.nextLevelXP) * 100;

  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Sair da Conta",
      message: "Tem certeza que deseja desconectar do aplicativo?",
      type: "error",
      confirmText: "Sair",
      cancelText: "Cancelar",
      onConfirm: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <h2>MEU <span>PERFIL</span></h2>
        <button className="btn-logout" onClick={handleLogout}>
          <LogoutIcon />
        </button>
      </header>

      <section className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            {userData.name.charAt(0)}
          </div>
          <div className="profile-text">
            <h3>{userData.name}</h3>
            <p>{userData.email}</p>
          </div>
        </div>

        <div className="xp-section">
          <div className="xp-header">
            <span className="level-badge">Nível {userData.level}</span>
            <span className="xp-text">{userData.currentXP} / {userData.nextLevelXP} XP</span>
          </div>
          <div className="xp-bar-bg">
            <div className="xp-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </section>

      <h3 className="section-title">Desempenho</h3>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><DumbbellIcon /></div>
          <div className="stat-info">
            <h4>Treinos Feitos</h4>
            <p>{userData.totalWorkouts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FlameIcon /></div>
          <div className="stat-info">
            <h4>Ofensiva (Dias)</h4>
            <p>{userData.streak}</p>
          </div>
        </div>
      </section>

      <h3 className="section-title">Conquistas Recentes</h3>
      <section className="badges-list">
        <div className="badge-item">
          <div className="badge-icon"><TrophyIcon /></div>
          <div className="badge-text">
            <h4>Primeiro Passo</h4>
            <p>Concluiu seu primeiro treino no app.</p>
          </div>
        </div>
      </section>

      <CustomAlert config={alertConfig} />
    </div>
  );
}