import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "./Perfil.css";
import CustomAlert from "../Componentes/CustomAlert";
import { getUser, updateUser } from "../api/userService";
import { getUserBadges } from "../api/badgeService";
import { weightService } from "../api/weightService";
const { getWeightLogs } = weightService;
import { getFocusStats, getWeeklyStats } from "../api/workoutService";
import { StreakIcon } from "../Componentes/StreakIcon";
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
  AreaChart,
  Area,
} from "recharts";

const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const BarbellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M6 7v10"/><path d="M4 9v6"/><path d="M18 7v10"/><path d="M20 9v6"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const TargetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("evolucao");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [editData, setEditProfileData] = useState({ name: "", sex: "M" });
  const [focusData, setFocusData] = useState([]);
  const [weeklyData, setWeeklyStats] = useState([]);
  
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightLoading, setWeightLoading] = useState(true);

  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    level: 1,
    xp: 0,
    currentXP: 0,
    nextLevelXP: 100,
    totalWorkouts: 0,
    streak: 0,
    maxStreak: 0,
    weightGoal: 0,
    sex: "M"
  });

  const loadAllData = async () => {
    const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userFromStorage?.id) return;

    try {
      const [user, userBadges, logs, stats, weekly] = await Promise.all([
        getUser(userFromStorage.id),
        getUserBadges(),
        getWeightLogs(),
        getFocusStats(),
        getWeeklyStats()
      ]);

      const totalXp = user.xp || 0;
      const calculatedLevel = Math.floor(totalXp / 100) + 1;
      const currentXP = totalXp % 100;

      setUserData({
        id: user.id,
        name: user.name,
        email: user.email,
        level: calculatedLevel,
        xp: totalXp,
        currentXP,
        nextLevelXP: 100,
        totalWorkouts: user.totalWorkoutsDone || 0,
        streak: user.streak,
        maxStreak: user.maxStreak || 0,
        weightGoal: user.weightGoal || 0,
        sex: user.sex || "M"
      });
      setNewGoal(user.weightGoal?.toString() || "");
      setEditProfileData({ name: user.name, sex: user.sex || "M" });
      setBadges(userBadges);
      setWeightLogs(logs);
      setFocusData(stats);
      setWeeklyStats(weekly);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setBadgesLoading(false);
      setWeightLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    window.addEventListener('userDataUpdated', loadAllData);
    return () => window.removeEventListener('userDataUpdated', loadAllData);
  }, []);

  const progressPercentage = (userData.currentXP / userData.nextLevelXP) * 100;
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
  
  const motivationalMessage = useMemo(() => {
    if (!userData.weightGoal || currentWeight === 0) return null;
    const diff = parseFloat((currentWeight - userData.weightGoal).toFixed(1));
    const absDiff = Math.abs(diff);

    if (diff === 0) return "Meta atingida! Parabéns!";
    
    if (diff > 0) {
      const messages = [
        `Faltam ${absDiff} kg para a meta`,
        `Foco! Faltam ${absDiff} kg`,
        `Quase lá! Faltam ${absDiff} kg`
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        `Faltam ${absDiff} kg para o objetivo`,
        `Rumo ao topo! Faltam ${absDiff} kg`,
        `Foco no ganho! Faltam ${absDiff} kg`
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }, [userData.weightGoal, currentWeight]);

  const handleUpdateGoal = async () => {
    if (!userData.id || !newGoal) return;
    try {
      const updatedUser = await updateUser(userData.id, {
        weightGoal: parseFloat(newGoal)
      });
      setUserData(prev => ({ ...prev, weightGoal: updatedUser.weightGoal }));
      setIsEditingGoal(false);
      const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userFromStorage, weightGoal: updatedUser.weightGoal }));
    } catch (error) {
      console.error("Erro ao atualizar meta", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData.id || !editData.name) return;
    try {
      const updatedUser = await updateUser(userData.id, {
        name: editData.name,
        sex: editData.sex
      });
      setUserData(prev => ({ ...prev, name: updatedUser.name, sex: updatedUser.sex }));
      setIsEditingProfile(false);
      const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userFromStorage, name: updatedUser.name }));
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
    }
  };

  const weightData = useMemo(() => weightLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
    weight: log.weight,
  })).slice(-7), [weightLogs]);

  const pieColors = ["#ff4500", "#ff8c00", "#f6b042", "#ffaa33", "#ffcc00", "#d44000"];

  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Sair da Conta",
      message: "Tem certeza que deseja desconectar?",
      type: "error",
      onConfirm: () => {
        googleLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    });
  };

  return (
    <div className="perfil-container">
      <header className="perfil-header-v3">
        <div className="header-spacer-v3"></div>
        <div className="app-logo">
          Gym<span>Club</span>
        </div>
        <button className="btn-logout-v3" onClick={() => navigate("/configuracoes")}>
          <SettingsIcon />
        </button>
      </header>

      <section className="profile-card-premium">
        <div className="profile-main-info">
          <div className="avatar-container">
            <div className="profile-avatar-large">
              {userData.name.charAt(0)}
            </div>
            <div className="level-badge-float">NÍVEL {userData.level}</div>
          </div>
          <div className="profile-meta-full">
            <h3 className="user-display-name">{userData.name}</h3>
            <div className="xp-container-full">
              <div className="xp-label-full">
                <span>Progresso</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="xp-bar-bg-full">
                <div className="xp-bar-fill-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="goal-status-card">
          <div className="goal-info">
            <div className="goal-icon"><TargetIcon /></div>
            <div className="goal-header-text">
              <p>Meta de Peso</p>
              <div className="goal-values-row">
                <span className="current-v">{currentWeight}kg</span>
                <span className="separator">atualmente / meta</span>
                <span className="target-v">{userData.weightGoal || 0}kg</span>
              </div>
            </div>
          </div>
          {motivationalMessage && (
            <div className={`weight-diff-badge ${parseFloat(currentWeight) > parseFloat(userData.weightGoal) ? 'above' : 'below'}`}>
              {motivationalMessage}
            </div>
          )}
        </div>
      </section>

      <div className="stats-mini-grid">
        <div className="stat-item">
          <BarbellIcon />
          <span>{userData.totalWorkouts} Treinos</span>
        </div>
        <div className="stat-item">
          <StreakIcon streak={userData.streak} />
          <span>{userData.streak} {userData.streak === 1 ? "Dia" : "Dias"}</span>
        </div>
      </div>

      <nav className="tab-navigation">
        <button className={activeTab === "evolucao" ? "active" : ""} onClick={() => setActiveTab("evolucao")}>Evolução</button>
        <button className={activeTab === "peso" ? "active" : ""} onClick={() => setActiveTab("peso")}>Peso</button>
        <button className={activeTab === "conquistas" ? "active" : ""} onClick={() => setActiveTab("conquistas")}>Conquistas</button>
      </nav>

      <main className="tab-content">
        {activeTab === "evolucao" && (
          <div className="fade-in">
            <div className="chart-card-v2">
              <h4>Atividade Semanal</h4>
              {weeklyData.some(d => d.treinos > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid stroke="#222" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,69,0,0.1)'}} contentStyle={{background: '#111', border: 'none', borderRadius: '8px'}} />
                    <Bar dataKey="treinos" fill="#ff4500" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state-v2">
                  <p>Você ainda não realizou treinos esta semana.</p>
                  <button onClick={() => navigate("/treinos")} className="btn-action-empty">Começar Agora</button>
                </div>
              )}
            </div>
            
            <div className="chart-card-v2">
              <h4>Distribuição de Foco</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie 
                    data={focusData.length > 0 && focusData[0].name !== "Sem dados" ? focusData : [{name: 'Sem treinos', value: 1}]} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {focusData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    {(focusData.length === 0 || focusData[0].name === "Sem dados") && <Cell fill="#222" />}
                  </Pie>
                  <Tooltip contentStyle={{background: '#111', border: 'none', borderRadius: '8px'}} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "peso" && (
          <div className="fade-in">
            <div className="chart-card-v2">
              <div className="chart-header-inline">
                <h4>Evolução de Peso</h4>
                <span className="weight-trend">Últimos 7 registros</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {weightData.length > 0 ? (
                  <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-color)" vertical={false} strokeDasharray="3 3" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700}}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(20, 20, 20, 0.9)', 
                        border: '1px solid var(--primary-color)', 
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '800',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                      }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: 'var(--primary-color)', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="var(--primary-color)" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      activeDot={{ 
                        r: 6, 
                        fill: 'var(--primary-color)', 
                        stroke: '#fff', 
                        strokeWidth: 2,
                        shadowBlur: 10,
                        shadowColor: 'var(--primary-glow)'
                      }}
                    />
                  </AreaChart>
                ) : (
                  <div className="empty-state-v2">Nenhum dado de peso registrado.</div>
                )}
              </ResponsiveContainer>
            </div>

            <div className="chart-card-v2">
              <h4 className="section-subtitle-inside">Histórico Recente</h4>
              <div className="weight-list">
                {weightLogs.length > 0 ? (
                  weightLogs.slice().reverse().map((log, index) => {
                    const prevLog = weightLogs[weightLogs.length - 1 - index - 1];
                    const diff = prevLog ? (log.weight - prevLog.weight).toFixed(1) : null;
                    return (
                      <div key={log.id} className="weight-item">
                        <div className="weight-item-date">{new Date(log.date).toLocaleDateString()}</div>
                        <div className="weight-item-value">{log.weight} kg</div>
                        <div className={`weight-item-diff ${!diff || diff === "0.0" ? '' : parseFloat(diff) > 0 ? 'up' : 'down'}`}>
                          {diff && diff !== "0.0" ? (parseFloat(diff) > 0 ? `+${diff}` : diff) : '-'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-history">Seu histórico aparecerá aqui.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "conquistas" && (
          <div className="badges-grid-v2 fade-in">
            {badges.length > 0 ? (
              badges.map((b) => (
                <div key={b.id} className="badge-card-v2">
                  <div className="badge-icon-v2"><TrophyIcon /></div>
                  <h4>{(b.badge || b).name}</h4>
                  <p>{(b.badge || b).description}</p>
                </div>
              ))
            ) : (
              <div className="empty-achievements-v2">
                <div className="empty-badge-outline">
                  <TrophyIcon />
                </div>
                <div className="empty-text-group">
                  <h4>Galeria de Conquistas</h4>
                  <p>Você ainda não desbloqueou badges.</p>
                  <span className="empty-subtext">Mantenha a constância nos treinos para ganhar reconhecimentos exclusivos.</span>
                </div>
                <button onClick={() => navigate("/treinos")} className="btn-action-empty">Ver Treinos</button>
              </div>
            )}
          </div>
        )}
      </main>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
