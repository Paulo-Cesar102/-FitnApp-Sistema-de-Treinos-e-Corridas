import React, { useState, useEffect } from "react";
import { rankingService } from "../api/rankingService";
import "./GymRanking.css";

// --- Ícones Minimalistas ---
const TrophyIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/><path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z"/></svg>;
const ZapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function GymRanking() {
  const [stats, setStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const gymId = sessionStorage.getItem("gymId");

  useEffect(() => {
    async function load() {
      if (!gymId) return;
      try {
        setLoading(true);
        const [rankingData, positionData] = await Promise.all([
          rankingService.getGymRanking(gymId),
          rankingService.getUserRankPosition(gymId)
        ]);
        setStats(rankingData);
        setUserRank(positionData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [gymId]);

  if (loading) return <div className="loading-shimmer">Processando quadro de líderes...</div>;

  return (
    <div className="ranking-section-v4">
      {/* MEU RANKING (HIGHLIGHT) */}
      {userRank && (
        <div className="user-position-card glass">
           <div className="pos-badge">#{userRank.position}</div>
           <div className="pos-info">
              <span className="label">SUA POSIÇÃO ATUAL</span>
              <span className="name">Você está entre os {userRank.percentile}% melhores</span>
           </div>
           <div className="pos-stats">
              <div className="mini-stat"><ZapIcon /> <span>{userRank.xp} XP</span></div>
           </div>
        </div>
      )}

      {/* LISTA COMPLETA */}
      <div className="ranking-list-v4">
        {!stats || stats.length === 0 ? (
          <div className="empty-state-mini">Nenhuma atividade registrada na unidade este mês.</div>
        ) : (
          stats.map((item, index) => (
            <div key={item.userId} className={`ranking-item-v4 ${index < 3 ? `top-${index + 1}` : ''}`}>
              <div className="rank-num">
                {index < 3 ? <TrophyIcon /> : `#${index + 1}`}
              </div>
              
              <div className="rank-avatar">
                {item.user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="rank-details">
                <span className="rank-name">{item.user?.name}</span>
                <div className="rank-meta">
                   <div className="meta-pill xp"><ZapIcon /> {item.totalXpGained} XP</div>
                   <div className="meta-pill check"><CheckIcon /> {item.checkInCount} PRESENÇAS</div>
                </div>
              </div>

              {index === 0 && <div className="crown-decoration">MVP</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
