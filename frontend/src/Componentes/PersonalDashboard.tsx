import React, { useState, useEffect } from "react";
import Treinos from "../pages/Treinos";
import CriarTreino from "./CriarTreino";
import { gymService } from "../api/gymService";
import { socket } from "../service/socket";
import "./PersonalDashboard.css";

interface PersonalDashboardProps {
  gymId: string;
  gymName: string;
  onLogout: () => void;
}

interface Student {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    level: number;
    xp: number;
  };
  assignedAt: string;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  gymId,
  gymName,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"workouts" | "create" | "students">("workouts");
  const [personalProfile, setPersonalProfile] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadPersonalData();
  }, [userId]);

  useEffect(() => {
    if (personalProfile?.id && socket) {
      socket.emit("join_personal_room", personalProfile.id);

      const handleLiveActivity = (activity: any) => {
        setLiveActivities(prev => [activity, ...prev].slice(0, 5));
        // Se for conclusão, atualiza a lista de alunos para ver novo XP/Nível
        if (activity.status === "completed") {
          loadPersonalData();
        }
      };

      socket.on("live_activity", handleLiveActivity);
      socket.on("new_student_joined", () => {
        console.log("Novo aluno se inscreveu! Atualizando lista...");
        loadPersonalData();
      });

      return () => {
        socket.off("live_activity", handleLiveActivity);
        socket.off("new_student_joined");
      };
    }
  }, [personalProfile?.id]);

  const loadPersonalData = async () => {
    if (!userId) return;
    try {
      const profile = await gymService.getPersonalByUserId(userId);
      setPersonalProfile(profile);
      
      if (profile?.id) {
        const studentsData = await gymService.getPersonalStudents(profile.id);
        setStudents(studentsData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do personal:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentHistory = async (studentUserId: string) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      // Usando a rota de treinos concluídos por usuário (vamos garantir que exista)
      const workouts = await gymService.getUserCheckIns(studentUserId, gymId);
      setSelectedStudentHistory(workouts);
    } catch (err) {
      console.error("Erro ao carregar histórico do aluno:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="personal-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">💪</div>
          <h2>Painel Personal</h2>
          <p className="gym-name-subtitle">{gymName}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "workouts" ? "active" : ""}`}
            onClick={() => setActiveTab("workouts")}
          >
            <span className="icon">📋</span> Meus Treinos
          </button>
          <button
            className={`nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <span className="icon">👥</span> Meus Alunos
          </button>
          <button
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <span className="icon">➕</span> Novo Treino
          </button>
        </nav>

        {liveActivities.length > 0 && (
          <div className="live-feed glass">
            <h4>📡 Atividade ao Vivo</h4>
            {liveActivities.map((act, i) => (
              <div key={i} className={`feed-item ${act.status}`}>
                <strong>{act.studentName}</strong> 
                {act.status === "started" ? " começou " : " concluiu "} 
                <span>{act.workoutName}</span>
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-footer">
            <button onClick={onLogout} className="logout-btn">
                Sair do Sistema
            </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {activeTab === "workouts" && (
          <div className="fade-in">
            <Treinos isPersonalView={true} />
          </div>
        )}

        {activeTab === "students" && (
          <div className="fade-in">
            <div className="content-header">
                <h1>Meus Alunos</h1>
                <p>Gerencie os atletas que você acompanha</p>
            </div>
            
            <div className="students-grid">
                {students.length === 0 ? (
                    <div className="empty-state glass">
                        <p>Você ainda não tem alunos vinculados.</p>
                    </div>
                ) : (
                    students.map((item) => {
                      const isOnline = liveActivities.some(act => act.studentName === item.student.name && act.status === "started");
                      return (
                        <div key={item.id} className={`student-card glass ${isOnline ? 'online' : ''}`}>
                            {isOnline && <span className="online-badge">TREINANDO AGORA 🔥</span>}
                            <div className="student-avatar">
                                {item.student.name.charAt(0)}
                            </div>
                            <div className="student-info">
                                <h3>{item.student.name}</h3>
                                <p>Nível {item.student.level} • {item.student.xp} XP</p>
                                <span className="assigned-date">Desde: {new Date(item.assignedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="card-actions">
                              <button 
                                className="view-workouts-btn"
                                onClick={() => loadStudentHistory(item.student.id)}
                              >
                                  Histórico
                              </button>
                              <button 
                                className="create-for-btn"
                                onClick={() => {
                                  // Ir para aba de criação com este aluno pré-selecionado
                                  setActiveTab("create");
                                }}
                              >
                                ➕ Treino
                              </button>
                            </div>
                        </div>
                      );
                    })
                )}
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="fade-in">
            <CriarTreino 
              onCreated={() => setActiveTab("workouts")} 
              students={students.map(s => s.student)}
            />
          </div>
        )}
      </main>

      {showHistoryModal && (
        <div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="history-modal glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Histórico de Atividade</h2>
              <button onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {historyLoading ? (
                <p>Carregando histórico...</p>
              ) : selectedStudentHistory.length === 0 ? (
                <p>Nenhuma atividade registrada.</p>
              ) : (
                <div className="history-list">
                  {selectedStudentHistory.map((h, i) => (
                    <div key={i} className="history-item glass">
                      <div className="item-date">{new Date(h.checkedInAt || h.doneAt).toLocaleDateString()}</div>
                      <div className="item-details">
                        <strong>Check-in na Academia</strong>
                        <span>{new Date(h.checkedInAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
