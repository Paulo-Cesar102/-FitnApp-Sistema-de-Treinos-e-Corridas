import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as gymService from "../api/gymService";
import "./GymPersonals.css";

const UsersIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ChevronDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

export default function GymPersonals() {
  const [personals, setPersonals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonalId, setSelectedPersonalId] = useState(null);
  const [personalWorkouts, setPersonalWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();
  const gymId = localStorage.getItem("gymId");
  const currentUserId = localStorage.getItem("userId");

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
      setMessage("Inscrição realizada com sucesso.");
      loadPersonals();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erro ao solicitar inscrição.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUnsubscribe = async (pId, e) => {
    e.stopPropagation();
    try {
      await gymService.unsubscribeFromPersonal(pId);
      setMessage("Vínculo removido com sucesso.");
      loadPersonals();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erro ao remover vínculo.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const startTraining = (workout) => {
    navigate("/executar-treino", { state: { workout: JSON.parse(JSON.stringify(workout)) } });
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-panel-msg">Você não está vinculado a uma academia.</div>;
  }

  return (
    <div className="personals-container fade-in">
      <div className="checkin-header" style={{ marginBottom: "30px" }}>
        <div className="icon-pulse" style={{ color: "var(--primary-color)" }}>
          <UsersIcon />
        </div>
        <h2>Equipe de Instrutores</h2>
        <p>Conheça os profissionais e seus treinos disponíveis</p>
      </div>

      {message && (
        <div className={`toast-message ${message.toLowerCase().includes("erro") ? "error" : "success"}`} style={{
          position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '12px', zIndex: 1000,
          background: message.toLowerCase().includes("erro") ? 'rgba(255, 77, 77, 0.95)' : 'rgba(78, 205, 196, 0.95)', 
          color: 'white', fontWeight: '800', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {message.toUpperCase()}
        </div>
      )}

      {loading && !personals.length ? (
        <div className="loader-text" style={{ textAlign: 'center', padding: '40px' }}>Buscando equipe técnica...</div>
      ) : (
        <div className="personals-list-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", display: "grid", gap: "20px" }}>
          {personals.length === 0 ? (
            <div className="empty-panel-msg" style={{ gridColumn: "1 / -1" }}>
              Nenhum personal cadastrado nesta unidade.
            </div>
          ) : (
            personals.map((personal) => {
              const isEnrolled = personal.students?.some(s => s.studentId === currentUserId);

              return (
                <div key={personal.id} className={`personal-card-new glass ${isEnrolled ? 'enrolled' : ''}`} style={{ padding: "20px", borderRadius: "18px", border: "1px solid var(--border-color)", cursor: "pointer", transition: "all 0.3s", position: 'relative' }} onClick={() => loadPersonalWorkouts(personal.userId)}>
                  {isEnrolled && <span style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--primary-color)', color: 'white', fontSize: '0.65rem', padding: '5px 12px', borderRadius: '20px', fontWeight: '900', letterSpacing: '0.5px' }}>MEU INSTRUTOR</span>}

                  <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                    <div className="avatar" style={{ width: "52px", height: "52px", background: "var(--primary-color)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.4rem", color: "white" }}>
                      {personal.user?.name ? personal.user.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="header-info" style={{ flex: 1 }}>
                      <h3 style={{ margin: "0", fontSize: "1rem", fontWeight: '800', color: "var(--text-main)" }}>{personal.user?.name || "Personal"}</h3>
                      <span className="spec-tag" style={{ fontSize: "0.7rem", color: "var(--primary-color)", background: "rgba(255, 69, 0, 0.1)", padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase", fontWeight: "800", display: "inline-block", marginTop: "5px" }}>
                        {personal.specialization || "Instrutor"}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions-personal">
                    {isEnrolled ? (
                      <button
                        onClick={(e) => handleUnsubscribe(personal.id, e)}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)', color: '#ff4d4d', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', fontSize: '0.75rem' }}
                      >
                        REMOVER VÍNCULO
                      </button>
                    ) : (
                      currentUserId !== personal.userId && (
                        <button
                          onClick={(e) => handleEnroll(personal.id, e)}
                          style={{ width: '100%', padding: '12px', background: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', fontSize: '0.75rem', boxShadow: '0 6px 15px var(--primary-glow)' }}
                        >
                          SOLICITAR ACOMPANHAMENTO
                        </button>
                      )
                    )}
                  </div>

                  <div className="card-footer" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "15px", marginTop: "5px", textAlign: "center", color: "var(--primary-color)", fontSize: "0.75rem", fontWeight: "800", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {selectedPersonalId === personal.userId ? "OCULTAR TREINOS" : "VER TREINOS"}
                    {selectedPersonalId === personal.userId ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {selectedPersonalId === personal.userId && (
                    <div className="personal-workouts-drawer fade-in" style={{ marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                      {workoutsLoading ? (
                        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>Carregando biblioteca...</p>
                      ) : personalWorkouts.length === 0 ? (
                        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>Este instrutor ainda não publicou treinos.</p>
                      ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {personalWorkouts.map(w => (
                            <li key={w.id} style={{ padding: "12px", background: "var(--bg-card-alt)", border: '1px solid var(--border-color)', borderRadius: "12px", marginBottom: "10px", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontWeight: "800", color: "var(--text-main)" }}>{w.name}</span>
                                  <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: '700' }}>{w.exercises?.length || 0} EXERCÍCIOS</span>
                              </div>
                              <button
                                  onClick={(e) => { e.stopPropagation(); startTraining(w); }}
                                  style={{ padding: "8px 16px", background: "var(--primary-color)", border: "none", color: "white", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "900", cursor: "pointer", boxShadow: '0 4px 10px var(--primary-glow)' }}
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
    </div>
  );
}
