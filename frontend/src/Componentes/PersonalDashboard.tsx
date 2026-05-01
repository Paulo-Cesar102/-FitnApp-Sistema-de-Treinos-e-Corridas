import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gymService } from "../api/gymService";
import { getUserWorkouts } from "../api/workoutService";
import { socket } from "../service/socket";
import "./PersonalDashboard.css";
import CustomAlert from "./CustomAlert";

// Ícones Minimalistas
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClipboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ActivityIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

interface PersonalDashboardProps {
  gymId: string;
  gymName: string;
  onLogout: () => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ gymId, gymName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"students" | "workouts">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();

    socket.on("live_activity_update", (data) => {
      setLiveActivities(data);
    });

    return () => {
      socket.off("live_activity_update");
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userJson = localStorage.getItem("user");
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

  return (
    <div className="personal-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><ActivityIcon /></div>
          <h2>Painel Personal</h2>
          <p className="gym-name-subtitle">{gymName}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <UsersIcon /> Alunos
          </button>
          <button
            className={`nav-item ${activeTab === "workouts" ? "active" : ""}`}
            onClick={() => setActiveTab("workouts")}
          >
            <ClipboardIcon /> Meus Treinos
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout-dash" onClick={onLogout}>
            <LogoutIcon /> Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {activeTab === "students" && (
          <div className="tab-content fade-in">
             <header className="content-header">
                <div className="header-text">
                    <h1>Seus Alunos</h1>
                    <p>Acompanhe o progresso e atividades em tempo real</p>
                </div>
             </header>

             <div className="students-grid">
                 {loading ? (
                    <div className="empty-state glass"><p>Buscando equipe...</p></div>
                 ) : students.length === 0 ? (
                     <div className="empty-state glass">
                         <p>Voce ainda nao tem alunos vinculados.</p>
                     </div>
                 ) : (
                     students.map((item) => {
                       const isOnline = liveActivities.some(act => act.studentName === item.student.name && act.status === "started");
                       return (
                         <div key={item.id} className={`student-card glass ${isOnline ? 'online' : ''}`}>
                             {isOnline && <span className="online-badge">EM ATIVIDADE</span>}
                             <div className="student-avatar">
                                 {item.student.name.charAt(0)}
                             </div>
                             <div className="student-info">
                                 <h3>{item.student.name}</h3>
                                 <p>Nivel {item.student.level} • {item.student.xp} XP</p>
                                 <span className="assigned-date">Desde: {new Date(item.assignedAt).toLocaleDateString()}</span>
                             </div>
                             <div className="card-actions">
                               <button 
                                 className="btn-action-view"
                                 onClick={() => {
                                    setSelectedStudent(item.student);
                                    loadStudentHistory(item.student.id);
                                 }}
                               >
                                 Ver Detalhes
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
            <div className="tab-content fade-in">
                <header className="content-header">
                    <div className="header-text">
                        <h1>Biblioteca de Treinos</h1>
                        <p>Gerencie os modelos de treinos para seus alunos</p>
                    </div>
                    <button className="btn-primary-dash" onClick={() => navigate("/criar-treino")}>
                        Novo Modelo
                    </button>
                </header>
                <div className="empty-state glass">
                    <p>Funcionalidade de gerenciamento de modelos em desenvolvimento.</p>
                </div>
            </div>
        )}

        {selectedStudent && (
            <div className="student-detail-overlay fade-in" onClick={() => setSelectedStudent(null)}>
                <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
                    <header>
                        <div className="student-header-info">
                            <div className="avatar-large">{selectedStudent.name.charAt(0)}</div>
                            <div>
                                <h2>{selectedStudent.name}</h2>
                                <p>{selectedStudent.email}</p>
                            </div>
                        </div>
                        <button className="btn-close" onClick={() => setSelectedStudent(null)}>&times;</button>
                    </header>
                    
                    <div className="modal-body-personal">
                        <h3>Historico de Planos</h3>
                        <div className="history-list-personal">
                            {historyLoading ? <p>Carregando historico...</p> : studentHistory.length === 0 ? (
                                <p>Este aluno ainda nao possui treinos criados.</p>
                            ) : (
                                studentHistory.map(treino => (
                                    <div key={treino.id} className="history-card-personal glass">
                                        <div className="card-header">
                                            <h4>{treino.name}</h4>
                                            <span>{treino.exercises?.length || 0} exercicios</span>
                                        </div>
                                        <div className="card-footer">
                                            <span>Criado em: {new Date(treino.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <footer className="modal-footer-personal">
                        <button className="btn-create-for" onClick={() => navigate("/criar-treino", { state: { studentId: selectedStudent.id } })}>
                            Criar Novo Plano para {selectedStudent.name.split(" ")[0]}
                        </button>
                    </footer>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
