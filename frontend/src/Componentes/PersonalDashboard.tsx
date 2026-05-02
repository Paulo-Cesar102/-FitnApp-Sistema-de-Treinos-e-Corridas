import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gymService } from "../api/gymService";
import { getUserWorkouts } from "../api/workoutService";
import { socket } from "../service/socket";
import "./PersonalDashboard.css";
import CustomAlert from "./CustomAlert";

// Ícones Minimalistas Premium (Stroke 2)
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClipboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const RulerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0l12.6 12.6z"/><line x1="7.5" y1="10.5" x2="10.5" y2="7.5"/><line x1="10.5" y1="13.5" x2="13.5" y2="10.5"/><line x1="13.5" y1="16.5" x2="16.5" y2="13.5"/></svg>;
const AppleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4.97 0 9-3.03 9-9 0-4.97-3.03-9-9-9s-9 4.03-9 9c0 5.97 4.03 9 9 9z"/><path d="M12 6V2"/><path d="M16.3 3.7c-1.1 1.1-1.3 2.6-1.3 2.6s-1.5-.2-2.6-1.3c-1.1-1.1-1.1-2.9 0-4s2.9-1.1 4 0 1.1 2.9 0 4z"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="18.36" x2="5.64" y2="16.92"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const PaletteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 1.9-1.3.2-.8.1-1.7-.5-2.2-.6-.5-.9-1.2-.9-2 0-1.7 1.3-3 3-3h3.1c1.7 0 3-1.3 3-3 0-4.7-4.2-8.5-9.6-8.5z"/></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

interface PersonalDashboardProps {
  gymId: string;
  gymName: string;
  onLogout: () => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ gymId, gymName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"students" | "workouts" | "settings">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [dashboardTheme, setDashboardTheme] = useState(localStorage.getItem("theme") || "dark");
  
  const navigate = useNavigate();

  useEffect(() => {
    if (gymId && gymId !== "null") {
      loadDashboardData();
    }

    socket.on("live_activity_update", (data) => {
      setLiveActivities(data);
    });

    return () => {
      socket.off("live_activity_update");
    };
  }, [gymId]);

  useEffect(() => {
    document.body.setAttribute("data-theme", dashboardTheme);
    localStorage.setItem("theme", dashboardTheme);
  }, [dashboardTheme]);

