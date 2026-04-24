import React, { useState, useEffect } from "react";
import { gymService } from "../api/gymService";
import { socket } from "../service/socket";

export default function GymCheckIn() {
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [monthlyCount, setMonthlyCount] = useState(0);

  const userId = localStorage.getItem("userId");
  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null" && gymId !== "undefined") {
      loadCheckInData(gymId);
    } else {
      setMessage("⚠️ Você não está vinculado a nenhuma academia.");
    }
  }, [gymId]);

  const loadCheckInData = async (gId) => {
    if (!userId) return;
    try {
      const histData = await gymService.getUserCheckIns(userId, gId);
      setCheckInHistory(histData);

      const streakData = await gymService.getCheckInStreak(userId, gId);
      setStreak(streakData.streak);

      const monthData = await gymService.getMonthlyCheckInCount(userId, gId);
      setMonthlyCount(monthData.monthlyCount);
    } catch (error) {
      console.error("Erro ao carregar dados do check-in:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!gymId || gymId === "null" || gymId === "undefined") {
      setMessage("❌ Você não está vinculado a uma academia.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await gymService.performCheckIn(gymId);
      
      setMessage("✅ Check-in realizado com sucesso!");
      loadCheckInData(gymId);
      
      if (socket && userId) {
        socket.emit("new_checkin", { gymId, userId });
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || error.message || "Erro ao fazer check-in"}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container fade-in">
      <div className="checkin-header">
        <div className="icon-pulse">📍</div>
        <h2>Seu Treino de Hoje</h2>
        <p>Faça o check-in para ganhar XP e subir no ranking!</p>
      </div>

      {message && (
        <div className={`toast-message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <button 
        className={`main-checkin-btn ${loading ? "loading" : ""} neon-glow`} 
        onClick={handleCheckIn} 
        disabled={loading || !gymId || gymId === "null"}
      >
        {loading ? "Registrando..." : "FAZER CHECK-IN AGORA"}
      </button>

      {gymId && gymId !== "null" && (
        <>
          <div className="stats-grid">
            <div className="stat-card glass">
              <span className="stat-icon">🔥</span>
              <div className="stat-info">
                <span className="stat-value">{streak}</span>
                <span className="stat-label">Dias Seguidos</span>
              </div>
            </div>
            <div className="stat-card glass">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <span className="stat-value">{monthlyCount}</span>
                <span className="stat-label">Check-ins no Mês</span>
              </div>
            </div>
          </div>

          {checkInHistory.length > 0 && (
            <div className="history-section glass">
              <h3>Últimos Check-ins</h3>
              <div className="history-list">
                {checkInHistory.slice(0, 5).map((check) => (
                  <div key={check.id} className="history-item">
                    <div className="history-date">
                      <span className="date-icon">🗓️</span>
                      {new Date(check.checkedInAt).toLocaleDateString("pt-BR")} às {new Date(check.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="history-xp">+{check.streakBonus} XP</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
