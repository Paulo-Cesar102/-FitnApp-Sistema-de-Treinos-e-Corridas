import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../api/notificationService";
import "./NotificationModal.css";

// Ícones Minimalistas Premium
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const TrophyIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/><path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5z"/></svg>;
const CheckCircleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const InfoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

export default function NotificationModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (notif) => {
    try {
      // 1. Marca como lida no backend
      if (!notif.isRead) {
        await notificationService.markRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      }

      // 2. Lógica de Redirecionamento Baseado no Tipo
      if (notif.type === "GYM_ANNOUNCEMENT") {
          onClose(); // Fecha o dropdown
          navigate("/academy", { state: { activeTab: "news" } }); // Redireciona com sugestão de aba
      } else if (notif.type === "FRIEND_REQUEST") {
          onClose();
          navigate("/amigos");
      } else if (notif.type === "BADGE_EARNED") {
          onClose();
          navigate("/perfil");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!notifications.some(n => !n.isRead)) return;
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "FRIEND_REQUEST": return <UserIcon />;
      case "BADGE_EARNED": return <TrophyIcon />;
      case "WORKOUT_COMPLETED": return <CheckCircleIcon />;
      case "GYM_ANNOUNCEMENT": return <InfoIcon />;
      default: return <BellIcon />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notif-overlay-v4" onClick={onClose}>
      <div className="notif-dropdown-v4" onClick={e => e.stopPropagation()}>
        <header className="notif-header-v4">
          <div className="header-title-box">
             <h3>Notificações</h3>
             {unreadCount > 0 && <span className="unread-badge">{unreadCount} NOVAS</span>}
          </div>
          <div className="header-actions-box">
             <button 
                className="btn-mark-all" 
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
             >
               Limpar Tudo
             </button>
          </div>
        </header>

        <main className="notif-content-v4">
          {loading ? (
            <div className="notif-loader-box">
               <div className="premium-spinner"></div>
               <span>Sincronizando atualizações...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty-box">
              <div className="empty-icon-circle"><BellIcon /></div>
              <h4>Sem avisos recentes</h4>
              <p>Fique tranquilo! Avisaremos você assim que algo novo acontecer.</p>
            </div>
          ) : (
            <div className="notif-scroll-area">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notif-card-v4 ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleMarkRead(notif)}
                >
                  <div className={`notif-icon-box ${notif.type?.toLowerCase()}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="notif-text-info">
                    <div className="title-row">
                      <h4>{notif.title}</h4>
                      {!notif.isRead && <span className="active-dot"></span>}
                    </div>
                    <p className="message-body">{notif.message}</p>
                    <div className="footer-row">
                       <span className="time-label">
                         {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>

                  <button className="btn-delete-item" onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }} title="Remover">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="notif-footer-v4">
           <button className="btn-full-view" onClick={onClose}>FECHAR PAINEL</button>
        </footer>
      </div>
    </div>
  );
}
