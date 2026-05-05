import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gymService } from "../api/gymService";
import { gymAuthService } from "../api/gymAuthService";
import "./OwnerDashboard.css";
import CustomAlert from "./CustomAlert";

// Ícones Minimalistas Premium (Stroke 2)
const BarChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const TeacherIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/><path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z"/></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const FileTextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const BoxIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const PaletteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 1.9-1.3.2-.8.1-1.7-.5-2.2-.6-.5-.9-1.2-.9-2 0-1.7 1.3-3 3-3h3.1c1.7 0 3-1.3 3-3 0-4.7-4.2-8.5-9.6-8.5z"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const CreditCardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;

interface OwnerDashboardProps {
  gymId: string;
  gymName: string;
  token: string;
  onLogout: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ gymId, gymName, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"stats" | "personals" | "announcements" | "members" | "settings">("stats");
  const [stats, setStats] = useState<any>(null);
  const [personals, setPersonals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [dashboardTheme, setDashboardTheme] = useState(localStorage.getItem("theme") || "dark");
  
  const [isAddPersonalModalOpen, setIsAddPersonalModalOpen] = useState(false);
  const [newPersonalData, setNewPersonalData] = useState({ name: "", email: "", password: "", specialization: "", bio: "", certifications: "" });
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [existingUserName, setExistingUserName] = useState("");

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementData, setAnnouncementData] = useState({ title: "", content: "", priority: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    if (gymId) {
      loadDashboardData();
    }
  }, [activeTab, gymId]);

  useEffect(() => {
    document.body.setAttribute("data-theme", dashboardTheme);
    localStorage.setItem("theme", dashboardTheme);
  }, [dashboardTheme]);

