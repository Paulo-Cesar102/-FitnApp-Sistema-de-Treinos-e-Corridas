import React, { useState, useEffect } from "react";
import { gymService } from "../api/gymService";
import { socket } from "../service/socket";

export default function GymAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null" && gymId !== "undefined") {
      loadAnnouncements(gymId, 1);
    } else {
      setLoading(false);
    }

    if (socket && gymId) {
      socket.emit("join_gym_room", gymId);

      const handleNewAnnouncement = (data) => {
        if (data.gymId === gymId) {
          loadAnnouncements(gymId, 1);
        }
      };

      socket.on("announcement_updated", handleNewAnnouncement);

      return () => {
        socket.off("announcement_updated", handleNewAnnouncement);
        socket.emit("leave_gym_room", gymId);
      };
    }
  }, [gymId]);

  const loadAnnouncements = async (gId, p = 1) => {
    setLoading(true);
    try {
      const data = await gymService.getGymAnnouncements(gId, p, 10);
      setAnnouncements(data.announcements);
      setTotalPages(data.pagination.pages);
      setPage(p);
    } catch (error) {
      console.error("Erro ao carregar avisos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 2: return { label: "🔴 URGENTE", color: "#ff4d4d" };
      case 1: return { label: "⭐ IMPORTANTE", color: "#ffd700" };
      default: return { label: "📌 NORMAL", color: "#4ecdc4" };
    }
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-panel-msg">Você não está vinculado a uma academia.</div>;
  }

  return (
    <div className="announcements-container fade-in">
      <div className="checkin-header" style={{ marginBottom: "30px" }}>
        <div className="icon-pulse" style={{ color: "#4ecdc4", textShadow: "0 0 15px rgba(78, 205, 196, 0.4)" }}>📢</div>
        <h2>Avisos da Academia</h2>
        <p>Fique por dentro das novidades e comunicados</p>
      </div>

      {loading && !announcements.length ? (
        <div className="loader-text" style={{ textAlign: 'center', padding: '40px' }}>Buscando avisos...</div>
      ) : (
        <>
          <div className="announcements-list">
            {announcements.length === 0 ? (
              <div className="empty-panel-msg">Nenhum aviso no momento.</div>
            ) : (
              announcements.map((announcement) => {
                const priorityInfo = getPriorityInfo(announcement.priority);
                return (
                  <div key={announcement.id} className="announcement-card glass" style={{ padding: "20px", borderRadius: "15px", marginBottom: "15px", borderLeft: `4px solid ${priorityInfo.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>{announcement.title}</h3>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: priorityInfo.color, padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                        {priorityInfo.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-dim)", lineHeight: "1.5", margin: "10px 0" }}>
                      {announcement.content}
                    </p>
                    <div style={{ fontSize: "0.8rem", color: "#888", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", marginTop: "10px" }}>
                      Publicado em {new Date(announcement.createdAt).toLocaleDateString("pt-BR")} às {new Date(announcement.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "30px" }}>
              <button 
                onClick={() => loadAnnouncements(gymId, page - 1)} 
                disabled={page === 1}
                style={{ padding: "8px 15px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "8px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
              >
                ◀️ Anterior
              </button>
              <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Página {page} de {totalPages}</span>
              <button 
                onClick={() => loadAnnouncements(gymId, page + 1)} 
                disabled={page === totalPages}
                style={{ padding: "8px 15px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "white", borderRadius: "8px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}
              >
                Próxima ▶️
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
