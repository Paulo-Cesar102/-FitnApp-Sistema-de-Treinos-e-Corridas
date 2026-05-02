import React, { useState, useEffect, useCallback } from "react";
import { gymService } from "../api/gymService";
import { socket } from "../service/socket";
import "./GymAnnouncements.css";

// --- Ícones Minimalistas ---
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const MegaPhoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;

export default function GymAnnouncements({ gymId: propGymId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Usa o gymId passado por prop ou busca no storage como fallback
  const gymId = propGymId || sessionStorage.getItem("gymId");

  const load = useCallback(async () => {
    if (!gymId || gymId === "null") {
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const data = await gymService.getGymAnnouncements(gymId, page);
      // Suporta tanto retorno paginado quanto array direto
      if (data && data.announcements) {
         setAnnouncements(data.announcements);
         setTotalPages(data.pagination?.pages || 1);
      } else {
         setAnnouncements(data || []);
         setTotalPages(1);
      }
    } catch (err) {
      console.error("Erro ao carregar comunicados:", err);
    } finally {
      setLoading(false);
    }
  }, [gymId, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!gymId) return;

    // Escuta atualizações em tempo real
    socket.on("announcement_updated", (data) => {
      if (data.gymId === gymId) {
        load();
      }
    });

    return () => {
      socket.off("announcement_updated");
    };
  }, [gymId, load]);

  if (loading && page === 1) return <div className="loading-shimmer">Buscando comunicados oficiais...</div>;

  return (
    <div className="news-section-v4">
      <header className="news-header-mini">
         <MegaPhoneIcon />
         <span>ÚLTIMAS ATUALIZAÇÕES DA UNIDADE</span>
      </header>

      <div className="announcements-grid-v4">
        {announcements.length === 0 ? (
          <div className="empty-state-news glass">
             <BellIcon />
             <p>Nenhum comunicado importante no momento.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className={`ann-card-v4 ${a.type === 'URGENT' ? 'urgent' : ''}`}>
              <div className="ann-badge-row">
                 <span className="ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                 {a.type === 'URGENT' && <span className="urgent-label">IMPORTANTE</span>}
              </div>
              <h4 className="ann-title">{a.title}</h4>
              <p className="ann-body">{a.content}</p>
              <div className="ann-footer-line"></div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-v4">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="btn-page"
          >
            ANTERIOR
          </button>
          <span className="page-indicator">{page} / {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="btn-page"
          >
            PRÓXIMA
          </button>
        </div>
      )}
    </div>
  );
}
