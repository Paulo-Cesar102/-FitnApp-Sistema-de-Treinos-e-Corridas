import React, { useState, useEffect } from "react";
import { gymService } from "../api/gymService";
import { socket } from "../service/socket";

export default function GymRanking() {
  const [ranking, setRanking] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null" && gymId !== "undefined") {
      loadRanking(gymId);
    } else {
      setLoading(false);
    }

    if (socket && gymId) {
      socket.emit("join_gym_room", gymId);

      const handleRankingUpdate = (data) => {
        if (data.gymId === gymId) {
          loadRanking(gymId);
        }
      };

      socket.on("ranking_updated", handleRankingUpdate);

      return () => {
        socket.off("ranking_updated", handleRankingUpdate);
        socket.emit("leave_gym_room", gymId);
      };
    }
  }, [gymId]);

  const loadRanking = async (gId) => {
    setLoading(true);
    try {
      const rankData = await gymService.getGymRanking(gId);
      setRanking(rankData);

      if (userId) {
        const userRankData = await gymService.getUserRank(userId, gId);
        setUserRank(userRankData);
      }

      const statsData = await gymService.getRankingStats(gId);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-panel-msg">Você não está vinculado a uma academia para ver o ranking.</div>;
  }

  if (loading && !ranking.length) {
    return <div className="loader-text" style={{ textAlign: 'center', padding: '40px' }}>Carregando dados dos atletas...</div>;
  }

  return (
    <div className="ranking-container fade-in">
      <div className="checkin-header" style={{ marginBottom: "30px" }}>
        <div className="icon-pulse" style={{ color: "#ffd700", textShadow: "0 0 15px rgba(255, 215, 0, 0.4)" }}>🏆</div>
        <h2>Ranking da Academia</h2>
        <p>Acompanhe os líderes de check-ins e XP</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label">👥 Membros</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--text-main)" }}>{stats.totalMembers}</span>
          </div>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label">✅ Check-ins</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "#ffd700" }}>{stats.totalCheckIns}</span>
          </div>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label">⭐ XP Total</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--accent-neon)" }}>{stats.totalXpEarned}</span>
          </div>
        </div>
      )}

      {userRank && (
        <div className="user-rank-banner glass neon-border" style={{ marginTop: "20px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderRadius: "15px" }}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "var(--text-main)", fontSize: "1.1rem" }}>Sua Posição</h3>
            <p style={{ margin: "0", color: "var(--text-dim)", fontSize: "0.85rem" }}>Continue treinando para subir!</p>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Posição</span>
              <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ffd700" }}>#{userRank.position}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Check-ins</span>
              <span style={{ fontSize: "1.2rem", fontWeight: "700" }}>{userRank.checkInCount}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>XP</span>
              <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--accent-neon)" }}>{userRank.totalXpGained}</span>
            </div>
          </div>
        </div>
      )}

      <div className="ranking-panel glass">
        <div className="panel-header">
          <h3>🥇 Top Atletas</h3>
        </div>
        <div className="ranking-table">
          {ranking.slice(0, 10).map((member, index) => (
            <div key={member.id} className={`ranking-row ${member.userId === userId ? "is-current-user" : ""}`} style={{ backgroundColor: member.userId === userId ? "rgba(255, 69, 0, 0.1)" : "" }}>
              <div className="user-pos" style={{ width: "50px", fontSize: index < 3 ? "1.5rem" : "1.2rem", color: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "var(--accent-neon)" }}>
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
              </div>
              <div className="user-avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px", fontWeight: "bold" }}>
                {member.user.name.charAt(0)}
              </div>
              <div className="user-name" style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{member.user.name} {member.userId === userId ? "(Você)" : ""}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Nível {member.user.level}</div>
              </div>
              <div className="user-score" style={{ textAlign: "right" }}>
                <div style={{ color: "#ffd700", fontWeight: "700", fontSize: "1rem" }}>{member.totalXpGained} XP</div>
                <div style={{ color: "#4ecdc4", fontSize: "0.8rem", fontWeight: "600" }}>{member.checkInCount} check-ins</div>
              </div>
            </div>
          ))}
          {ranking.length === 0 && <div className="empty-panel-msg">Nenhum dado de ranking disponível.</div>}
        </div>
      </div>
    </div>
  );
}
