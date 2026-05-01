import React, { useState, useEffect } from "react";
import * as gymService from "../api/gymService";
import "./GymAnnouncements.css";

const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;

export default function GymAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const gymId = localStorage.getItem("gymId");

  useEffect(() => {
    if (gymId && gymId !== "null") {
      loadAnnouncements(gymId, 1);
    }
  }, [gymId]);

  const loadAnnouncements = async (gId, p) => {
    try {
      setLoading(true);
      const data = await gymService.getGymAnnouncements(gId, p);
      setAnnouncements(data.announcements || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (error) {
      console.error("Erro ao carregar avisos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!gymId || gymId === "null" || gymId === "undefined") {
    return <div className="empty-panel-msg">Você não está vinculado a uma academia.</div>;
  }

  return (
    <div className="announcements-container fade-in">
      <div className="checkin-header" style={{ marginBottom: "30px" }}>
        <div className="icon-pulse" style={{ color: "var(--primary-color)" }}>
          <BellIcon />
        </div>
        <h2>Avisos da Academia</h2>
        <p>Fique por dentro das novidades e comunicados oficiais</p>
      </div>

      {loading && !announcements.length ? (
        <div className="loader-text" style={{ textAlign: 'center', padding: '40px' }}>Buscando avisos...</div>
      ) : (
        <>
          <div className="announcements-list">
            {announcements.length === 0 ? (
              <div className="empty-panel-msg">Não há avisos publicados no momento.</div>
            ) : (
              announcements.map((ann) => {
                const priorityClass = ann.priority === 2 ? "urgent" : ann.priority === 1 ? "important" : "normal";
                return (
                  <div key={ann.id} className={`announcement-card glass ${priorityClass}`}>
                    <div className="ann-header">
                      <h3>{ann.title}</h3>
                      <span className="ann-date">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="ann-content">{ann.content}</p>
                    {ann.imageUrl && <img src={ann.imageUrl} alt={ann.title} className="ann-image" />}
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
                style={{ 
                  padding: "10px 20px", 
                  background: "var(--bg-card)", 
                  border: "1px solid var(--border-color)", 
                  color: "var(--text-main)", 
                  borderRadius: "12px", 
                  fontWeight: "700",
                  cursor: page === 1 ? "not-allowed" : "pointer", 
                  opacity: page === 1 ? 0.5 : 1 
                }}
              >
                ANTERIOR
              </button>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "800" }}>{page} / {totalPages}</span>
              <button
                onClick={() => loadAnnouncements(gymId, page + 1)}
                disabled={page === totalPages}
                style={{ 
                  padding: "10px 20px", 
                  background: "var(--bg-card)", 
                  border: "1px solid var(--border-color)", 
                  color: "var(--text-main)", 
                  borderRadius: "12px", 
                  fontWeight: "700",
                  cursor: page === totalPages ? "not-allowed" : "pointer", 
                  opacity: page === totalPages ? 0.5 : 1 
                }}
              >
                PRÓXIMA
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
