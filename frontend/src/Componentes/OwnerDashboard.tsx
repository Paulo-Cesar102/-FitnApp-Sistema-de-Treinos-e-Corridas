import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as gymService from "../api/gymService";
import * as workoutService from "../api/workoutService";
import "./OwnerDashboard.css";
import CustomAlert from "./CustomAlert";

// Ícones Minimalistas Premium
const BarChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const TeacherIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/><path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z"/></svg>;

interface OwnerDashboardProps {
  gymId: string;
  gymName: string;
  token: string;
  onLogout: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ gymId, gymName, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"stats" | "personals" | "announcements" | "members">("stats");
  const [stats, setStats] = useState<any>(null);
  const [personals, setPersonals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, personalsData, announcementsData, membersData] = await Promise.all([
        gymService.getGymStats(gymId),
        gymService.getGymPersonals(gymId),
        gymService.getGymAnnouncements(gymId),
        gymService.getGymMembers(gymId)
      ]);
      setStats(statsData);
      setPersonals(personalsData);
      setAnnouncements(announcementsData);
      setMembers(membersData);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "info") => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

  return (
    <div className="owner-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">Gym<span>Club</span></div>
          <p className="gym-name-subtitle">{gymName}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <BarChartIcon /> Visão Geral
          </button>
          <button 
            className={`nav-item ${activeTab === "personals" ? "active" : ""}`}
            onClick={() => setActiveTab("personals")}
          >
            <TeacherIcon /> Personals
          </button>
          <button 
            className={`nav-item ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            <BellIcon /> Avisos
          </button>
          <button 
            className={`nav-item ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <UsersIcon /> Membros
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout-dash" onClick={onLogout}>
            <LogoutIcon /> Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {activeTab === "stats" && stats && (
          <div className="tab-content fade-in">
             <header className="content-header">
                <h1>Painel de Controle</h1>
                <p>Métricas de engajamento e crescimento</p>
             </header>

             <div className="metrics-grid">
               <div className="metric-card glass">
                 <div className="metric-icon members"><UsersIcon /></div>
                 <div className="metric-data">
                   <span className="label">Total de Alunos</span>
                   <span className="value">{stats.stats.totalMembers}</span>
                 </div>
               </div>

               <div className="metric-card glass">
                 <div className="metric-icon personals"><TeacherIcon /></div>
                 <div className="metric-data">
                   <span className="label">Equipe Personal</span>
                   <span className="value">{stats.stats.totalPersonals}</span>
                 </div>
               </div>

               <div className="metric-card glass">
                 <div className="metric-icon checkin"><CheckIcon /></div>
                 <div className="metric-data">
                   <span className="label">Check-ins Hoje</span>
                   <span className="value">{stats.stats.todayCheckIns}</span>
                 </div>
               </div>
             </div>

             <div className="dashboard-row">
                 <div className="ranking-panel glass">
                     <div className="panel-header">
                         <TrophyIcon />
                         <h3>Top 10 Alunos</h3>
                     </div>
                     <div className="ranking-table">
                         {stats.topRanking.map((user: any, index: number) => (
                             <div key={index} className="ranking-row">
                                 <div className="user-pos">#{index + 1}</div>
                                 <div className="user-name">{user.user.name}</div>
                                 <div className="user-score">{user.totalXpGained} XP</div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
          </div>
        )}

        {activeTab === "personals" && (
           <div className="tab-content fade-in">
              <header className="content-header">
                 <h1>Gestão de Personals</h1>
                 <button className="btn-primary-dash" onClick={() => navigate("/register-owner")}>
                    Adicionar Personal
                 </button>
              </header>
              <div className="personals-list-dash">
                 {personals.length === 0 ? (
                     <div className="empty-state">Nenhum personal cadastrado nesta unidade.</div>
                 ) : (
                     personals.map(p => (
                         <div key={p.id} className="personal-card-dash glass">
                             <div className="p-info">
                                 <h3>{p.user.name}</h3>
                                 <span>{p.specialization || "Instrutor Geral"}</span>
                             </div>
                             <div className="p-stats">
                                 <span>{p.students?.length || 0} alunos vinculados</span>
                             </div>
                         </div>
                     ))
                 )}
              </div>
           </div>
        )}

        {activeTab === "announcements" && (
            <div className="tab-content fade-in">
                <header className="content-header">
                    <h1>Comunicados</h1>
                    <button className="btn-primary-dash">Novo Aviso</button>
                </header>
                <div className="announcements-list-dash">
                    {announcements.length === 0 ? (
                        <div className="empty-state">Não há avisos publicados.</div>
                    ) : (
                        announcements.map(a => (
                            <div key={a.id} className="announcement-card-dash glass">
                                <h3>{a.title}</h3>
                                <p>{a.content}</p>
                                <span className="date">Publicado em: {new Date(a.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === "members" && (
           <div className="tab-content fade-in">
               <header className="content-header">
                    <h1>Lista de Membros</h1>
                    <div className="search-box-dash">
                        <input type="text" placeholder="Filtrar por nome ou e-mail..." />
                    </div>
               </header>
               
               <div className="members-table-container glass">
                 <table className="members-table">
                   <thead>
                     <tr>
                       <th>Atleta</th>
                       <th>E-mail</th>
                       <th>Status</th>
                       <th>Sequência</th>
                       <th>Última Atividade</th>
                     </tr>
                   </thead>
                   <tbody>
                     {members.map(member => (
                       <tr key={member.id}>
                         <td className="member-name-cell">
                           <div className="mini-avatar">{member.name.charAt(0)}</div>
                           {member.name}
                         </td>
                         <td>{member.email}</td>
                         <td>
                           <span className="level-tag">Lvl {member.level}</span>
                         </td>
                         <td>{member.streak} dias</td>
                         <td>{member.lastActivityDate ? new Date(member.lastActivityDate).toLocaleDateString() : "---"}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
           </div>
        )}
      </main>

      <CustomAlert config={alertConfig} />
    </div>
  );
};
