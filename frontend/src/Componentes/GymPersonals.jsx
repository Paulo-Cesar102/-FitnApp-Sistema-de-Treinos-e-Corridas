import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gymService } from "../api/gymService";
import "./GymPersonals.css";

// --- Ícones Minimalistas ---
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ChevronDownIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUpIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const PlayIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

export default function GymPersonals() {
  const [personals, setPersonals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonalId, setSelectedPersonalId] = useState(null);
  const [personalWorkouts, setPersonalWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const navigate = useNavigate();
  const gymId = sessionStorage.getItem("gymId");
  const currentUserId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (gymId && gymId !== "null") {
      loadPersonals();
    }
  }, [gymId]);

  const loadPersonals = async () => {
    try {
      setLoading(true);
      const data = await gymService.getGymPersonals(gymId);
      setPersonals(data || []);
    } catch (error) {
      console.error("Erro ao carregar personals:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const loadPersonalWorkouts = async (pUserId) => {
    if (selectedPersonalId === pUserId) {
      setSelectedPersonalId(null);
      return;
    }
    
    try {
      setSelectedPersonalId(pUserId);
      setWorkoutsLoading(true);
      const data = await gymService.getPersonalWorkouts(pUserId);
      setPersonalWorkouts(data || []);
    } catch (error) {
      console.error("Erro ao carregar treinos do personal:", error);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleEnroll = async (pId, e) => {
    e.stopPropagation();
    try {
      await gymService.enrollWithPersonal(pId);
      showToast("Solicitação enviada com sucesso.");
      loadPersonals();
    } catch (error) {
      showToast("Erro ao solicitar suporte técnico.", "error");
    }
  };

  const handleUnsubscribe = async (pId, e) => {
    e.stopPropagation();
    try {
      await gymService.unsubscribeFromPersonal(pId);
      showToast("Vínculo técnico finalizado.");
      loadPersonals();
    } catch (error) {
      showToast("Erro ao remover vínculo.", "error");
    }
  };

  const startTraining = (workout) => {
    navigate("/executar-treino", { state: { workout: JSON.parse(JSON.stringify(workout)) } });
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-state-card">Vínculo com unidade não detectado.</div>;
  }

  return (
    <div className="personals-section-v4">
      {toast.show && (
        <div className={`system-toast ${toast.type}`}>
          {toast.message.toUpperCase()}
        </div>
      )}

      {loading && !personals.length ? (
        <div className="loading-shimmer">Carregando equipe técnica...</div>
      ) : (
        <div className="personals-grid-v4">
          {personals.length === 0 ? (
            <div className="empty-state-mini">Nenhum instrutor disponível nesta unidade.</div>
          ) : (
            personals.map((personal) => {
              const isEnrolled = personal.students?.some(s => s.studentId === currentUserId);
              const isExpanded = selectedPersonalId === personal.userId;

              return (
                <div key={personal.id} className={`personal-card-v4 ${isEnrolled ? 'enrolled' : ''}`}>
                  {isEnrolled && <span className="status-badge-premium">MEU INSTRUTOR</span>}

                  <div className="card-header-v4" onClick={() => loadPersonalWorkouts(personal.userId)}>
                    <div className="avatar-v4">
                      {personal.user?.name ? personal.user.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="info-v4">
                      <h4>{personal.user?.name || "Instrutor"}</h4>
                      <span className="spec-tag-v4">{personal.specialization || "Suporte Técnico"}</span>
                    </div>
                    <div className="expand-icon-v4">
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </div>
                  </div>

                  <div className="card-actions-v4">
                    {isEnrolled ? (
                      <button className="btn-action-v4 danger" onClick={(e) => handleUnsubscribe(personal.id, e)}>
                        REMOVER VÍNCULO
                      </button>
                    ) : (
                      currentUserId !== personal.userId && (
                        <button className="btn-action-v4 primary" onClick={(e) => handleEnroll(personal.id, e)}>
                          SOLICITAR SUPORTE
                        </button>
                      )
                    )}
                  </div>

                  {isExpanded && (
                    <div className="drawer-workouts-v4 animated-up">
                      <div className="drawer-header">
                        <UsersIcon />
                        <span>Biblioteca de Treinos</span>
                      </div>
                      
                      {workoutsLoading ? (
                        <div className="mini-loader">Buscando planos...</div>
                      ) : personalWorkouts.length === 0 ? (
                        <div className="mini-empty">Nenhum plano publicado.</div>
                      ) : (
                        <div className="workouts-list-v4">
                          {personalWorkouts.map(w => (
                            <div key={w.id} className="workout-item-v4">
                              <div className="w-info">
                                  <span className="w-name">{w.name}</span>
                                  <span className="w-meta">{w.exercises?.length || 0} exercícios</span>
                              </div>
                              <button className="btn-start-mini" onClick={(e) => { e.stopPropagation(); startTraining(w); }}>
                                  <PlayIcon />
                                  <span>INICIAR</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
