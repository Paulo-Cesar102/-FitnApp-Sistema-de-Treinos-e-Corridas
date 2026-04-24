import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gymService } from "../api/gymService";
import { workoutService } from "../api/workoutService";
import { socket } from "../service/socket";
import CustomAlert from "./CustomAlert";

export default function GymPersonals() {
  const navigate = useNavigate();
  const [personals, setPersonals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedPersonalId, setSelectedPersonalId] = useState(null);
  const [personalWorkouts, setPersonalWorkouts] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const gymId = localStorage.getItem("gymId");

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setAlertConfig({
      isOpen: true, 
      title, 
      message, 
      type: "warning", 
      confirmText: "Sim, Sair", 
      cancelText: "Cancelar",
      onConfirm, 
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  useEffect(() => {
    if (gymId && gymId !== "null" && gymId !== "undefined") {
      loadPersonals(gymId);
    } else {
      setLoading(false);
    }

    if (socket && gymId) {
      socket.emit("join_gym_room", gymId);

      const handleNewPersonal = (data) => {
        if (data.gymId === gymId) {
          loadPersonals(gymId);
        }
      };

      socket.on("personal_updated", handleNewPersonal);

      return () => {
        socket.off("personal_updated", handleNewPersonal);
        socket.emit("leave_gym_room", gymId);
      };
    }
  }, [gymId]);

  const loadPersonals = async (gId) => {
    setLoading(true);
    try {
      const data = await gymService.getGymPersonals(gId);
      setPersonals(data);
    } catch (error) {
      console.error("Erro ao carregar personals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalWorkouts = async (userId) => {
    if (selectedPersonalId === userId) {
      setSelectedPersonalId(null);
      setPersonalWorkouts([]);
      return;
    }
    
    try {
      const data = await workoutService.getUserWorkouts(userId);
      setPersonalWorkouts(data);
      setSelectedPersonalId(userId);
    } catch (err) {
      setMessage("Erro ao carregar treinos deste personal");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const currentUserId = localStorage.getItem("userId");

  const handleEnroll = async (personalId, e) => {
    e.stopPropagation();
    try {
      await gymService.assignStudent(personalId);
      showAlert("Sucesso", "Você agora está inscrito com este personal!", "success");
      
      // Atualiza o localStorage para o ExecutarTreino saber para quem enviar o sinal
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.personalSubscriptions) user.personalSubscriptions = [];
      user.personalSubscriptions.push(personalId);
      localStorage.setItem("user", JSON.stringify(user));
      
      loadPersonals(gymId);

      if (socket) {
        socket.emit("student_enrolled", { personalId });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao se inscrever";
      showAlert("Atenção", errorMsg, "error");
    }
  };

  const handleUnsubscribe = async (personalId, e) => {
    e.stopPropagation();
    
    showConfirm("Sair do Personal", "Tem certeza que deseja encerrar o acompanhamento? Você só poderá se inscrever em um novo personal após 24 horas.", async () => {
      setAlertConfig({ isOpen: false });
      try {
        await gymService.removeStudent(personalId, currentUserId);
        
        // Remove do localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.personalSubscriptions) {
          user.personalSubscriptions = user.personalSubscriptions.filter(id => id !== personalId);
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        showAlert("Sucesso", "Você encerrou o acompanhamento com sucesso.", "success");
        loadPersonals(gymId);
      } catch (err) {
        showAlert("Erro", "Não foi possível processar sua saída. Tente novamente.", "error");
      }
    });
  };

  const startTraining = (workout) => {
    if (workout?.exercises?.length > 0) {
      const workoutSeguro = JSON.parse(JSON.stringify(workout));
      navigate("/executar-treino", { state: { workout: workoutSeguro } });
    } else {
      showAlert("Atenção", "Este treino ainda não possui exercícios cadastrados.", "error");
    }
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-panel-msg">Você não está vinculado a uma academia.</div>;
  }

  return (
    <div className="personals-container fade-in">
      <div className="checkin-header" style={{ marginBottom: "30px" }}>
        <div className="icon-pulse" style={{ color: "#ff4500", textShadow: "0 0 15px rgba(255, 69, 0, 0.4)" }}>💪</div>
        <h2>Equipe de Personals</h2>
        <p>Conheça os instrutores e seus treinos disponíveis</p>
      </div>

      {message && (
        <div className={`toast-message ${message.includes("❌") || message.includes("Erro") ? "error" : "success"}`} style={{
          position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '10px', zIndex: 1000, 
          background: message.includes("❌") ? 'rgba(255, 77, 77, 0.9)' : 'rgba(78, 205, 196, 0.9)', color: 'white', fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      {loading && !personals.length ? (
        <div className="loader-text" style={{ textAlign: 'center', padding: '40px' }}>Buscando equipe...</div>
      ) : (
        <div className="personals-list-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", display: "grid", gap: "20px" }}>
          {personals.length === 0 ? (
            <div className="empty-panel-msg" style={{ gridColumn: "1 / -1" }}>
              Nenhum personal cadastrado nesta academia.
            </div>
          ) : (
            personals.map((personal) => {
              const isEnrolled = personal.students?.some(s => s.studentId === currentUserId);
              
              return (
                <div key={personal.id} className={`personal-card-new glass ${isEnrolled ? 'enrolled' : ''}`} style={{ padding: "20px", borderRadius: "15px", border: "1px solid var(--glass-border)", cursor: "pointer", transition: "all 0.3s", position: 'relative' }} onClick={() => loadPersonalWorkouts(personal.userId)}>
                  {isEnrolled && <span style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--accent-neon)', color: 'white', fontSize: '0.6rem', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>MEU PERSONAL</span>}
                  
                  <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                    <div className="avatar" style={{ width: "50px", height: "50px", background: "var(--accent-neon)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.5rem" }}>
                      {personal.user?.name ? personal.user.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="header-info" style={{ flex: 1 }}>
                      <h3 style={{ margin: "0", fontSize: "1.1rem", color: "var(--text-main)" }}>{personal.user?.name || "Personal"}</h3>
                      <span className="spec-tag" style={{ fontSize: "0.75rem", color: "var(--accent-neon)", background: "rgba(255, 69, 0, 0.1)", padding: "2px 8px", borderRadius: "5px", textTransform: "uppercase", fontWeight: "600", display: "inline-block", marginTop: "5px" }}>
                        {personal.specialization || "Instrutor"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "15px", lineHeight: "1.4" }}>
                      {personal.bio || "Sem descrição disponível no momento."}
                    </p>
                    
                    {isEnrolled ? (
                      <button 
                        onClick={(e) => handleUnsubscribe(personal.id, e)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#ff4d4d', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
                      >
                        Sair do Personal
                      </button>
                    ) : (
                      currentUserId !== personal.userId && (
                        <button 
                          onClick={(e) => handleEnroll(personal.id, e)}
                          style={{ width: '100%', padding: '10px', background: 'var(--accent-neon)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}
                        >
                          Inscrever-se
                        </button>
                      )
                    )}
                  </div>
                  
                  <div className="card-footer" style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "15px", marginTop: "5px", textAlign: "center", color: "var(--accent-neon)", fontSize: "0.85rem", fontWeight: "600" }}>
                    {selectedPersonalId === personal.userId ? "Ocultar Treinos ▲" : "Ver Treinos ▼"}
                  </div>

                {selectedPersonalId === personal.userId && (
                  <div className="personal-workouts-list slide-down" style={{ marginTop: "15px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }} onClick={(e) => e.stopPropagation()}>
                    <h4 style={{ fontSize: "0.9rem", marginBottom: "10px", color: "var(--text-main)", textTransform: "uppercase" }}>Treinos Criados</h4>
                    {personalWorkouts.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Nenhum treino público.</p>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {personalWorkouts.map(w => (
                          <li key={w.id} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", marginBottom: "8px", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{w.name}</span>
                                <span style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>{w.exercises?.length || 0} exercícios</span>
                            </div>
                            <button 
                                onClick={() => startTraining(w)}
                                style={{ padding: "6px 15px", background: "var(--accent-neon)", border: "none", color: "white", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                            >
                                INICIAR
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
}
