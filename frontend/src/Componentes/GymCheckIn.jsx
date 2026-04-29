import React, { useState, useEffect } from "react";
import * as gymService from "../api/gymService";
import { socket } from "../service/socket";
import "./GymCheckIn.css";

// Ícones Minimalistas
const MapPinIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const FlameIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

export default function GymCheckIn() {
  const [loading, setLoading] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");
  const [monthlyCount, setMonthlyCount] = useState(0);

  const userId = localStorage.getItem("userId");
  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null" && gymId !== "undefined") {
      loadCheckInData(gymId);
    } else {
      setMessage("Você não está vinculado a nenhuma academia.");
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
      setMessage("Você não está vinculado a uma academia.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await gymService.performCheckIn(gymId);

      setMessage("Check-in realizado com sucesso.");
      loadCheckInData(gymId);

      if (socket && userId) {
        socket.emit("new_checkin", { gymId, userId });
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || "Erro ao realizar check-in");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container fade-in">
      <div className="checkin-header">
        <div className="icon-pulse">
           <MapPinIcon />
        </div>
        <h2>Seu Treino de Hoje</h2>
        <p>Registre sua presença para ganhar XP e subir no ranking</p>
      </div>

      {message && (
        <div className={`toast-message ${message.toLowerCase().includes("erro") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <button
        className={`main-checkin-btn ${loading ? "loading" : ""} neon-glow`}
        onClick={handleCheckIn}
        disabled={loading || !gymId || gymId === "null"}
      >
        {loading ? "Processando..." : "REGISTRAR PRESENÇA AGORA"}
      </button>

      {gymId && gymId !== "null" && (
        <>
          <div className="stats-grid">
            <div className="stat-card glass">
              <span className="stat-icon"><FlameIcon /></span>
              <div className="stat-info">
                <span className="stat-value">{streak}</span>
                <span className="stat-label">Dias Seguidos</span>
              </div>
            </div>
            <div className="stat-card glass">
              <span className="stat-icon"><CalendarIcon /></span>
              <div className="stat-info">
                <span className="stat-value">{monthlyCount}</span>
                <span className="stat-label">Presenças no Mês</span>
              </div>
            </div>
          </div>

          <div className="history-section">
            <h3>Histórico Recente</h3>
            <div className="history-list">
              {checkInHistory.length === 0 ? (
                <p className="empty-msg">Nenhum registro encontrado.</p>
              ) : (
                checkInHistory.map((ci) => (
                  <div key={ci.id} className="history-item glass">
                    <span className="date">
                      {new Date(ci.checkedInAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                      })}
                    </span>
                    <span className="time">
                      {new Date(ci.checkedInAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="bonus">+{ci.streakBonus} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