  const loadDashboardData = async () => {
    if (!gymId || gymId === "null") return;
    
    try {
      setLoading(true);
      const [statsData, personalsData, announcementsData, membersData] = await Promise.all([
        gymService.getGymStats(gymId),
        gymService.getOwnerGymPersonals(gymId),
        gymService.getGymAnnouncements(gymId),
        gymService.getGymMembers(gymId)
      ]);
      setStats(statsData);
      setPersonals(personalsData);
      setAnnouncements(announcementsData);
      setMembers(membersData);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      showAlert("Erro de Conexão", "Não foi possível carregar os dados administrativos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "info") => {
    setAlertConfig({
      isOpen: true, title: title, message: message, type: type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPersonal = () => {
      setIsAddPersonalModalOpen(true);
  };

  const handleCloseAddPersonalModal = () => {
      setIsAddPersonalModalOpen(false);
      setNewPersonalData({ name: "", email: "", password: "", specialization: "", bio: "", certifications: "" });
      setEmailExists(false);
      setExistingUserName("");
      setEmailCheckLoading(false);
  };

  const handleEmailBlur = async () => {
    const email = newPersonalData.email;
    if (!email || !email.includes("@")) return;

    try {
      setEmailCheckLoading(true);
      const result = await gymAuthService.checkEmail(email);
      if (result.exists) {
        setEmailExists(true);
        setExistingUserName(result.user.name);
        setNewPersonalData(prev => ({ ...prev, name: result.user.name, password: "EXISTING_USER" }));
      } else {
        setEmailExists(false);
        setExistingUserName("");
        if (newPersonalData.password === "EXISTING_USER") {
          setNewPersonalData(prev => ({ ...prev, password: "" }));
        }
      }
    } catch (err) {
      console.error("Erro ao verificar email:", err);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const submitAddPersonal = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!gymId) return;
      try {
          await gymAuthService.createPersonal(gymId, newPersonalData);
          showAlert("Sucesso", "Personal trainer cadastrado na equipe!", "success");
          handleCloseAddPersonalModal();
          loadDashboardData();
      } catch (err: any) {
          showAlert("Erro", err.response?.data?.error || "Erro ao cadastrar personal", "error");
      }
  };

  const handleDeletePersonal = async (personalId: string) => {
      if (!gymId) return;
      const confirm = window.confirm("Tem certeza que deseja remover este personal da equipe?");
      if (!confirm) return;
      
      try {
          await gymAuthService.deletePersonal(gymId, personalId);
          showAlert("Sucesso", "Personal removido da equipe.", "success");
          loadDashboardData();
      } catch (err: any) {
          showAlert("Erro", err.response?.data?.error || "Erro ao remover personal", "error");
      }
  };

  const handleAddAnnouncement = () => {
      setEditingAnnouncement(null);
      setAnnouncementData({ title: "", content: "", priority: 0 });
      setIsAnnouncementModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: any) => {
      setEditingAnnouncement(announcement);
      setAnnouncementData({ 
          title: announcement.title, 
          content: announcement.content, 
          priority: announcement.priority 
      });
      setIsAnnouncementModalOpen(true);
  };

  const submitAnnouncement = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!gymId || gymId === "null") {
          showAlert("Erro", "ID da academia não encontrado. Tente logar novamente.", "error");
          return;
      }
      try {
          if (editingAnnouncement) {
              await gymService.updateAnnouncement(editingAnnouncement.id, announcementData);
              showAlert("Sucesso", "Comunicado atualizado!", "success");
          } else {
              await gymService.createAnnouncement({ ...announcementData, gymId: gymId });
              showAlert("Sucesso", "Comunicado publicado!", "success");
          }
          setIsAnnouncementModalOpen(false);
          loadDashboardData();
      } catch (err: any) {
          showAlert("Erro", err.response?.data?.error || "Erro ao salvar comunicado", "error");
      }
  };

  const handleDeleteAnnouncement = async (id: string) => {
      if (!window.confirm("Deseja realmente excluir este comunicado?")) return;
      try {
          await gymService.deleteAnnouncement(id);
          showAlert("Sucesso", "Comunicado removido.", "success");
          loadDashboardData();
      } catch (err: any) {
          showAlert("Erro", "Erro ao excluir comunicado", "error");
      }
  };

  const navItems = [
    { id: "stats", label: "Dashboard", icon: <BarChartIcon /> },
    { id: "personals", label: "Equipe", icon: <TeacherIcon /> },
    { id: "announcements", label: "Avisos", icon: <BellIcon /> },
    { id: "members", label: "Comunidade", icon: <UsersIcon /> },
    { id: "finance", label: "Financeiro", icon: <DollarIcon />, soon: true },
    { id: "reports", label: "Relatórios", icon: <FileTextIcon />, soon: true },
    { id: "inventory", label: "Inventário", icon: <BoxIcon />, soon: true },
    { id: "settings", label: "Configurações", icon: <SettingsIcon /> },
  ];

  return (
    <div className="owner-dashboard-container">
      {/* SIDEBAR DESKTOP */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="app-logo">Gym<span>Club</span></div>
          <p className="sidebar-subtitle">Painel Gestor</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? "active" : ""} ${item.soon ? "item-soon" : ""}`}
              onClick={() => !item.soon && setActiveTab(item.id as any)}
            >
              <div className="icon-wrapper">{item.icon}</div>
              <span className="item-label">{item.label}</span>
              {item.soon && <span className="soon-badge">Em Breve</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="gym-info-mini">
            <div className="gym-avatar">{gymName ? gymName.charAt(0) : "G"}</div>
            <div className="gym-details">
              <p className="gym-name-text">{gymName || "Academia"}</p>
              <code className="gym-id-text" onClick={() => {
                  if (gymId) {
                      navigator.clipboard.writeText(gymId);
                      showAlert("Copiado!", "ID da academia copiado.", "success");
                  }
              }}>#{gymId ? gymId.substring(0, 6).toUpperCase() : "------"}</code>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={onLogout}>
            <LogoutIcon />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="dashboard-main-content">
        <header className="dashboard-top-nav">
           <div className="page-title-section">
              <h1>{navItems.find(i => i.id === activeTab)?.label}</h1>
              <p>Gerenciando {gymName || "sua unidade"}</p>
           </div>
           <div className="top-nav-actions">
              <div className="gym-id-badge" onClick={() => {
                  if (gymId) {
                    navigator.clipboard.writeText(gymId);
                    showAlert("Copiado!", "ID da academia copiado.", "success");
                  }
              }}>
                  #{gymId ? gymId.substring(0, 8).toUpperCase() : "------"}
              </div>
           </div>
        </header>

        <div className="content-scroll-area">
          <div className="content-container fade-in">
              {activeTab === "stats" && stats && (
                <div className="tab-fade-content">
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon members"><UsersIcon /></div>
                      <div className="metric-data">
                        <span className="label">Total de Alunos</span>
                        <span className="value">{stats.stats.totalMembers}</span>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon personals"><TeacherIcon /></div>
                      <div className="metric-data">
                        <span className="label">Equipe Personal</span>
                        <span className="value">{stats.stats.totalPersonals}</span>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon checkin"><CheckIcon /></div>
                      <div className="metric-data">
                        <span className="label">Check-ins Hoje</span>
                        <span className="value">{stats.stats.todayCheckIns}</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-grid">
                      {/* LADO ESQUERDO: RANKING */}
                      <section className="panel-card">
                          <div className="panel-header">
                              <div className="panel-title">
                                  <TrophyIcon />
                                  <h3>Leaderboard de Alunos</h3>
                              </div>
                          </div>
                          <div className="ranking-list">
                              {stats.topRanking.map((user: any, index: number) => (
                                  <div key={index} className="ranking-item">
                                      <div className={`rank-pos top-${index + 1}`}>#{index + 1}</div>
                                      <div className="rank-name">{user.user.name}</div>
                                      <div className="rank-xp">{user.totalXpGained} XP</div>
                                  </div>
                              ))}
                          </div>
                      </section>

                      {/* LADO DIREITO: AÇÕES RÁPIDAS */}
                      <section className="panel-card quick-actions-panel">
                          <div className="panel-header">
                              <div className="panel-title">
                                  <h3>Ações do Gestor</h3>
                              </div>
                          </div>
                          <div className="quick-actions-grid">
                              <button className="btn-quick-action" onClick={() => {
                                  setActiveTab("announcements");
                                  handleAddAnnouncement();
                              }}>
                                  <div className="action-icon-box"><BellIcon /></div>
                                  <div className="action-text-box">
                                      <span>Publicar Aviso</span>
                                      <p>Alertar todos os alunos</p>
                                  </div>
                              </button>
                              <button className="btn-quick-action" onClick={handleAddPersonal}>
                                  <div className="action-icon-box"><PlusIcon /></div>
                                  <div className="action-text-box">
                                      <span>Vincular Professor</span>
                                      <p>Novo cadastro na equipe</p>
                                  </div>
                              </button>
                              <button className="btn-quick-action" onClick={() => setActiveTab("settings")}>
                                  <div className="action-icon-box"><SettingsIcon /></div>
                                  <div className="action-text-box">
                                      <span>Editar Unidade</span>
                                      <p>Informações da academia</p>
                                  </div>
                              </button>
                          </div>
                      </section>
                  </div>
                </div>
              )}

              {activeTab === "personals" && (
                <div className="tab-fade-content">
                    <header className="content-sub-header">
                      <h2>Equipe de Professores</h2>
                      <button className="btn-primary-dash" onClick={handleAddPersonal}>
                          Adicionar Cadastro
                      </button>
                    </header>
                    <div className="grid-container">
                      {personals.length === 0 ? (
                          <div className="empty-state"><p>Nenhum professor vinculado.</p></div>
                      ) : (
                          personals.map(p => (
                              <div key={p.id} className="card-item">
                                  <div className="card-header">
                                      <div className="avatar">{(p.name || p.user?.name)?.charAt(0)}</div>
                                      <div className="header-info">
                                          <h3>{p.name || p.user?.name}</h3>
                                          <span className="spec-tag">{p.specialization || "Instrutor Geral"}</span>
                                      </div>
                                      <button 
                                        className="btn-danger-dash" 
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginLeft: 'auto' }}
                                        onClick={() => handleDeletePersonal(p.id)}
                                        title="Remover Professor"
                                      >
                                        Remover
                                      </button>
                                  </div>
                                  <div className="card-footer">
                                      <UsersIcon />
                                      <span>{p.studentsCount || p.students?.length || 0} ALUNOS</span>
                                  </div>
                              </div>
                          ))
                      )}
                    </div>
                </div>
              )}

              {activeTab === "announcements" && (
                  <div className="tab-fade-content">
                      <header className="content-sub-header">
                          <h2>Painel de Comunicados</h2>
                          <p className="sub-info">Gerencie os avisos que aparecem para seus alunos.</p>
                          <button className="btn-primary-dash" style={{ marginTop: '16px' }} onClick={handleAddAnnouncement}>
                              Criar Novo Comunicado
                          </button>
                      </header>
                      <div className="announcements-list">
                          {announcements.length === 0 ? (
                              <div className="empty-state"><p>Sem avisos no momento.</p></div>
                          ) : (
                              announcements.map(a => (
                                  <div key={a.id} className={`announcement-card glass priority-${a.priority}`}>
                                      <div className="ann-header">
                                          <h3>{a.title}</h3>
                                          <span className="ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <div className="ann-content">
                                          <p>{a.content}</p>
                                      </div>
                                      <div className="ann-actions">
                                          <button className="btn-edit-ann" onClick={() => handleEditAnnouncement(a)}>Editar</button>
                                          <button className="btn-delete-ann" onClick={() => handleDeleteAnnouncement(a.id)}>Excluir</button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}

              {activeTab === "members" && (
                <div className="tab-fade-content">
                    <header className="content-sub-header">
                          <h2>Membros Ativos</h2>
                          <div className="search-box-dash">
                              <input 
                                  type="text" 
                                  placeholder="Filtrar por nome..." 
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                              />
                          </div>
                    </header>
                    
                    <div className="members-table-container">
                      <table className="members-table">
                        <thead>
                          <tr>
                            <th>Atleta</th>
                            <th>Email</th>
                            <th>Nível</th>
                            <th>Frequência</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map(member => (
                            <tr key={member.id}>
                              <td className="member-name-cell">
                                <div className="mini-avatar">{member.name.charAt(0)}</div>
                                {member.name}
                              </td>
                              <td>{member.email}</td>
                              <td><span className="level-tag">Lvl {member.level}</span></td>
                              <td>{member.streak} dias</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}

              {activeTab === "settings" && (
                  <div className="tab-fade-content">
                      <header className="content-sub-header">
                          <h2>Configurações Administrativas</h2>
                      </header>
                      
                      <div className="settings-container">
                          {/* SESSÃO: GERAL */}
                          <section className="settings-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <UsersIcon />
                                      <h3>Perfil da Academia</h3>
                                  </div>
                              </div>
                              <div className="setting-row">
                                  <div className="setting-info">
                                      <h4>Identificação</h4>
                                      <p>{gymName}</p>
                                  </div>
                                  <button className="btn-secondary-dash" onClick={() => showAlert("Info", "Funcionalidade em desenvolvimento", "info")}>Editar</button>
                              </div>
                              <div className="setting-row">
                                  <div className="setting-info">
                                      <h4>ID do Sistema</h4>
                                      <p>#{gymId?.substring(0, 8).toUpperCase()}</p>
                                  </div>
                                  <button className="btn-secondary-dash" onClick={() => {
                                      if(gymId) {
                                          if (navigator.clipboard && navigator.clipboard.writeText) {
                                              navigator.clipboard.writeText(gymId).then(() => {
                                                  showAlert("Copiado!", "ID da academia copiado com sucesso.", "success");
                                              });
                                          } else {
                                              // Fallback para navegadores sem suporte
                                              const textArea = document.createElement("textarea");
                                              textArea.value = gymId;
                                              document.body.appendChild(textArea);
                                              textArea.select();
                                              try {
                                                  document.execCommand('copy');
                                                  showAlert("Copiado!", "ID da academia copiado (fallback).", "success");
                                              } catch (err) {
                                                  showAlert("Erro", "Não foi possível copiar o ID.", "error");
                                              }
                                              document.body.removeChild(textArea);
                                          }
                                      }
                                  }}>Copiar</button>
                              </div>
                          </section>

                          {/* SESSÃO: INTERFACE */}
                          <section className="settings-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <PaletteIcon />
                                      <h3>Aparência</h3>
                                  </div>
                              </div>
                              <div className="setting-row" onClick={() => setDashboardTheme(dashboardTheme === "dark" ? "light" : "dark")} style={{ cursor: 'pointer' }}>
                                  <div className="setting-info">
                                      <h4>Tema Visual</h4>
                                      <p>Modo {dashboardTheme === "dark" ? "Claro" : "Escuro"}</p>
                                  </div>
                                  <div className="theme-toggle-wrapper">
                                      <div className={`theme-switch-pill ${dashboardTheme}`}>
                                          <div className="switch-dot">
                                              {dashboardTheme === "dark" ? <MoonIcon /> : <SunIcon />}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </section>

                          {/* SESSÃO: FINANCEIRO (TEMPLATE) */}
                          <section className="settings-card disabled-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <CreditCardIcon />
                                      <h3>Financeiro <span className="badge-soon">Em Breve</span></h3>
                                  </div>
                              </div>
                              <p className="template-text">Gestão de mensalidades e planos automatizados.</p>
                          </section>

                          {/* SESSÃO: NOTIFICAÇÕES (TEMPLATE) */}
                          <section className="settings-card disabled-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <MailIcon />
                                      <h3>Notificações <span className="badge-soon">Em Breve</span></h3>
                                  </div>
                              </div>
                              <p className="template-text">Alertas via WhatsApp e E-mail para seus alunos.</p>
                          </section>

                          {/* SESSÃO: SEGURANÇA (TEMPLATE) */}
                          <section className="settings-card disabled-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <LockIcon />
                                      <h3>Segurança <span className="badge-soon">Em Breve</span></h3>
                                  </div>
                              </div>
                              <p className="template-text">Controle de acessos e logs de auditoria.</p>
                          </section>

                          {/* SESSÃO: CONTA */}
                          <section className="settings-card danger-zone">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <LogoutIcon />
                                      <h3>Gestão da Conta</h3>
                                  </div>
                              </div>
                              <div className="setting-row">
                                  <div className="setting-info">
                                      <h4>Sair do Painel</h4>
                                      <p>Finalizar acesso administrativo</p>
                                  </div>
                                  <button className="btn-danger-dash" onClick={() => {
                                      setAlertConfig({
                                          isOpen: true,
                                          title: "Encerrar Sessão",
                                          message: "Deseja realmente sair do painel administrativo?",
                                          type: "error",
                                          confirmText: "Sim, Sair",
                                          cancelText: "Não, Manter",
                                          onConfirm: onLogout,
                                          onCancel: () => setAlertConfig({ isOpen: false })
                                      });
                                  }}>Logout</button>
                              </div>
                          </section>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </main>

      {/* NAVEGAÇÃO INFERIOR (APENAS MOBILE) */}
      <nav className="admin-tab-bar">
        <div className="tab-bar-content">
          {navItems.filter(i => !i.soon).map((item) => (
            <button 
              key={item.id}
              className={`tab-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id as any)}
            >
              <div className="pill-container">{item.icon}</div>
            </button>
          ))}
        </div>
      </nav>

      {isAddPersonalModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cadastrar Professor</h2>
            <form onSubmit={submitAddPersonal} className="modal-form">
              <div className="input-group">
                <label>E-mail Profissional</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    placeholder="joao@academia.com" 
                    required 
                    value={newPersonalData.email} 
                    onChange={(e) => {
                      setNewPersonalData({...newPersonalData, email: e.target.value});
                      if (emailExists) setEmailExists(false);
                    }} 
                    onBlur={handleEmailBlur}
                    className="modal-input" 
                  />
                  {emailCheckLoading && <div className="input-loader-mini"></div>}
                </div>
                {emailExists && (
                  <p className="input-helper-success">
                    Usuário encontrado: <strong>{existingUserName}</strong>. Ele será vinculado à sua academia.
                  </p>
                )}
              </div>

              {!emailExists && (
                <>
                  <div className="input-group">
                    <label>Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva" 
                      required 
                      value={newPersonalData.name} 
                      onChange={(e) => setNewPersonalData({...newPersonalData, name: e.target.value})} 
                      className="modal-input" 
                    />
                  </div>

                  <div className="input-group">
                    <label>Senha Temporária</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={newPersonalData.password} 
                      onChange={(e) => setNewPersonalData({...newPersonalData, password: e.target.value})} 
                      className="modal-input" 
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label>Especialização</label>
                <input 
                  type="text" 
                  placeholder="Ex: Musculação / Crossfit" 
                  required 
                  value={newPersonalData.specialization} 
                  onChange={(e) => setNewPersonalData({...newPersonalData, specialization: e.target.value})} 
                  className="modal-input" 
                />
              </div>

              <div className="input-group">
                <label>Biografia (Opcional)</label>
                <textarea 
                  placeholder="Fale um pouco sobre a experiência do professor..." 
                  value={newPersonalData.bio} 
                  onChange={(e) => setNewPersonalData({...newPersonalData, bio: e.target.value})} 
                  className="modal-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary-dash" onClick={handleCloseAddPersonalModal}>Cancelar</button>
                <button type="submit" className="btn-primary-dash">Cadastrar Equipe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAnnouncementModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingAnnouncement ? "Editar Comunicado" : "Novo Comunicado"}</h2>
            <form onSubmit={submitAnnouncement} className="modal-form">
              <div className="input-group">
                <label>Título do Aviso</label>
                <input 
                  type="text" 
                  placeholder="Ex: Manutenção da Área de Cardio" 
                  required 
                  value={announcementData.title} 
                  onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})} 
                  className="modal-input" 
                />
              </div>

              <div className="input-group">
                <label>Conteúdo</label>
                <textarea 
                  placeholder="Descreva os detalhes para seus alunos..." 
                  required
                  value={announcementData.content} 
                  onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})} 
                  className="modal-input" 
                  style={{ minHeight: '120px', resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label>Nível de Prioridade</label>
                <select 
                  className="modal-input"
                  value={announcementData.priority}
                  onChange={(e) => setAnnouncementData({...announcementData, priority: parseInt(e.target.value)})}
                >
                  <option value={0}>Normal (Cinza)</option>
                  <option value={1}>Importante (Laranja)</option>
                  <option value={2}>Urgente (Vermelho)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary-dash" onClick={() => setIsAnnouncementModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary-dash">
                    {editingAnnouncement ? "Salvar Alterações" : "Publicar Agora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
};
