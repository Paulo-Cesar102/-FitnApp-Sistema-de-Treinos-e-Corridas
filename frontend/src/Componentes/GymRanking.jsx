import React, { useState, useEffect } from "react";
import * as gymRankingService from "../api/rankingService";
import "./GymRanking.css";

// Ícones Minimalistas
const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/><path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z"/></svg>;
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

export default function GymRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userRank, setUserRank] = useState(null);

  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null") {
      loadRanking();
    }
  }, [gymId]);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const data = await gymRankingService.getGymRanking(gymId);
      setRanking(data.ranking || []);
      setStats(data.stats || null);
      setUserRank(data.userRank || null);
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
        <div className="icon-pulse" style={{ color: "#ffd700" }}>
          <TrophyIcon />
        </div>
        <h2>Ranking da Academia</h2>
        <p>Acompanhe os líderes de presença e evolução</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label"><UsersIcon /> Membros</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--text-main)" }}>{stats.totalMembers}</span>
          </div>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label"><CheckIcon /> Presenças</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "#ffd700" }}>{stats.totalCheckIns}</span>
          </div>
          <div className="stat-card glass" style={{ flexDirection: "column", padding: "15px", gap: "5px" }}>
            <span className="stat-label"><StarIcon /> XP Total</span>
            <span className="stat-value" style={{ fontSize: "1.5rem", color: "var(--accent-neon)" }}>{stats.totalXpEarned}</span>
          </div>
        </div>
      )}

      {userRank && (
        <div className="user-rank-highlight glass">
           <div className="rank-pos">Sua Posição: <span>#{userRank.position}</span></div>
           <div className="rank-xp">{userRank.totalXpGained} XP acumulados</div>
        </div>
      )}

      <div className="ranking-list">
        {ranking.length === 0 ? (
          <p className="empty-msg">O ranking ainda está sendo processado.</p>
        ) : (
          ranking.map((item, index) => (
            <div key={item.id} className={`ranking-item glass ${index < 3 ? `top-${index + 1}` : ""}`}>
              <div className="pos">#{index + 1}</div>
              <div className="user-info">
                <div className="avatar">{item.user.name.charAt(0)}</div>
                <span className="name">{item.user.name}</span>
              </div>
              <div className="score">
                <span className="xp">{item.totalXpGained} XP</span>
                <span className="checks">{item.checkInCount} presenças</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
