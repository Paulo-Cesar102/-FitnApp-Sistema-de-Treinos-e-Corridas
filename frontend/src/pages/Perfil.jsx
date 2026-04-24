import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import CustomAlert from "../Componentes/CustomAlert";
import { getUser } from "../api/userService";
import { getUserBadges } from "../api/badgeService";
import { getWeightLogs } from "../api/weightService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const BarbellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M6 7v10"/><path d="M4 9v6"/><path d="M18 7v10"/><path d="M20 9v6"/></svg>;
const FlameIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function Perfil() {
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightLoading, setWeightLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    level: 1,
    xp: 0,
    currentXP: 0,
    nextLevelXP: 1000,
    totalWorkouts: 0,
    streak: 5,
    maxStreak: 0
  });

  useEffect(() => {
    const loadUserData = async () => {
      const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userFromStorage?.id) return;

      try {
        const user = await getUser(userFromStorage.id);
        const totalXp = user.xp || 0;
        const calculatedLevel = Math.floor(totalXp / 100) + 1;
        const xpForCurrentLevel = (calculatedLevel - 1) * 100;
        const currentXP = totalXp - xpForCurrentLevel;
        const nextLevelXP = 100;

        setUserData({
          name: user.name,
          email: user.email,
          level: calculatedLevel,
          xp: totalXp,
          currentXP,
          nextLevelXP,
          totalWorkouts: userFromStorage.totalCompleted || 0,
          streak: user.streak,
          maxStreak: user.maxStreak || 0
        });
      } catch (error) {
        console.error("Error loading user data", error);
        // fallback to localStorage
        const totalXp = userFromStorage.xp || 0;
        const calculatedLevel = Math.floor(totalXp / 100) + 1;
        const xpForCurrentLevel = (calculatedLevel - 1) * 100;
        const currentXP = totalXp - xpForCurrentLevel;
        const nextLevelXP = 100;

        setUserData(prev => ({
          ...prev,
          name: userFromStorage.name,
          email: userFromStorage.email || prev.email,
          level: calculatedLevel,
          xp: totalXp,
          currentXP,
          nextLevelXP,
          totalWorkouts: userFromStorage.totalCompleted || 0,
          streak: userFromStorage.streak || prev.streak,
          maxStreak: userFromStorage.maxStreak || prev.maxStreak
        }));
      }
    };

    const loadBadges = async () => {
      setBadgesLoading(true);
      try {
        const userBadges = await getUserBadges();
        setBadges(userBadges);
      } catch (error) {
        console.error("Erro ao buscar badges", error);
      } finally {
        setBadgesLoading(false);
      }
    };

    const loadWeightLogs = async () => {
      setWeightLoading(true);
      try {
        const logs = await getWeightLogs();
        setWeightLogs(logs);
      } catch (error) {
        console.error("Erro ao buscar logs de peso", error);
      } finally {
        setWeightLoading(false);
      }
    };

    (async () => {
      await Promise.all([loadUserData(), loadBadges(), loadWeightLogs()]);
    })();

    // Escutar mudanças no userData
    const handleUserDataUpdate = () => {
      loadUserData();
      loadBadges();
      loadWeightLogs();
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, []);

  const progressPercentage = (userData.currentXP / userData.nextLevelXP) * 100;

  const dashboardBarData = useMemo(() => {
    return [
      { name: "Seg", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 3)), xp: 120 },
      { name: "Ter", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 2)), xp: 180 },
      { name: "Qua", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 1)), xp: 210 },
      { name: "Qui", treinos: Math.max(1, Math.min(6, userData.totalWorkouts)), xp: 240 },
      { name: "Sex", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 1)), xp: 200 },
      { name: "Sáb", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 2)), xp: 160 },
      { name: "Dom", treinos: Math.max(1, Math.min(6, userData.totalWorkouts - 4)), xp: 110 },
    ];
  }, [userData.totalWorkouts]);

  const dashboardPieData = useMemo(() => {
    return [
      { name: "Força", value: 42 },
      { name: "Cardio", value: 30 },
      { name: "Flex", value: 18 },
      { name: "Mobilidade", value: 10 },
    ];
  }, []);

  const weightData = useMemo(() => {
    return weightLogs.map((log, index) => ({
      date: new Date(log.date).toLocaleDateString(),
      weight: log.weight,
      index,
    }));
  }, [weightLogs]);

  const pieColors = ["#ff4500", "#ff8c00", "#f6b042", "#ffaa33"];

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
        <h2>Olá <span>{userData.name || "USUÁRIO"}</span> !</h2>
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
          <div className="stat-icon"><BarbellIcon /></div>
          <div className="stat-info">
            <h4>Treinos Feitos</h4>
            <p>{userData.totalWorkouts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FlameIcon /></div>
          <div className="stat-info">
            <h4>Máx. Ofensiva</h4>
            <p>{userData.maxStreak} dias</p>
          </div>
        </div>
      </section>

      <h3 className="section-title">Dashboard de Treinos</h3>
      <section className="dashboard-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4>Atividade Semanal</h4>
              <p>Treinos e XP por dia</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#2c2c2c" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#ccc", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ccc", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip wrapperStyle={{ background: "#111", border: "1px solid #333" }} />
              <Bar dataKey="treinos" fill="#ff4500" radius={[8, 8, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4>Modalidades</h4>
              <p>Distribuição dos treinos</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={dashboardPieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                {dashboardPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: "#ccc" }} />
              <Tooltip wrapperStyle={{ background: "#111", border: "1px solid #333" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4>Acompanhamento de Peso</h4>
              <p>Evolução do peso ao longo do tempo</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            {weightLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#ccc" }}>
                Carregando dados de peso...
              </div>
            ) : weightData.length > 0 ? (
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#2c2c2c" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#ccc", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ccc", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip wrapperStyle={{ background: "#111", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="weight" stroke="#ff4500" strokeWidth={3} dot={{ fill: "#ff4500", strokeWidth: 2, r: 4 }} />
              </LineChart>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#ccc" }}>
                Nenhum dado de peso disponível. Adicione seu primeiro registro!
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <h3 className="section-title">Conquistas Recentes</h3>
      <section className="badges-list">
        {badgesLoading ? (
          <div className="badge-placeholder">Carregando conquistas...</div>
        ) : badges.length > 0 ? (
          badges.map((userBadge) => {
            const badge = userBadge.badge || userBadge;
            return (
              <div key={badge.id} className="badge-item">
                <div className="badge-icon"><TrophyIcon /></div>
                <div className="badge-text">
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="badge-placeholder">Você ainda não conquistou badges. Complete treinos para desbloquear novas conquistas!</div>
        )}
      </section>

      <CustomAlert config={alertConfig} />
    </div>
  );
}