  const loadDashboardData = async () => {
    if (!gymId || gymId === "null") return;

    try {
      setLoading(true);
      const userJson = sessionStorage.getItem("user");
      if (!userJson) return;
      const user = JSON.parse(userJson);
      
      const personalProfile = await gymService.getPersonalByUserId(user.id);
      if (personalProfile) {
        const data = await gymService.getPersonalStudents(personalProfile.id);
        setStudents(data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard personal:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentHistory = async (studentId: string) => {
    try {
      setHistoryLoading(true);
      const history = await getUserWorkouts(studentId);
      setStudentHistory(history || []);
    } catch (err) {
      console.error("Erro ao carregar historico do aluno:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "info") => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

  const handleConfirmLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Encerrar Sessão",
      message: "Deseja realmente sair do seu painel técnico?",
      type: "error",
      confirmText: "Sim, Sair",
      cancelText: "Não, Manter",
      onConfirm: onLogout,
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  const navItems = [
    { id: "students", label: "Meus Alunos", icon: <UsersIcon /> },
    { id: "workouts", label: "Biblioteca", icon: <ClipboardIcon /> },
    { id: "agenda", label: "Agenda", icon: <CalendarIcon />, soon: true },
    { id: "evaluation", label: "Avaliação", icon: <RulerIcon />, soon: true },
    { id: "nutrition", label: "Nutrição", icon: <AppleIcon />, soon: true },
    { id: "settings", label: "Configurações", icon: <SettingsIcon /> },
  ];

  return (
    <div className="personal-dashboard-container">
      {/* SIDEBAR DESKTOP */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="app-logo">Gym<span>Club</span></div>
          <p className="sidebar-subtitle">Portal Personal</p>
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
            <div className="gym-avatar personal">P</div>
            <div className="gym-details">
              <p className="gym-name-text">Área do Instrutor</p>
              <p className="gym-id-text">{gymName || "Academia"}</p>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={handleConfirmLogout}>
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
              <p>{activeTab === "students" ? "Acompanhe seus atletas em tempo real" : "Gerencie modelos de treinos"}</p>
           </div>
           <div className="top-nav-actions">
              <button className="mobile-logout-btn" onClick={handleConfirmLogout}>
                  <LogoutIcon />
              </button>
           </div>
        </header>

        <div className="content-scroll-area">
          <div className="content-container fade-in">
            {activeTab === "students" && (
              <div className="tab-fade-content">
                 <div className="students-grid">
                     {loading ? (
                        <p>Carregando atletas...</p>
                     ) : students.length === 0 ? (
                         <div className="empty-state">
                             <UsersIcon />
                             <p>Você ainda não tem alunos vinculados.</p>
                         </div>
                     ) : (
                         students.map((item) => {
                           const isOnline = liveActivities.some(act => act.studentName === item.student.name && act.status === "started");
                           return (
                             <div key={item.id} className={`student-card ${isOnline ? 'online' : ''}`}>
                                 {isOnline && <span className="online-badge">EM ATIVIDADE</span>}
                                 <div className="student-header-row">
                                    <div className="student-avatar-box">
                                        {item.student.name.charAt(0)}
                                    </div>
                                    <div className="student-main-info">
                                        <h3>{item.student.name}</h3>
                                        <p>Lvl {item.student.level} • {item.student.xp} XP</p>
                                    </div>
                                 </div>
                                 <div className="student-stats-row">
                                     <div className="stat-item">
                                         <span className="stat-label">Desde</span>
                                         <span className="stat-value">{new Date(item.assignedAt).toLocaleDateString()}</span>
                                     </div>
                                 </div>
                                 <div className="card-actions">
                                   <button 
                                     className="btn-action-view"
                                     onClick={() => {
                                        setSelectedStudent(item.student);
                                        loadStudentHistory(item.student.id);
                                     }}
                                   >
                                     Ver Evolução
                                   </button>
                                 </div>
                             </div>
                           );
                         })
                     )}
                 </div>
              </div>
            )}

            {activeTab === "workouts" && (
                <div className="tab-fade-content">
                    <header className="content-sub-header">
                        <h2>Biblioteca de Modelos</h2>
                        <button className="btn-primary-dash" onClick={() => navigate("/criar-treino")}>
                            Criar Novo
                        </button>
                    </header>
                    <div className="empty-state">
                        <ClipboardIcon />
                        <p>A funcionalidade de biblioteca de modelos está sendo otimizada.</p>
                        <span className="badge-soon">Em Breve</span>
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                  <div className="tab-fade-content">
                      <header className="content-sub-header">
                          <h2>Ajustes do Perfil</h2>
                      </header>
                      
                      <div className="settings-grid-dash">
                          {/* SESSÃO: PERFIL */}
                          <section className="settings-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <UsersIcon />
                                      <h3>Minha Conta Profissional</h3>
                                  </div>
                              </div>
                              <div className="setting-row">
                                  <div className="setting-info">
                                      <h4>Vinculado à Academia</h4>
                                      <p>{gymName}</p>
                                  </div>
                              </div>
                              <div className="setting-row">
                                  <div className="setting-info">
                                      <h4>Status de Instrutor</h4>
                                      <p>Verificado pela Unidade</p>
                                  </div>
                              </div>
                          </section>

                          {/* SESSÃO: INTERFACE */}
                          <section className="settings-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <PaletteIcon />
                                      <h3>Personalização</h3>
                                  </div>
                              </div>
                              <div className="setting-row" onClick={() => setDashboardTheme(dashboardTheme === "dark" ? "light" : "dark")} style={{ cursor: 'pointer' }}>
                                  <div className="setting-info">
                                      <h4>Tema do Painel</h4>
                                      <p>Mudar para modo {dashboardTheme === "dark" ? "Claro" : "Escuro"}</p>
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

                          {/* SESSÃO: PRIVACIDADE (TEMPLATE) */}
                          <section className="settings-card disabled-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <LockIcon />
                                      <h3>Privacidade <span className="badge-soon">Em Breve</span></h3>
                                  </div>
                              </div>
                              <p className="template-text">Controle quem pode ver seu perfil e currículo profissional.</p>
                          </section>

                          {/* SESSÃO: NOTIFICAÇÕES (TEMPLATE) */}
                          <section className="settings-card disabled-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <MailIcon />
                                      <h3>Alertas <span className="badge-soon">Em Breve</span></h3>
                                  </div>
                              </div>
                              <p className="template-text">Notificações de novos alunos e agendamentos.</p>
                          </section>

                          {/* SESSÃO: CONTA */}
                          <section className="settings-card danger-zone-card">
                              <div className="panel-header">
                                  <div className="panel-title">
                                      <LogoutIcon />
                                      <h3>Sessão</h3>
                                  </div>
                              </div>
                              <div className="setting-row no-bg">
                                  <div className="setting-info">
                                      <h4>Sair do Painel</h4>
                                      <p>Encerra sua sessão de instrutor.</p>
                                  </div>
                                  <button className="btn-danger-dash" onClick={handleConfirmLogout}>Sair Agora</button>
                              </div>
                          </section>
                      </div>
                  </div>
            )}
          </div>
        </div>
      </main>

      {/* NAVEGAÇÃO INFERIOR (MOBILE) */}
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

      {selectedStudent && (
          <div className="student-detail-overlay fade-in" onClick={() => setSelectedStudent(null)}>
              <div className="student-detail-modal glass" onClick={e => e.stopPropagation()}>
                  <header className="modal-top">
                      <div className="student-header-info">
                          <div className="avatar-large">{selectedStudent.name.charAt(0)}</div>
                          <div className="modal-title-box">
                              <h2>{selectedStudent.name}</h2>
                              <p>{selectedStudent.email}</p>
                          </div>
                      </div>
                      <button className="btn-close" onClick={() => setSelectedStudent(null)}>&times;</button>
                  </header>
                  
                  <div className="modal-body-personal">
                      <h3>Histórico de Treinos</h3>
                      <div className="history-list-personal">
                          {historyLoading ? <p>Buscando dados...</p> : studentHistory.length === 0 ? (
                              <p>Nenhum treino registrado.</p>
                          ) : (
                              studentHistory.map(treino => (
                                  <div key={treino.id} className="history-card-personal glass">
                                      <h4>{treino.name}</h4>
                                      <p>{new Date(treino.createdAt).toLocaleDateString()}</p>
                                  </div>
                              ))
                          )}
                      </div>
                      <button className="btn-create-for" onClick={() => navigate("/criar-treino", { state: { studentId: selectedStudent.id } })}>
                          Prescrever Novo Treino
                      </button>
                  </div>
              </div>
          </div>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
};
